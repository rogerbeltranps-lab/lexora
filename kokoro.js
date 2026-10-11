/* Lexora Kokoro: synthesize the next sentence while the current audio plays. */
(()=>{"use strict";
let modelPromise=null,context=null,source=null,serial=Promise.resolve();
const cache=new Map(),MAX_CACHE=8;
function ctx(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)();return context}
function stop(){if(source){const old=source;source=null;try{old.stop()}catch{}old.disconnect()}}
async function load(status=()=>{}){if(!modelPromise){modelPromise=(async()=>{status("Downloading Kokoro voice model (first use may take a while)…");const mod=await import("https://esm.sh/kokoro-js@1.2.1?bundle");const device=navigator.gpu?"webgpu":"wasm";try{return await mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:device==="webgpu"?"fp32":"q8",device})}catch(e){if(device!=="webgpu")throw e;status("Trying Kokoro compatibility mode…");return mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm"})}})().catch(e=>{modelPromise=null;throw e})}return modelPromise}
function prepare(text,options={}){
 if(!text)return Promise.resolve(null);
 const speed=options.speed||1,key=speed+"|"+text;
 if(cache.has(key))return cache.get(key);
 // Serialize inference for compatibility with browsers that cannot run parallel model calls.
 const promise=serial.catch(()=>{}).then(async()=>{const tts=await load(options.status);const sound=await tts.generate(text,{voice:"af_heart",speed});const samples=sound.audio,rate=sound.sampling_rate||24000;if(!samples?.length)throw Error("Kokoro returned no audio");const buffer=ctx().createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);return buffer}).catch(error=>{cache.delete(key);throw error});
 serial=promise.then(()=>{},()=>{});
 cache.set(key,promise);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
 return promise
}
async function speak(text,options={}){
 const audioCtx=ctx();await audioCtx.resume();
 options.status?.("Preparing natural voice…");
 // Queue upcoming audio before awaiting this sentence. It will be ready during playback.
 const current=prepare(text,options);
 if(options.nextText)prepare(options.nextText,{speed:options.speed,status:()=>{}}).catch(()=>{});
 const buffer=await current;
 if(options.cancelled?.())return;
 stop();
 const node=audioCtx.createBufferSource();node.buffer=buffer;node.connect(audioCtx.destination);source=node;
 await new Promise((resolve,reject)=>{node.onended=()=>{if(source===node)source=null;node.disconnect();resolve()};try{node.start()}catch(e){reject(e)}})
}
window.lexoraKokoro={speak,prepare,stop};
})();