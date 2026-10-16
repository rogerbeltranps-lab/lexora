/* LumoUp Dictionary Explorer v0.2
 * First-party starter glossary: © 2026 Roger Beltran.
 * Dictionary shards are retrieved from GitHub Pages on demand.
 */
(function(){
"use strict";
const cache=new Map(),buckets=["a-h","i-p","q-z"];
let selectionSequence=0,lastPassage="";
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
const irregular={came:"come",comes:"come",coming:"come",went:"go",gone:"go",gave:"give",given:"give",giving:"give",got:"get",getting:"get",gotten:"get",made:"make",making:"make",took:"take",taken:"take",taking:"take",caught:"catch",catching:"catch",ran:"run",running:"run",brought:"bring",bringing:"bring",thought:"think",held:"hold",holding:"hold",found:"find",looked:"look",looking:"look",figured:"figure",figuring:"figure",turned:"turn",turning:"turn",picked:"pick",picking:"pick",ended:"end",ending:"end",broke:"break",broken:"break",breaking:"break",putting:"put",set:"set",setting:"set",worked:"work",working:"work",carried:"carry",carrying:"carry",pointed:"point",pointing:"point",was:"be",were:"be",is:"be",are:"be",am:"be",been:"be",sank:"sink",sunk:"sink",slipped:"slip",left:"leave",leaving:"leave"};
function normalizeQuotes(text){return String(text||"").toLowerCase().replace(/[‘’ʼ]/g,"'")}
function tokenize(text){return (normalizeQuotes(text).match(/[a-z]+(?:'[a-z]+)?/g)||[])}
// Sentence tokens keep clause punctuation as "|" so a phrase cannot jump across it
// ("catches your attention, then pick up" must not match "catch up").
function sentenceTokens(text){return (normalizeQuotes(text).match(/[a-z]+(?:'[a-z]+)?|[.,;:!?()“”"—–]/g)||[]).map(t=>/^[a-z]/.test(t)?t:"|")}
function lemma(s){if(irregular[s])return irregular[s];if(s.endsWith("ies")&&s.length>4)return s.slice(0,-3)+"y";if(s.endsWith("ied")&&s.length>4)return s.slice(0,-3)+"y";if(s.endsWith("ing")&&s.length>5){let x=s.slice(0,-3);if(x.endsWith("nn")||x.endsWith("tt")||x.endsWith("pp"))x=x.slice(0,-1);return x}if(s.endsWith("ed")&&s.length>4)return s.slice(0,-2);if(s.endsWith("es")&&s.length>4)return s.slice(0,-2);if(s.endsWith("s")&&s.length>3)return s.slice(0,-1);return s}
function equivalence(a,b){return a===b||lemma(a)===lemma(b)||lemma(a)===b||a===lemma(b)}
// Dictionary placeholders: "catch someone's eye" should match "caught my eye" or "caught the teacher's eye".
const possessiveSlots=new Set(["one's","someone's","somebody's","something's"]);
const possessives=new Set(["my","your","his","her","its","our","their","whose","thy"]);
const reflexiveSlots=new Set(["oneself","someone's self"]);
const reflexives=new Set(["myself","yourself","himself","herself","itself","ourselves","yourselves","themselves","oneself"]);
const objectSlots=new Set(["someone","somebody","something"]);
// How many sentence tokens a placeholder can consume at position i (0 = no match).
function slotLengths(words,i,slot){
 const w=words[i];if(!w||w==="|")return [];
 if(possessiveSlots.has(slot)){
  const out=[];if(possessives.has(w)||/'s$|s'$/.test(w))out.push(1);
  for(let n=2;n<=3;n++){const last=words[i+n-1];if(!last||words.slice(i,i+n).includes("|"))break;if(/'s$|s'$/.test(last))out.push(n)}
  return out;
 }
 if(reflexiveSlots.has(slot))return reflexives.has(w)?[1]:[];
 if(objectSlots.has(slot)){const out=[];for(let n=1;n<=3;n++){if(!words[i+n-1]||words[i+n-1]==="|")break;out.push(n)}return out}
 return null;
}
function isSlot(t){return possessiveSlots.has(t)||reflexiveSlots.has(t)||objectSlots.has(t)}
function matches(sentence,entry){
 const words=Array.isArray(sentence)?sentence:sentenceTokens(sentence),phrase=tokenize(entry.term);
 if(!phrase.length||isSlot(phrase[0]))return false;
 const crossPunctuation=/[,;:!?.]/.test(entry.term);
 const maxJump=(phrase.length===2&&entry.type==="Phrasal verb")?4:2;
 // j: next phrase token; pos: index of the last sentence token used; adjacent: no gap allowed (around placeholders).
 function rest(j,pos,adjacent){
  if(j===phrase.length)return true;
  const slot=phrase[j];
  if(isSlot(slot)){
   for(const n of slotLengths(words,pos+1,slot))if(rest(j+1,pos+n,true))return true;
   return false;
  }
  const limit=adjacent?1:(j===1?maxJump:2);
  for(let k=pos+1;k<=Math.min(words.length-1,pos+limit);k++){
   if(words[k]==="|"){if(crossPunctuation)continue;return false}
   if(equivalence(words[k],slot)&&rest(j+1,k,false))return true;
  }
  return false;
 }
 for(let i=0;i<words.length;i++)if(words[i]!=="|"&&equivalence(words[i],phrase[0])&&rest(1,i,false))return true;
 return false;
}
function uniqueByTerm(list){const seen=new Set();return list.filter(e=>{const k=e.term.toLowerCase();if(seen.has(k))return false;seen.add(k);return true})}
async function jsonEntries(url){
 if(cache.has(url))return cache.get(url);
 const req=fetch(url,{cache:"force-cache"}).then(r=>r.ok?r.json():{entries:[]}).then(d=>Array.isArray(d.entries)?d.entries:[]).catch(()=>{cache.delete(url);return []});
 cache.set(url,req);return req;
}
function shardKey(word){const w=word.toLowerCase(),letter=c=>c>="a"&&c<="z"?c:"_";return letter(w[0])+letter(w[1]||"_")}
async function candidates(raw){
 const words=tokenize(raw),sets=new Set(),keys=new Set();
 for(const w of words){sets.add(bucketOf(lemma(w)));keys.add(shardKey(w));keys.add(shardKey(lemma(w)))}
 const loaded=await Promise.all([
  ...[...sets].map(async b=>[...await shard(b),...await jsonEntries("./dictionary/wiktionary/"+b+".json")]),
  // Multiword idioms, phrasal verbs and collocations from the full Wiktionary import, keyed by first word.
  ...[...keys].map(k=>jsonEntries("./dictionary/phrases/"+k+".json"))
 ]);
 const tokens=sentenceTokens(raw);
 const entries=loaded.flat().filter(x=>x.term&&Array.isArray(x.senses));
 let results=uniqueByTerm(entries.filter(x=>matches(tokens,x)));
 // Longest expressions first; the starter glossary (loaded first) wins ties through the stable sort.
 results.sort((a,b)=>tokenize(b.term).length-tokenize(a.term).length);
 return results.slice(0,15);
}
// Free dictionary fallback for individual English words (dictionaryapi.dev).
// Phrase discovery still uses LumoUp's existing contextual dictionary.
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
 const base=lemma(word);
 const terms=[base,word].filter((v,i,a)=>v&&a.indexOf(v)===i);
 const results=[];
 if(!/^[a-z]+(?:['-][a-z]+)?$/.test(word))return builtInEntry(word);
 for(const term of terms){
   const k=(term[0]||"_")+(term[1]||"_");
   try{
     const response=await fetch("./dictionary/words/"+k+".json",{cache:"force-cache"});
     if(!response.ok)continue;
     const json=await response.json();
     const entries=(json.entries||[]).filter(e=>e.term?.toLowerCase()===term);
     for(const entry of entries)results.push({...entry,term:word,baseTerm:term});
   }catch(e){console.warn("Local word shard unavailable",e)}
 }
 // Inflected forms sometimes contain only rare, specialized senses.
 // Always include the dictionary senses of the lemma, then the inflected form.
 const local=builtInEntry(word);
 if(local.length&&!results.length)return local;
 const seen=new Set();
 return results.filter(entry=>{
   const signature=(entry.type||"")+"|"+(entry.senses||[]).map(s=>s.definition).join("|");
   if(seen.has(signature))return false;seen.add(signature);return true;
 });
}
function panelTitle(title,context){
 return '<div class="lex-dictionary-heading"><span class="chip">Contextual discovery · offline-style dictionary</span><div class="word lex-selected-word" aria-label="Selected word or phrase">'+escapeHtml(title)+'</div></div>'+
 (context?'<p class="quote">'+escapeHtml(context)+'</p>':'');
}
// The sentence of the passage that holds the selection, exactly as the book wrote it.
function sourceSentence(raw,entry,passage){
 const parts=(String(passage||"").replace(/\s+/g," ").match(/[^.!?]+(?:[.!?]+["'”’)\]]*(?=\s|$)|$)/g)||[]).map(v=>v.trim()).filter(v=>/[a-z]/i.test(v));
 const words=" "+tokenize(raw).join(" ")+" ";
 return parts.find(p=>words.trim()&&(" "+tokenize(p).join(" ")+" ").includes(words))||parts.find(p=>matches(p,entry))||"";
}
// Where a reader selection came from. Optional on cards: older cards have no source.
function readingSource(sentence){
 const guide=currentBook==="guide",book=guide?{name:"The LumoUp Guide"}:(bookNames.find(b=>b.id===currentBook)||{});
 let location="";
 try{location=guide?"chapter "+(chapterIndex+1):(rendition?.currentLocation?.()?.start?.cfi||"")}catch{}
 return {kind:"book",title:book.name||"",bookId:currentBook,sentence,location,capturedAt:new Date().toISOString()};
}
function addSelectedCard(entry,sense,source,raw){
 const fallback=entry.senses[sense]||entry.senses[0];if(!fallback)return;
 // The shown passage is shortened; look for the sentence in the full paragraph.
 const passage=source&&lastPassage.startsWith(source)?lastPassage:source;
 const sentence=sourceSentence(raw||entry.term,entry,passage);
 const fresh={id:"",term:entry.term,type:(["Phrasal verb","Idiom","Expression","Vocabulary","Pronunciation","Grammar"].includes(entry.type)?entry.type:(["Idiomatic expression","Proverb"].includes(entry.type)?"Idiom":(entry.term.trim().includes(" ")?"Expression":"Vocabulary"))),ipa:entry.ipa||"",definition:fallback.definition,catalan:fallback.catalan||"",structure:entry.structure||"",examples:[sentence,fallback.example].filter((x,i,all)=>x&&all.indexOf(x)===i),tip:"",context:source||""};
 if(sentence)fresh.source=readingSource(sentence);
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
// Keep speech inside the user's tap handler: iOS requires a user gesture.
function playDictionaryAudio(raw){
 const button=document.getElementById("dictionary-listen");
 if(!raw||!button)return;
 if(!window.lexoraSpeech||!("speechSynthesis" in window)){
   toast("Aquest dispositiu no ofereix síntesi de veu.");return;
 }
 try{
   let started=false;
   button.textContent="🔊 Reproduint…";
   // speak() runs synchronously inside the tap, which Safari on iPhone requires.
   const voiceURI=JSON.parse(localStorage.getItem("lexora-voice-choice")||'""');
   lexoraSpeech.speakBest(raw,{rate:0.9,voiceURI,
     onstart:()=>{started=true;button.textContent="🔊 Reproduint…"},
     onend:()=>{button.textContent="🔊 Escolta"},
     onerror:e=>{button.textContent="🔊 Torna-ho a provar";toast("La veu no s'ha reproduït ("+e+"). Prova la veu del dispositiu.")}});
   setTimeout(()=>{if(!started&&!speechSynthesis.speaking&&button.isConnected&&button.textContent==="🔊 Reproduint…"){button.textContent="🔊 Torna-ho a provar";toast("L'iPhone no ha iniciat l'àudio. Comprova el volum i prova de nou.");}},4500);
 }catch(error){button.textContent="🔊 Torna-ho a provar";toast("No es pot reproduir l'àudio: "+error.message)}
}
function renderCandidates(raw,source,items,warning){
 const root=document.getElementById("discovery");if(!root)return;
 const title=panelTitle(raw,source)+'<button class="btn" type="button" id="dictionary-listen">🔊 Listen</button>';
 items=items.map(entry=>({...entry,senses:cleanSenses(entry.senses)})).filter(entry=>entry.senses.length);
 if(!items.length){root.innerHTML=title+'<div class="discovery-empty">No clear dictionary match found. Try another phrase or add your own card.<p class="small muted">'+escapeHtml(warning||"This first dictionary edition is deliberately small.")+'</p></div>';
 root.querySelector("#dictionary-listen").onclick=()=>playDictionaryAudio(raw);return}
 root.innerHTML=title+'<p class="small muted">Found '+items.length+' possible '+(items.length===1?"entry":"entries")+'. Select the meaning that best fits the text. The app does not assume your answer is correct.</p>'+
 items.map((entry,i)=>'<div class="sense-entry" style="border-top:1px solid #e0e9ec;padding:15px 0" data-entry="'+i+'"><div class="buttonrow" style="justify-content:space-between;align-items:center"><b style="font-family:Georgia,serif;font-size:20px">'+escapeHtml(entry.term)+'</b><span class="chip">'+escapeHtml(entry.type)+'</span></div><div class="ipa">'+escapeHtml(entry.ipa||"")+'</div><fieldset style="border:0;margin:0;padding:0"><legend class="small muted">Which meaning fits?</legend>'+
 entry.senses.map((sense,k)=>'<label class="lex-sense-option"><input class="lex-sense-radio" type="radio" name="sense-'+i+'" value="'+k+'" '+(entry.senses.length===1?"checked":"")+'><span class="lex-sense-copy">'+escapeHtml(sense.definition)+'<br><span class="muted">'+escapeHtml(sense.catalan||"")+'</span><br><span style="display:block;margin-top:5px;font-size:14px;font-style:normal;color:#435b6b;line-height:1.55">'+escapeHtml(sense.example||"")+'</span></span></label>').join("")+
 '<label style="display:block;font-size:12px;margin:9px 0"><input type="radio" name="sense-'+i+'" value="unsure"> Not sure / None of these</label></fieldset><button class="btn primary" type="button" data-save-entry="'+i+'">＋ Save chosen meaning</button></div>').join("")+
 '';
 root.querySelectorAll("[data-save-entry]").forEach(button=>button.onclick=()=>{
  const i=Number(button.dataset.saveEntry),selected=root.querySelector('input[name="sense-'+i+'"]:checked');
  if(!selected){toast("Choose a meaning first");return}
  if(selected.value==="unsure"){toast("No problem — try another definition or create a manual card");return}
  addSelectedCard(items[i],Number(selected.value),source,raw)
 });
 root.querySelector("#dictionary-listen").onclick=()=>playDictionaryAudio(raw);
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
window.lexoraDictionaryInfo={matching:"words, phrases and expressions",sources:["Wiktionary via Kaikki","LumoUp starter glossary"],cloudSync:false};
choose=function(term,source=""){
 selected=term.trim().slice(0,500);
 lastPassage=source.trim();
 context=lastPassage.slice(0,700);
 document.getElementById("lookup").value=selected;
 if(selected)analyze(selected,context);
};

})();