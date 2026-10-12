/* Lexora Kokoro: synthesize sentences ahead of the narration and keep them on the device. */
(()=>{"use strict";
let modelPromise=null,model=null,stats=null,context=null,source=null,serial=Promise.resolve();
const cache=new Map(),MAX_CACHE=60,CANCELLED="cancelled";
// How much slower than real time synthesis runs, and seconds of speech per character at speed 1. Learned per device,
// so the narration knows how far ahead to prepare. Defaults are what the iPhone simulator measured.
const learned=JSON.parse(localStorage.getItem("lexora-kokoro-pace")||"null")||{ratio:1.6,perChar:0.065};
function ctx(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)();return context}
function stop(){if(source){const old=source;source=null;try{old.stop()}catch{}old.disconnect()}}
async function load(status=()=>{}){if(!modelPromise){modelPromise=(async()=>{status("Downloading Kokoro voice model (first use may take a while)…");const mod=await import("https://esm.sh/kokoro-js@1.2.1?bundle");
 // Show download progress so a slow first load does not look like a hang.
 const progress=e=>{if(e?.status==="progress"&&e.total>1e6)status("Downloading natural voice… "+Math.round(e.progress||0)+"%")};
 const wasm=()=>mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm",progress_callback:progress});
 // A failed WebGPU attempt leaves the ONNX runtime unusable for the rest of the page, so the wasm retry in the same page
 // also failed (iPhone simulator: navigator.gpu exists but has no adapter). Only try WebGPU with a real adapter, never on
 // iPhone/iPad (the fp32 model is too heavy there), and remember a failure so the next load goes straight to wasm.
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
 let gpu=false;if(!ios&&navigator.gpu&&localStorage.getItem("lexora-kokoro-wasm")!=="1"){try{gpu=!!(await navigator.gpu.requestAdapter())}catch{}}
 if(!gpu){try{return await workerTTS(progress)}catch(e){console.warn("Kokoro worker unavailable; synthesizing on the page",e);return wasm()}}
 try{return await mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"fp32",device:"webgpu",progress_callback:progress})}
 catch(e){localStorage.setItem("lexora-kokoro-wasm","1");throw e}
})().then(m=>{model=m;return m},e=>{modelPromise=null;throw e})}return modelPromise}
// The wasm model is slow (single-threaded); in a worker it no longer freezes the page for seconds while it synthesizes.
function workerTTS(progress){
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL("kokoro-worker.js",document.baseURI),{type:"module"}),pending=new Map();let next=0;
  const call=data=>new Promise((ok,no)=>{const id=++next;pending.set(id,{ok,no});worker.postMessage({id,...data})});
  worker.onmessage=e=>{const m=e.data;if(m.type==="progress"){progress({status:"progress",progress:m.progress,total:2e6});return}const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.ok?p.ok(m):p.no(Error(m.error))};
  worker.onerror=e=>{const err=Error(e.message||"Kokoro worker failed");pending.forEach(p=>p.no(err));pending.clear();reject(err)};
  call({}).then(()=>resolve({generate:(text,o)=>call({text,voice:o.voice,speed:o.speed}).then(m=>{stats={ms:Math.round(m.ms),seconds:+(m.audio.length/m.rate).toFixed(2),isolated:m.isolated};return{audio:m.audio,sampling_rate:m.rate}})}),reject);
 });
}
// Clips already made stay on the device (IndexedDB), so a chapter heard once plays straight away the next time.
const MAX_BYTES=150*1024*1024;let dbPromise=null,saves=0;
function db(){if(!dbPromise)dbPromise=new Promise((ok,no)=>{const r=indexedDB.open("lexora-voice",1);r.onupgradeneeded=()=>{r.result.createObjectStore("clips");r.result.createObjectStore("meta")};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}).catch(()=>null);return dbPromise}
async function stored(key){
 try{const d=await db();if(!d)return null;const tx=d.transaction(["clips","meta"],"readwrite"),get=tx.objectStore("clips").get(key);
  // Mark it as recently heard inside the request callback, while the transaction is still open.
  const clip=await new Promise((ok,no)=>{get.onsuccess=()=>{if(get.result)tx.objectStore("meta").put({bytes:get.result.pcm.byteLength,used:Date.now()},key);ok(get.result)};get.onerror=()=>no(get.error)});if(!clip)return null;
  const pcm=new Int16Array(clip.pcm),samples=new Float32Array(pcm.length);for(let i=0;i<pcm.length;i++)samples[i]=pcm[i]/32767;return toBuffer(samples,clip.rate)}catch{return null}
}
async function save(key,samples,rate){
 try{const d=await db();if(!d)return;const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++)pcm[i]=Math.max(-1,Math.min(1,samples[i]))*32767;
  const tx=d.transaction(["clips","meta"],"readwrite");tx.objectStore("clips").put({pcm:pcm.buffer,rate},key);tx.objectStore("meta").put({bytes:pcm.byteLength,used:Date.now()},key);
  if(++saves%25===0)tx.oncomplete=()=>prune(d)}catch{}
}
// Keep the store under MAX_BYTES by dropping the clips heard longest ago.
async function prune(d){
 try{const tx=d.transaction(["clips","meta"],"readwrite"),meta=tx.objectStore("meta"),rows=[];let total=0;
  await new Promise(ok=>{const c=meta.openCursor();c.onsuccess=()=>{const r=c.result;if(!r)return ok();rows.push([r.key,r.value]);total+=r.value.bytes;r.continue()};c.onerror=ok});
  rows.sort((a,b)=>a[1].used-b[1].used);for(const [key,v] of rows){if(total<=MAX_BYTES)break;total-=v.bytes;meta.delete(key);tx.objectStore("clips").delete(key)}}catch{}
}
function toBuffer(samples,rate){const buffer=ctx().createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);return buffer}
function learn(ms,audioSeconds,text,speed){
 if(!(audioSeconds>0.3))return;learned.ratio=learned.ratio*0.7+ms/1000/audioSeconds*0.3;learned.perChar=learned.perChar*0.7+audioSeconds*speed/text.length*0.3;
 try{localStorage.setItem("lexora-kokoro-pace",JSON.stringify(learned))}catch{}
}
const keyOf=(text,options)=>(options.voice||"af_heart")+"|"+(options.speed||1)+"|"+text;
// Seconds of audio already made for this sentence, or 0.
const clip=(text,options={})=>cache.get(keyOf(text,options))?.seconds||0;
const estimate=(text,speed=1)=>String(text||"").length*learned.perChar/speed;
function prepare(text,options={}){
 if(!text)return Promise.resolve(null);
 const speed=options.speed||1,voice=options.voice||"af_heart",key=keyOf(text,options),want=options.cancelled||(()=>false);
 const hit=cache.get(key);if(hit){hit.wants.push(want);return hit.promise}
 const entry={wants:[want]};
 // Serialize inference for compatibility with browsers that cannot run parallel model calls. A queued sentence that
 // every caller has since given up on (Pause, a page turn) is skipped instead of holding up the one now needed.
 entry.promise=serial.catch(()=>{}).then(async()=>{
  const saved=await stored(key);if(saved)return saved;
  if(entry.wants.every(f=>f()))throw Error(CANCELLED);
  const tts=await load(options.status),started=performance.now(),sound=await tts.generate(text,{voice,speed});
  const samples=sound.audio.buffer instanceof ArrayBuffer?sound.audio:new Float32Array(sound.audio),rate=sound.sampling_rate||24000;if(!samples?.length)throw Error("Kokoro returned no audio");
  learn(performance.now()-started,samples.length/rate,text,speed);save(key,samples,rate);return toBuffer(samples,rate)
 }).then(buffer=>{entry.seconds=buffer.duration;return buffer},error=>{if(cache.get(key)===entry)cache.delete(key);throw error});
 serial=entry.promise.then(()=>{},()=>{});
 cache.set(key,entry);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
 return entry.promise
}
function unlock(){const audioCtx=ctx();if(audioCtx.state!=="running"){audioCtx.resume().catch(()=>{})}return audioCtx}
async function speak(text,options={}){
 const audioCtx=ctx();await audioCtx.resume();
 options.status?.("Preparing natural voice…");
 // Queue upcoming audio before awaiting this sentence. It will be ready during playback.
 const current=prepare(text,options);
 // Two sentences ahead: on phones synthesis can be slower than playback, which left gaps between sentences.
 [].concat(options.nextText||[]).filter(Boolean).slice(0,2).forEach(t=>prepare(t,{speed:options.speed,voice:options.voice,status:()=>{}}).catch(()=>{}));
 const buffer=await current;
 if(options.cancelled?.())return;
 options.status?.("Speaking…");
 stop();
 const node=audioCtx.createBufferSource();node.buffer=buffer;node.connect(audioCtx.destination);source=node;
 await new Promise((resolve,reject)=>{node.onended=()=>{if(source===node)source=null;node.disconnect();resolve()};try{node.start()}catch(e){reject(e)}})
}
// Multi-core synthesis needs cross-origin isolation, which has not been tried on every iPhone. If Kokoro fails on an
// isolated page, open Lexora without isolation from now on (sw.js reads the same flag).
function giveUpIsolation(){
 if(!window.crossOriginIsolated)return;try{localStorage.setItem("lexora-isolation-off","1")}catch{}
 caches.open("lexora-flags").then(c=>c.delete("./__lexora_isolated__")).then(()=>navigator.serviceWorker?.controller?.postMessage({type:"ISOLATION"})).catch(()=>{});
}
window.lexoraKokoro={speak,prepare,stop,unlock,clip,estimate,giveUpIsolation,ratio:()=>learned.ratio,ready:()=>!!model,stats:()=>stats};
})();