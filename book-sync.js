/* Lexora EPUB library in Firestore, per signed-in user. The Spark plan has no Cloud Storage bucket, so each book is split
   into chunks under users/{uid}/books/{bookId}/chunks, and users/{uid}/books/{bookId} holds its name and chunk count.
   The published users/{userId}/{document=**} rule already limits each person to their own books. A book is downloaded
   the first time it is opened on a device and kept in IndexedDB for offline reading. */
import {doc,collection,setDoc,getDoc,writeBatch,onSnapshot,serverTimestamp,Bytes} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
// A Firestore document holds at most 1 MiB, field names included.
const CHUNK=900*1024;
const bridge=window.lexoraBookBridge;
const books=(db,uid)=>collection(db,"users",uid,"books");
const chunkRef=(db,uid,id,i)=>doc(db,"users",uid,"books",id,"chunks",String(i).padStart(4,"0"));

async function upload(db,uid,entry){
 const file=await bridge.getLocal(entry.id);
 if(!file)return;
 const data=new Uint8Array(await file.arrayBuffer()),count=Math.max(1,Math.ceil(data.length/CHUNK));
 // Chunks first, then the book entry, so another device never lists a book whose chunks are still missing.
 for(let i=0;i<count;i++)await setDoc(chunkRef(db,uid,entry.id,i),{data:Bytes.fromUint8Array(data.subarray(i*CHUNK,(i+1)*CHUNK))});
 await setDoc(doc(books(db,uid),entry.id),{name:entry.name,size:data.length,chunks:count,type:file.type||"application/epub+zip",addedAt:serverTimestamp()});
}
async function download(db,uid,id){
 const meta=await getDoc(doc(books(db,uid),id));
 if(!meta.exists())throw Error("This book is no longer in your cloud library");
 const {chunks,type}=meta.data(),parts=[];
 for(let i=0;i<chunks;i++){
  const snap=await getDoc(chunkRef(db,uid,id,i));
  if(!snap.exists())throw Error("Part of this book is missing in the cloud");
  parts.push(snap.data().data.toUint8Array());
 }
 return new Blob(parts,{type:type||"application/epub+zip"});
}
async function remove(db,uid,id){
 const meta=await getDoc(doc(books(db,uid),id));
 const batch=writeBatch(db);
 batch.delete(doc(books(db,uid),id));
 for(let i=0;i<(meta.data()?.chunks||0);i++)batch.delete(chunkRef(db,uid,id,i));
 await batch.commit();
}

// Keeps this device's book list and the person's cloud library the same while they are signed in. Returns a stop function.
export function startBookSync(db,uid,report){
 if(!bridge)return()=>{};
 let remote=null,stopped=false,running=false,again=false;const removed=new Set();
 window.lexoraBookCloud={uid,download:id=>download(db,uid,id)};
 dispatchEvent(new Event("lexora:book-cloud"));
 async function reconcile(){
  if(stopped||!remote)return;
  if(running){again=true;return}
  running=true;
  try{
   // Books deleted on this device, including while signed out.
   for(const id of bridge.deletions(uid)){await remove(db,uid,id);removed.add(id);bridge.clearDeletion(uid,id)}
   for(const [id,name] of remote){
    if(removed.has(id))continue;
    const entry=bridge.list().find(x=>x.id===id);
    if(!entry)bridge.addRemote({id,name,cloud:uid});
    else if(entry.cloud!==uid)bridge.markCloud(id,uid);
   }
   // A book this account uploaded that is gone from the cloud was deleted on another device.
   for(const entry of bridge.list())if(entry.cloud===uid&&!remote.has(entry.id))await bridge.forget(entry.id);
   // Books imported on this device before signing in, or while offline, go up now. Another account's books stay put.
   const pending=bridge.list().filter(x=>!x.cloud);
   for(const [i,entry] of pending.entries()){
    if(stopped)return;
    report("Pujant EPUB al núvol ("+(i+1)+"/"+pending.length+"): "+entry.name);
    await upload(db,uid,entry);
    // Removed from this device while it was uploading.
    if(!bridge.list().some(x=>x.id===entry.id)){await remove(db,uid,entry.id);removed.add(entry.id)}
    else if(!stopped)bridge.markCloud(entry.id,uid);
   }
   if(pending.length)report("EPUB desats al núvol · "+bridge.list().filter(x=>x.cloud===uid).length+" llibres");
  }catch(e){
   console.error("Lexora book sync",e);
   report("No s'han pogut sincronitzar els EPUB: "+(e.code||e.message)+". Els llibres d'aquest dispositiu es conserven i es tornarà a provar.");
  }finally{running=false;if(again&&!stopped){again=false;reconcile()}}
 }
 const changed=()=>reconcile();
 addEventListener("lexora:books-changed",changed);
 // Metadata changes too: when the cached list matches the server, its confirmation arrives only as one.
 const unsubscribe=onSnapshot(books(db,uid),{includeMetadataChanges:true},snap=>{
  // Only trust a list the server confirmed, or a book could be dropped here because the cache had not caught up.
  if(snap.metadata.fromCache)return;
  remote=new Map(snap.docs.map(d=>[d.id,d.data().name||"EPUB"]));
  reconcile();
 },err=>report("Error en rebre els EPUB: "+(err.code||err.message)));
 return()=>{stopped=true;unsubscribe();removeEventListener("lexora:books-changed",changed);if(window.lexoraBookCloud?.uid===uid)delete window.lexoraBookCloud};
}
