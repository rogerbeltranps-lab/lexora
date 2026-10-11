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
 const loaded=await Promise.all([...sets].map(async b=>{
   const starter=await shard(b);
   try {
    const response=await fetch("./dictionary/wiktionary/"+b+".json",{cache:"force-cache"});
    if(!response.ok)return starter;
    const data=await response.json();
    const imported=Array.isArray(data.entries)?data.entries:[];
    return [...starter,...imported];
   } catch{return starter}
 }));
 const entries=loaded.flat().filter(x=>x.term&&Array.isArray(x.senses));
 let results=uniqueByTerm(entries.filter(x=>matches(raw,x)));
 results.sort((a,b)=>tokenize(b.term).length-tokenize(a.term).length||a.term.localeCompare(b.term));
 return results.slice(0,15);
}
// Free dictionary fallback for individual English words (dictionaryapi.dev).
// Phrase discovery still uses Lexora's existing contextual dictionary.
const builtInWords={
 "phrase":{ipa:"/freɪz/",type:"noun",senses:[["A small group of words that forms part of a sentence or expresses an idea.","frase; expressió","The phrase ‘come across’ is common in English."],["A particular way of saying something.","expressió; manera de dir","That's an interesting phrase."]]},
 "word":{ipa:"/wɝd/",type:"noun",senses:[["A single unit of language with meaning.","paraula","Choose a word to look up."]]},
 "expression":{ipa:"/ɪkˈsprɛʃən/",type:"noun",senses:[["A word or group of words used to express an idea.","expressió","This expression is used in everyday conversation."]]},
 "chapter":{ipa:"/ˈtʃæptɚ/",type:"noun",senses:[["One of the main sections of a book.","capítol","Read the next chapter."]]},
 "meaning":{ipa:"/ˈmiːnɪŋ/",type:"noun",senses:[["What a word, phrase, or idea expresses.","significat","Choose the correct meaning."]]},
 "select":{ipa:"/səˈlɛkt/",type:"verb",senses:[["To choose something from several options.","seleccionar; triar","Select the expression you want to learn."]]},
 "paragraph":{ipa:"/ˈpærəˌɡræf/",type:"noun",senses:[["A group of sentences about one main idea.","paràgraf","Read the first paragraph."]]},
 "example":{ipa:"/ɪɡˈzæmpəl/",type:"noun",senses:[["Something that shows how a rule or idea works.","exemple","Write an example sentence."]]},

 "read":{ipa:"/riːd/ (present), /rɛd/ (past)",type:"verb",senses:[["To look at and understand written words.","llegir","I read books every evening."],["To speak written words aloud.","llegir en veu alta","She read the story to her children."]]},
 "between":{ipa:"/bɪˈtwiːn/",type:"preposition",senses:[["In the space separating two things, people, or places.","entre","The library is between the school and the park."],["In the time separating two moments.","entre","We meet between three and four."],["Involving two people or things.","entre","The agreement is between the two teachers."]]},
 "hold":{ipa:"/hoʊld/",type:"verb",senses:[["To keep something in your hands.","agafar; sostenir","Hold the book carefully."],["To keep something in a position or condition.","mantenir","Hold the door open."],["To organize or conduct an event.","celebrar; organitzar","They will hold a meeting tomorrow."]]},
 "guide":{ipa:"/ɡaɪd/",type:"noun",senses:[["A book or resource explaining how to do something.","guia","Read the guide before starting."]]},
 "listen":{ipa:"/ˈlɪsən/",type:"verb",senses:[["To pay attention to sounds or someone's speech.","escoltar","Listen to the story."]]}
};
function builtInEntry(word){const data=builtInWords[word];return data?[{term:word,type:data.type,ipa:data.ipa,senses:data.senses.map(([definition,catalan,example])=>({definition,catalan,example}))}]:[]}
async function fetchWord(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3500);try{return await fetch(url,{signal:controller.signal})}finally{clearTimeout(timer)}}
async function singleWordEntries(raw){
 const word=raw.trim().toLowerCase();
 const local=builtInEntry(word);
 if(!/^[a-z]+(?:['-][a-z]+)?$/.test(word))return local;
 const terms=[word,lemma(word)].filter((v,i,a)=>v&&a.indexOf(v)===i);
 for(const term of terms){
   const k=(term[0]||"_")+(term[1]||"_");
   try{
     const response=await fetch("./dictionary/words/"+k+".json",{cache:"force-cache"});
     if(response.ok){
       const json=await response.json();
       const entries=(json.entries||[]).filter(e=>e.term?.toLowerCase()===term);
       if(entries.length)return entries;
     }
   }catch(e){console.warn("Local word shard unavailable",e)}
 }
 return local;
}
function panelTitle(title,context){
 return '<span class="chip">Contextual discovery · offline-style dictionary</span><div class="word">'+escapeHtml(title)+'</div>'+
 (context?'<p class="quote">'+escapeHtml(context)+'</p>':'');
}
function addSelectedCard(entry,sense,source){
 const fallback=entry.senses[sense]||entry.senses[0];if(!fallback)return;
 const fresh={id:"",term:entry.term,type:(["Phrasal verb","Idiom","Expression","Vocabulary","Pronunciation","Grammar"].includes(entry.type)?entry.type:(["Idiomatic expression","Proverb"].includes(entry.type)?"Idiom":(entry.term.trim().includes(" ")?"Expression":"Vocabulary"))),ipa:entry.ipa||"",definition:fallback.definition,catalan:fallback.catalan||"",structure:entry.structure||"",examples:[fallback.example].filter(Boolean),tip:"",context:source||""};
 editCard(fresh);
}
// Kaikki can repeat one gloss for several citations. Show the meaning once.
function cleanSenses(senses){
 const result=[],seen=new Map();
 for(const sense of senses||[]){
  const def=String(sense.definition||"").trim();
  if(!def)continue;
  const key=def.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  if(seen.has(key)){
   const old=result[seen.get(key)];
   if(!old.example&&sense.example)old.example=sense.example;
   if(!old.catalan&&sense.catalan)old.catalan=sense.catalan;
   continue;
  }
  seen.set(key,result.length);
  result.push({...sense,definition:def});
 }
 return result;
}
function renderCandidates(raw,source,items,warning){
 const root=document.getElementById("discovery");if(!root)return;
 const title=panelTitle(raw,source)+'<button class="btn" type="button" id="dictionary-listen">🔊 Listen</button>';
 items=items.map(entry=>({...entry,senses:cleanSenses(entry.senses)})).filter(entry=>entry.senses.length);
 if(!items.length){root.innerHTML=title+'<div class="discovery-empty">No clear dictionary match found. Try another phrase or add your own card.<p class="small muted">'+escapeHtml(warning||"This first dictionary edition is deliberately small.")+'</p></div><button class="btn primary" id="manual-entry">＋ Create a flashcard</button>';
 root.querySelector("#manual-entry").onclick=()=>editCard(null,raw,source);root.querySelector("#dictionary-listen").onclick=()=>speak(raw);return}
 root.innerHTML=title+'<p class="small muted">Found '+items.length+' possible '+(items.length===1?"entry":"entries")+'. Select the meaning that best fits the text. The app does not assume your answer is correct.</p>'+
 items.map((entry,i)=>'<div class="sense-entry" style="border-top:1px solid #e0e9ec;padding:15px 0" data-entry="'+i+'"><div class="buttonrow" style="justify-content:space-between;align-items:center"><b style="font-family:Georgia,serif;font-size:20px">'+escapeHtml(entry.term)+'</b><span class="chip">'+escapeHtml(entry.type)+'</span></div><div class="ipa">'+escapeHtml(entry.ipa||"")+'</div><fieldset style="border:0;margin:0;padding:0"><legend class="small muted">Which meaning fits?</legend>'+
 entry.senses.map((sense,k)=>'<label style="display:flex;gap:11px;align-items:flex-start;margin:13px 0;padding:10px 8px;border-radius:9px;line-height:1.5;font-size:15px"><input type="radio" name="sense-'+i+'" value="'+k+'" '+(entry.senses.length===1?"checked":"")+'><span>'+escapeHtml(sense.definition)+'<br><span class="muted">'+escapeHtml(sense.catalan||"")+'</span><br><span style="display:block;margin-top:5px;font-size:14px;font-style:normal;color:#435b6b;line-height:1.55">'+escapeHtml(sense.example||"")+'</span></span></label>').join("")+
 '<label style="display:block;font-size:12px;margin:9px 0"><input type="radio" name="sense-'+i+'" value="unsure"> Not sure / None of these</label></fieldset><button class="btn primary" type="button" data-save-entry="'+i+'">＋ Save chosen meaning</button></div>').join("")+
 '';
 root.querySelectorAll("[data-save-entry]").forEach(button=>button.onclick=()=>{
  const i=Number(button.dataset.saveEntry),selected=root.querySelector('input[name="sense-'+i+'"]:checked');
  if(!selected){toast("Choose a meaning first");return}
  if(selected.value==="unsure"){toast("No problem — try another definition or create a manual card");return}
  addSelectedCard(items[i],Number(selected.value),source)
 });
 root.querySelector("#dictionary-listen").onclick=()=>speak(raw);
}
async function analyze(raw,source){
 const seq=++selectionSequence;
 const root=document.getElementById("discovery");if(!root)return;
 root.innerHTML=panelTitle(raw,source)+'<p class="small muted">Looking up meanings…</p>';
 const single=/^[a-z]+(?:['-][a-z]+)?$/i.test(raw.trim());
 // The phrase dictionary may be unavailable or too large. Never let it block a word lookup.
 if(single){
   try{
     const words=await singleWordEntries(raw);
     if(seq!==selectionSequence)return;
     if(words.length){renderCandidates(raw,source,words);return}
   }catch(error){console.warn("Word lookup failed",error)}
 }
 try{
   const items=await candidates(raw);
   if(seq===selectionSequence)renderCandidates(raw,source,items,
     single?"The complete word dictionary has not been published yet, or this word is missing.":"No matching expression found.");
 }catch(error){
   if(seq===selectionSequence)renderCandidates(raw,source,[],
     single?"The word dictionary could not provide a definition. Check connectivity.":"Could not fetch the dictionary; check your connection.");
 }
}
window.lexoraAnalyze=analyze;
window.lexoraDictionaryInfo={matching:"words, phrases and expressions",sources:["Wiktionary via Kaikki","Lexora starter glossary"],cloudSync:false};
choose=function(term,source=""){
 selected=term.trim().slice(0,500);
 context=source.trim().slice(0,700);
 document.getElementById("lookup").value=selected;
 if(selected)analyze(selected,context);
};

})();