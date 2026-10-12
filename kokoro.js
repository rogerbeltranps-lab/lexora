/* Lexora Kokoro: synthesize the next sentence while the current audio plays. */
(()=>{"use strict";
let modelPromise=null,model=null,stats=null,context=null,source=null,serial=Promise.resolve();
const cache=new Map(),MAX_CACHE=8;
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
function prepare(text,options={}){
 if(!text)return Promise.resolve(null);
 const speed=options.speed||1,voice=options.voice||"af_heart",key=voice+"|"+speed+"|"+text;
 if(cache.has(key))return cache.get(key);
 // Serialize inference for compatibility with browsers that cannot run parallel model calls.
 const promise=serial.catch(()=>{}).then(async()=>{const tts=await load(options.status);const sound=await tts.generate(text,{voice,speed});const samples=sound.audio.buffer instanceof ArrayBuffer?sound.audio:new Float32Array(sound.audio),rate=sound.sampling_rate||24000;if(!samples?.length)throw Error("Kokoro returned no audio");const buffer=ctx().createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);return buffer}).catch(error=>{cache.delete(key);throw error});
 serial=promise.then(()=>{},()=>{});
 cache.set(key,promise);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
 return promise
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
 stop();
 const node=audioCtx.createBufferSource();node.buffer=buffer;node.connect(audioCtx.destination);source=node;
 await new Promise((resolve,reject)=>{node.onended=()=>{if(source===node)source=null;node.disconnect();resolve()};try{node.start()}catch(e){reject(e)}})
}
window.lexoraKokoro={speak,prepare,stop,unlock,ready:()=>!!model,stats:()=>stats};
})();