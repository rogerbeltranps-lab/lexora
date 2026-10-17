/* Bookmark-only cloud sync. Independent of EPUB files, narration, and flashcard sync.
   Saves immediately after add/remove; merges per bookmark, including deletion tombstones. */
import {doc,runTransaction,onSnapshot} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const PREFIX="lexora-bookmarks-";
const DELETIONS="lexora-bookmark-deletions";
const timestamp=id=>{
 const n=Number(String(id).split("-")[0]);
 return Number.isFinite(n)&&n>0&&n<8640000000000000?new Date(n).toISOString():new Date(0).toISOString();
};
function clean(input){
 const records={};
 if(!input||typeof input!=="object")return records;
 for(const [id,item] of Object.entries(input)){
  if(typeof id!=="string"||!item||typeof item!=="object"||typeof item.bookId!=="string"||!item.bookId)continue;
  const modifiedAt=typeof item.modifiedAt==="string"&&!Number.isNaN(Date.parse(item.modifiedAt))?item.modifiedAt:timestamp(id);
  if(item.deleted===true)records[id]={bookId:item.bookId,modifiedAt,deleted:true};
  else if(typeof item.cfi==="string"&&item.cfi)records[id]={bookId:item.bookId,cfi:item.cfi,label:typeof item.label==="string"?item.label:"Saved location",modifiedAt};
 }
 return records;
}
function localRecords(){
 const items={};
 try{
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith(PREFIX))continue;
   const bookId=key.slice(PREFIX.length);
   const list=JSON.parse(localStorage.getItem(key)||"[]");
   if(!Array.isArray(list))continue;
   for(const b of list)if(b&&typeof b.id==="string"&&typeof b.cfi==="string"&&b.cfi){
    items[b.id]={bookId,cfi:b.cfi,label:typeof b.label==="string"?b.label:"Saved location",modifiedAt:b.modifiedAt||timestamp(b.id)};
   }
  }
  const removed=JSON.parse(localStorage.getItem(DELETIONS)||"{}");
  for(const [id,data] of Object.entries(clean(removed)))items[id]=data;
 }catch(e){console.warn("Lexora: could not read local bookmarks",e)}
 return clean(items);
}
function merge(a,b){
 const result=clean(a);
 for(const [id,entry] of Object.entries(clean(b))){
  const old=result[id];
  const delta=(Date.parse(entry.modifiedAt)||0)-(Date.parse(old?.modifiedAt)||0);
  if(!old||delta>0||(delta===0&&entry.deleted&&!old.deleted))result[id]=entry;
 }
 return result;
}
function signature(v){return JSON.stringify(Object.entries(clean(v)).sort(([a],[b])=>a.localeCompare(b)))}
function apply(records){
 const byBook=new Map(),removed={};
 for(const [id,entry] of Object.entries(clean(records))){
  if(entry.deleted){removed[id]=entry;continue}
  if(!byBook.has(entry.bookId))byBook.set(entry.bookId,[]);
  byBook.get(entry.bookId).push({id,cfi:entry.cfi,label:entry.label,modifiedAt:entry.modifiedAt});
 }
 for(const items of byBook.values())items.sort((a,b)=>(Number(a.id.split("-")[0])||0)-(Number(b.id.split("-")[0])||0));
 try{
  const bookIds=new Set(byBook.keys());
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(key?.startsWith(PREFIX))bookIds.add(key.slice(PREFIX.length));
  }
  for(const bookId of bookIds){
   const key=PREFIX+bookId,value=JSON.stringify(byBook.get(bookId)||[]);
   if(localStorage.getItem(key)!==value)localStorage.setItem(key,value);
  }
  const removedValue=JSON.stringify(removed);
  if(localStorage.getItem(DELETIONS)!==removedValue)localStorage.setItem(DELETIONS,removedValue);
  dispatchEvent(new Event("lexora:bookmarks-refreshed"));
 }catch(e){console.warn("Lexora: could not apply cloud bookmarks",e)}
}

export function startBookmarkSync(db,uid,report=()=>{}){
 const reference=doc(db,"users",uid,"state","bookmarks");
 let stopped=false,busy=false,again=false,retry=false;
 async function synchronize(){
  if(stopped)return;
  if(busy){again=true;return}
  busy=true;
  try{
   const saved=await runTransaction(db,async tx=>{
    const snap=await tx.get(reference),remote=snap.exists()?snap.data().entries||{}:{};
    const merged=merge(remote,localRecords());
    if(signature(merged)!==signature(remote))tx.set(reference,{entries:merged,updatedAt:new Date().toISOString()});
    return merged;
   });
   if(stopped)return;
   const latest=localRecords(),merged=merge(saved,latest);
   if(signature(latest)!==signature(merged))apply(merged);
   if(signature(merged)!==signature(saved))again=true;
   retry=false;
   synced(merged);
  }catch(e){
   retry=true;
   console.warn("Lexora bookmark sync pending; bookmarks remain saved on this device",e);
   report("Marcadors: no s'han pogut desar al núvol ("+(e.code||e.message)+"). Es conserven en aquest dispositiu i es tornarà a provar.");
  }finally{
   busy=false;
   if(again&&!stopped){again=false;void synchronize()}
  }
 }
 function synced(records){
  const count=Object.values(records).filter(x=>!x.deleted).length;
  report("Marcadors: sincronitzats al núvol · "+count+" · "+new Date().toLocaleTimeString());
 }
 const changed=()=>{void synchronize()};
 const online=()=>{if(retry)void synchronize()};
 addEventListener("lexora:bookmarks-changed",changed);
 addEventListener("online",online);
 // iOS suspends the live listener while the app is in the background; catch up on return.
 const visible=()=>{if(!document.hidden)void synchronize()};
 document.addEventListener("visibilitychange",visible);
 const unsubscribe=onSnapshot(reference,snap=>{
  if(stopped||snap.metadata.fromCache||snap.metadata.hasPendingWrites)return;
  // A change from another device that lands mid-sync must not be dropped: merge it once this sync ends.
  if(busy){again=true;return}
  const remote=snap.exists()?snap.data().entries||{}:{},local=localRecords();
  const merged=merge(remote,local);
  if(signature(merged)!==signature(local))apply(merged);
  if(signature(merged)!==signature(remote))void synchronize();else synced(merged);
 },e=>{retry=true;console.warn("Lexora bookmark listener",e)});
 void synchronize();
 return()=>{stopped=true;unsubscribe();removeEventListener("lexora:bookmarks-changed",changed);removeEventListener("online",online);document.removeEventListener("visibilitychange",visible);report("")};
}
