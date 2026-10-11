/* Optional on-device neural narration for Lexora. */
(()=>{"use strict";
let modelPromise=null,context=null,source=null;
function ctx(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)();return context}
function stop(){if(source){try{source.stop()}catch{}source.disconnect();source=null}}
async function load(status){if(!modelPromise){modelPromise=(async()=>{status("Downloading Kokoro voice model (first use may take a while)…");const mod=await import("https://esm.sh/kokoro-js@1.2.1?bundle");const device=navigator.gpu?"webgpu":"wasm";try{return await mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:device==="webgpu"?"fp32":"q8",device})}catch(e){if(device!=="webgpu")throw e;status("Trying Kokoro compatibility mode…");return mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm"})}})().catch(e=>{modelPromise=null;throw e})}return modelPromise}
async function speak(text,options={}){const audioCtx=ctx();await audioCtx.resume();const tts=await load(options.status||(()=>{}));options.status?.("Generating natural voice…");const sound=await tts.generate(text,{voice:"af_heart",speed:options.speed||1});if(options.cancelled?.())return;const samples=sound.audio;const rate=sound.sampling_rate||24000;if(!samples?.length)throw Error("Kokoro returned no audio");const buffer=audioCtx.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);stop();const node=audioCtx.createBufferSource();node.buffer=buffer;node.connect(audioCtx.destination);source=node;await new Promise((resolve,reject)=>{node.onended=()=>{if(source===node)source=null;resolve()};try{node.start()}catch(e){reject(e)}})}
window.lexoraKokoro={speak,stop};
})();
