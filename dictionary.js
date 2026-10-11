/* Lexora Dictionary Explorer v0.2
 * First-party starter glossary: © 2026 Roger Beltran.
 * Dictionary shards are retrieved from GitHub Pages on demand.
 */
(function(){
"use strict";
const cache=new Map(),buckets=["a-h","i-p","q-z"];
let selectionSequence=0;
const escapeHtml=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function bucketOf(s){const x=(s||"").toLowerCase()[0];return x<="h"?"a-h":x<="p"?"i-p":"q-z"}
async function shard(name){
 if(cache.has(name))return cache.get(name);
 const req=fetch("./dictionary/"+name+".json",{cache:"force-cache"}).then(async r=>{
  if(!r.ok)throw Error("Dictionary file unavailable");
  const data=await r.json();return Array.isArray(data.entries)?data.entries:[]
 }).catch(err=>{cache.delete(name);throw err});
 cache.set(name,req);return req;
}
const irregular={came:"come",comes:"come",coming:"come",went:"go",gone:"go",gave:"give",given:"give",giving:"give",got:"get",getting:"get",gotten:"get",made:"make",making:"make",took:"take",taken:"take",taking:"take",caught:"catch",catching:"catch",ran:"run",running:"run",brought:"bring",bringing:"bring",thought:"think",held:"hold",holding:"hold",found:"find",looked:"look",looking:"look",figured:"figure",figuring:"figure",turned:"turn",turning:"turn",picked:"pick",picking:"pick",ended:"end",ending:"end",broke:"break",broken:"break",breaking:"break",putting:"put",set:"set",setting:"set",worked:"work",working:"work",carried:"carry",carrying:"carry",pointed:"point",pointing:"point",was:"be",were:"be",is:"be",are:"be",am:"be",been:"be",sank:"sink",sunk:"sink",slipped:"slip"};
function tokenize(text){return (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[])}
function lemma(s){if(irregular[s])return irregular[s];if(s.endsWith("ies")&&s.length>4)return s.slice(0,-3)+"y";if(s.endsWith("ied")&&s.length>4)return s.slice(0,-3)+"y";if(s.endsWith("ing")&&s.length>5){let x=s.slice(0,-3);if(x.endsWith("nn")||x.endsWith("tt")||x.endsWith("pp"))x=x.slice(0,-1);return x}if(s.endsWith("ed")&&s.length>4)return s.slice(0,-2);if(s.endsWith("es")&&s.length>4)return s.slice(0,-2);if(s.endsWith("s")&&s.length>3)return s.slice(0,-1);return s}
function equivalence(a,b){return a===b||lemma(a)===lemma(b)||lemma(a)===b||a===lemma(b)}
function matches(sentence,entry){
 const words=tokenize(sentence),phrase=tokenize(entry.term);if(!phrase.length)return false;
 for(let i=0;i<words.length;i++){
  if(!equivalence(words[i],phrase[0]))continue;
  let pos=i,matched=true;
  for(let j=1;j<phrase.length;j++){
   let found=false;
   const maxJump=(j===1&&phrase.length===2&&entry.type==="Phrasal verb")?5:2;
   for(let k=pos+1;k<=Math.min(words.length-1,pos+maxJump);k++){
    if(equivalence(words[k],phrase[j])){pos=k;found=true;break}
   }
   if(!found){matched=false;break}
  }
  if(matched)return true;
 }
 return false;
}
function uniqueByTerm(list){const seen=new Set();return list.filter(e=>{if(seen.has(e.term))return false;seen.add(e.term);return true})}
async function candidates(raw){
 const words=tokenize(raw),sets=new Set();
 for(const w of words)sets.add(bucketOf(lemma(w)));
 const loaded=await Promise.all([...sets].map(shard));
 const entries=loaded.flat().filter(x=>x.term&&Array.isArray(x.senses));
 let results=uniqueByTerm(entries.filter(x=>matches(raw,x)));
 results.sort((a,b)=>tokenize(b.term).length-tokenize(a.term).length||a.term.localeCompare(b.term));
 return results.slice(0,15);
}
function panelTitle(title,context){
 return '<span class="chip">Contextual discovery · offline-style dictionary</span><div class="word">'+escapeHtml(title)+'</div>'+
 (context?'<p class="quote">'+escapeHtml(context)+'</p>':'');
}
function addSelectedCard(entry,sense,source){
 const fallback=entry.senses[sense]||entry.senses[0];if(!fallback)return;
 const fresh={id:"",term:entry.term,type:entry.type==="Idiomatic expression"?"Expression":entry.type,ipa:entry.ipa||"",definition:fallback.definition,catalan:fallback.catalan||"",structure:entry.structure||"",examples:[fallback.example].filter(Boolean),tip:"",context:source||""};
 editCard(fresh);
}
function renderCandidates(raw,source,items,warning){
 const root=document.getElementById("discovery");if(!root)return;
 const title=panelTitle(raw,source);
 if(!items.length){root.innerHTML=title+'<div class="discovery-empty">No clear dictionary match found. Try another phrase or add your own card.<p class="small muted">'+escapeHtml(warning||"This first dictionary edition is deliberately small.")+'</p></div><button class="btn primary" id="manual-entry">＋ Create a flashcard</button>';
 root.querySelector("#manual-entry").onclick=()=>editCard(null,raw,source);return}
 root.innerHTML=title+'<p class="small muted">Found '+items.length+' possible '+(items.length===1?"entry":"entries")+'. Select the meaning that best fits the text. The app does not assume your answer is correct.</p>'+
 items.map((entry,i)=>'<div class="sense-entry" style="border-top:1px solid #e0e9ec;padding:15px 0" data-entry="'+i+'"><div class="buttonrow" style="justify-content:space-between;align-items:center"><b style="font-family:Georgia,serif;font-size:20px">'+escapeHtml(entry.term)+'</b><span class="chip">'+escapeHtml(entry.type)+'</span></div><div class="ipa">'+escapeHtml(entry.ipa||"")+'</div><fieldset style="border:0;margin:0;padding:0"><legend class="small muted">Which meaning fits?</legend>'+
 entry.senses.map((sense,k)=>'<label style="display:flex;gap:8px;align-items:flex-start;margin:9px 0;font-size:13px"><input type="radio" name="sense-'+i+'" value="'+k+'" '+(entry.senses.length===1?"checked":"")+'><span>'+escapeHtml(sense.definition)+'<br><span class="muted">'+escapeHtml(sense.catalan||"")+'</span><br><em class="small">'+escapeHtml(sense.example||"")+'</em></span></label>').join("")+
 '<label style="display:block;font-size:12px;margin:9px 0"><input type="radio" name="sense-'+i+'" value="unsure"> Not sure / None of these</label></fieldset><button class="btn primary" type="button" data-save-entry="'+i+'">＋ Save chosen meaning</button></div>').join("")+
 '<button class="btn" id="manual-entry">Add a different expression</button><p class="small muted">Dictionary: Lexora original starter data, © Roger Beltran. Context choices are self-assessed, not automatically graded.</p>';
 root.querySelectorAll("[data-save-entry]").forEach(button=>button.onclick=()=>{
  const i=Number(button.dataset.saveEntry),selected=root.querySelector('input[name="sense-'+i+'"]:checked');
  if(!selected){toast("Choose a meaning first");return}
  if(selected.value==="unsure"){toast("No problem — try another definition or create a manual card");return}
  addSelectedCard(items[i],Number(selected.value),source)
 });
 root.querySelector("#manual-entry").onclick=()=>editCard(null,raw,source);
}
async function analyze(raw,source){
 const seq=++selectionSequence;
 const root=document.getElementById("discovery");if(!root)return;
 root.innerHTML=panelTitle(raw,source)+'<p class="small muted">Looking for expressions in the online dictionary…</p>';
 try{const items=await candidates(raw);if(seq===selectionSequence)renderCandidates(raw,source,items)}
 catch(err){if(seq===selectionSequence)renderCandidates(raw,source,[],"Could not fetch the dictionary; check your connection.")}
}
window.lexoraAnalyze=analyze;
window.lexoraDictionaryInfo={matching:"phrase and some separated particles",sources:["Lexora original starter glossary"],entries:"36 initial entries",cloudSync:false};
choose=function(term,source=""){
 selected=term.trim().slice(0,500);
 context=source.trim().slice(0,700);
 document.getElementById("lookup").value=selected;
 if(selected)analyze(selected,context);
};
document.getElementById("lookup-btn").onclick=()=>{const val=document.getElementById("lookup").value.trim();if(val)choose(val)};
document.getElementById("lookup").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("lookup-btn").click()}});
})();