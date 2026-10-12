/* Lexora Kokoro: synthesize the next sentence while the current audio plays. */
(()=>{"use strict";
let modelPromise=null,model=null,context=null,source=null,serial=Promise.resolve();
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
 if(!gpu)return wasm();
 try{return await mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"fp32",device:"webgpu",progress_callback:progress})}
 catch(e){localStorage.setItem("lexora-kokoro-wasm","1");throw e}
})().then(m=>{model=m;return m},e=>{modelPromise=null;throw e})}return modelPromise}
function prepare(text,options={}){
 if(!text)return Promise.resolve(null);
 const speed=options.speed||1,voice=options.voice||"af_heart",key=voice+"|"+speed+"|"+text;
 if(cache.has(key))return cache.get(key);
 // Serialize inference for compatibility with browsers that cannot run parallel model calls.
 const promise=serial.catch(()=>{}).then(async()=>{const tts=await load(options.status);const sound=await tts.generate(text,{voice,speed});const samples=sound.audio,rate=sound.sampling_rate||24000;if(!samples?.length)throw Error("Kokoro returned no audio");const buffer=ctx().createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);return buffer}).catch(error=>{cache.delete(key);throw error});
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
window.lexoraKokoro={speak,prepare,stop,unlock,ready:()=>!!model};
})();