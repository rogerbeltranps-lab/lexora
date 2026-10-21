/* Lexora on a computer: Kokoro natural voices for Read & Listen, the dictionary and flashcards. Kokoro runs in the
   browser (kokoro-worker.js). Phones and tablets keep the device voice: Kokoro was too slow in iPhone Safari, and the
   LumoUp iPhone app has its own native Kokoro. Loaded before speech.js; the device voice stays in Settings and is the fallback. */
(()=>{"use strict";
const mobile=/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if(mobile||!window.Worker||!AudioCtx)return;
const PREFIX="kokoro:",DEFAULT="af_heart";
// The voices Roger chose for the LumoUp iPhone app: the two best of each kind first, then the rest, best first.
const VOICES=[["af_heart","Heart","US woman"],["af_bella","Bella","US woman"],["am_michael","Michael","US man"],["am_fenrir","Fenrir","US man"],
 ["bf_emma","Emma","UK woman"],["bf_isabella","Isabella","UK woman"],["bm_george","George","UK man"],["bm_fable","Fable","UK man"],
 ["af_aoede","Aoede","US woman"],["af_kore","Kore","US woman"],["af_nova","Nova","US woman"],["af_alloy","Alloy","US woman"],
 ["am_puck","Puck","US man"],["af_nicole","Nicole","US woman, soft"],["af_sarah","Sarah","US woman"]];
// The pause added between two sentences of one chunk.
const GAP=0.12,MAX_CACHE=80;
let device=null,worker=null,engine=null,state="idle",onStatus=null,context=null;
let generation=0,waiting=false,sources=[],timers=[];
const cache=new Map(),queue=[];let busy=null,nextJob=0;
const isKokoro=uri=>!uri||String(uri).startsWith(PREFIX);
const voiceId=uri=>{const id=String(uri||"").slice(PREFIX.length);return VOICES.some(v=>v[0]===id)?id:DEFAULT};
function status(text){try{onStatus?.(text)}catch{}}

// One-time switch: the web app speaks with Kokoro Heart unless the person picks another voice afterwards.
try{if(!localStorage.getItem("lexora-kokoro-default")){localStorage.setItem("lexora-voice-choice",JSON.stringify(PREFIX+DEFAULT));localStorage.setItem("lexora-kokoro-default","1")}}catch{}

function start(gpu){
 return new Promise((ok,no)=>{
  worker=new Worker(new URL("kokoro-worker.js?v=48",document.baseURI),{type:"module"});
  worker.onmessage=e=>{
   const m=e.data;
   if(m.type==="progress"){status("Downloading natural voice… "+Math.round(m.progress)+"%");return}
   if(m.type==="ready"){ok(m.device);return}
   if(m.type==="failed"){const error=Error(m.error);error.gpu=m.gpu;no(error);return}
   if(busy?.id===m.id){const job=busy;busy=null;m.type==="audio"?job.ok(m):job.no(Error(m.error));pump()}
  };
  worker.onerror=e=>{e.preventDefault?.();no(Error(e.message||"Kokoro worker failed"))};
  worker.postMessage({type:"load",gpu});
 });
}
// The model downloads once (the browser keeps it); later visits only load it.
function load(){
 if(!engine){
  state="loading";status("Loading natural voice…");
  let gpu=true;try{gpu=localStorage.getItem("lexora-kokoro-wasm")!=="1"}catch{}
  engine=start(gpu).catch(error=>{
   worker?.terminate();
   if(!error.gpu)throw error;
   try{localStorage.setItem("lexora-kokoro-wasm","1")}catch{}
   return start(false);
  }).then(kind=>{state="ready";return kind},error=>{
   console.warn("Kokoro unavailable; using the device voice",error);
   state="failed";worker?.terminate();worker=null;
   queue.splice(0).forEach(job=>job.no(error));if(busy){busy.no(error);busy=null}
   throw error;
  });
 }
 return engine;
}
function pump(){
 if(busy||!queue.length||state!=="ready")return;
 busy=queue.shift();worker.postMessage({type:"generate",id:busy.id,text:busy.text,voice:busy.voice,speed:busy.speed});
}
const keyOf=(text,voice,speed)=>voice+"|"+speed+"|"+text;
// Audio for one sentence, made once and kept for replays and for the sentence after a seek.
function synth(text,voice,speed,wanted){
 const key=keyOf(text,voice,speed),hit=cache.get(key);
 if(hit){hit.gen=wanted;cache.delete(key);cache.set(key,hit);return hit.promise}
 const entry={gen:wanted};
 entry.promise=load().then(()=>new Promise((ok,no)=>{entry.job={id:++nextJob,text,voice,speed,key,entry,ok,no};queue.push(entry.job);pump()}))
  .then(m=>{const buffer=audio().createBuffer(1,m.audio.length,m.rate);buffer.copyToChannel(m.audio,0);return buffer})
  .catch(error=>{if(cache.get(key)===entry)cache.delete(key);throw error});
 cache.set(key,entry);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
 return entry.promise;
}
// After a Pause, a seek or a new chunk, sentences nobody waits for any more must not hold up the one now needed.
function dropStale(){
 for(let i=queue.length-1;i>=0;i--){const job=queue[i];if(job.entry.gen!==generation){queue.splice(i,1);if(cache.get(job.key)===job.entry)cache.delete(job.key);job.no(Error("cancelled"))}}
}
function audio(){if(!context)context=new AudioCtx();return context}
function stopAudio(){timers.forEach(clearTimeout);timers=[];sources.forEach(s=>{s.onended=null;try{s.stop()}catch{}s.disconnect()});sources=[];waiting=false}
// Character offsets of each sentence in text, when the caller did not send them.
function offsets(text,parts){let at=0;return parts.map(p=>{const i=text.indexOf(p,at),s=i<0?at:i;at=s+p.length;return s})}
function speak(text,options={}){
 text=String(text||"").trim();if(!text)return false;
 const voiceURI=String(options.voiceURI||"");
 if(!isKokoro(voiceURI)||state==="failed"){stopKokoro();return device?device.speak(text,options):false}
 device?.cancel();stopKokoro();
 const mine=generation,voice=voiceId(voiceURI),speed=Math.max(.5,Math.min(2,Number(options.rate)||0.9));
 const parts=Array.isArray(options.parts)&&options.parts.length?options.parts.map(String):[text];
 const starts=Array.isArray(options.starts)&&options.starts.length===parts.length?options.starts.map(Number):offsets(text,parts);
 const live=()=>mine===generation;
 onStatus=options.onstatus||null;waiting=true;if(state!=="ready")status("Loading natural voice…");
 const ctx=audio();ctx.resume?.().catch(()=>{});
 const clips=parts.map(p=>synth(p,voice,speed,mine));
 // Prepare the next chunk while this one plays, so it starts without a pause.
 (Array.isArray(options.upcoming)?options.upcoming:[]).forEach(t=>synth(String(t),voice,speed,mine).catch(()=>{}));
 dropStale();
 (async()=>{
  let end=0;
  for(let k=0;k<parts.length;k++){
   let buffer;
   try{buffer=await clips[k]}
   catch(error){
    if(!live())return;
    // The model could not load or could not speak the first sentence: the device voice reads instead, so the narration never stays silent.
    if(k===0){waiting=false;console.warn("Kokoro could not speak; using the device voice",error);status("Natural voice unavailable; using the device voice");device?device.speak(text,options):options.onerror?.("kokoro-failed");return}
    waiting=false;options.onerror?.(String(error?.message||error));return;
   }
   if(!live())return;
   if(ctx.state!=="running")await Promise.race([ctx.resume(),new Promise(r=>setTimeout(r,2000))]).catch(()=>{});
   if(!live())return;
   if(ctx.state!=="running"){waiting=false;stopKokoro();device?device.speak(text,options):options.onerror?.("audio-blocked");return}
   const now=ctx.currentTime,at=Math.max(now+0.03,end+(k?GAP:0)),node=ctx.createBufferSource();
   node.buffer=buffer;node.connect(ctx.destination);node.start(at);sources.push(node);end=at+buffer.duration;
   const piece={charIndex:starts[k],length:parts[k].length,seconds:buffer.duration,elapsed:0};
   timers.push(setTimeout(()=>{
    if(!live())return;
    if(k===0){waiting=false;options.onstart?.()}else options.onboundary?.({charIndex:starts[k],elapsedTime:0,name:"sentence"});
    options.onsegment?.(piece);
   },Math.max(0,(at-now)*1000)));
   if(k===parts.length-1)node.onended=()=>{if(live()){sources=[];options.onend?.()}};
  }
 })();
 return true;
}
function stopKokoro(){generation++;stopAudio();onStatus=null}
function cancel(){device?.cancel();stopKokoro()}
function chosenVoice(){try{return String(JSON.parse(localStorage.getItem("lexora-voice-choice")||'""')||"")}catch{return""}}
// Call inside the tap: browsers only let audio start from a user gesture.
function unlock(){if(isKokoro(chosenVoice())&&state!=="failed"){audio().resume?.().catch(()=>{});load().catch(()=>{})}else device?.unlock?.()}
function voices(){
 const own=VOICES.map(([id,name,kind])=>({voiceURI:PREFIX+id,name:"Kokoro · "+name+" ("+kind+")",lang:id[0]==="b"?"en-GB":"en-US",localService:true,default:id===DEFAULT,kokoro:true}));
 return (state==="failed"?[]:own).concat(device?device.voices():[]);
}
function quality(v){return v?.kokoro?"":device?.quality?.(v)||""}
// True while the first sentence is still being prepared, so the narration does not report that speech never started.
const preparing=()=>waiting;
const api={speak,speakBest:speak,cancel,unlock,voices,quality,preparing,kokoro:true,engine:()=>state};
// speech.js assigns window.lexoraSpeech; keep its device voice and answer with Kokoro.
Object.defineProperty(window,"lexoraSpeech",{configurable:true,get:()=>api,set:v=>{device=v}});
})();
