/* LumoUp Kokoro worker: synthesizes off the main thread so the reader, highlight and audio timing stay responsive. */
const MODEL="onnx-community/Kokoro-82M-v1.0-ONNX";
let tts=null,serial=Promise.resolve();
const progress=e=>{if(e?.status==="progress"&&e.total>1e6)self.postMessage({type:"progress",progress:e.progress||0})};
async function load(gpuAllowed){
 const {KokoroTTS}=await import("https://esm.sh/kokoro-js@1.2.1?bundle");
 // A computer's GPU makes speech many times faster than real time; without one, the 8-bit model runs on the CPU.
 let gpu=false;if(gpuAllowed){try{gpu=!!(await navigator.gpu?.requestAdapter())}catch{}}
 if(gpu){
  try{tts=await KokoroTTS.from_pretrained(MODEL,{dtype:"fp32",device:"webgpu",progress_callback:progress});return "webgpu"}
  // A failed WebGPU start leaves the ONNX runtime unusable in this worker: the page starts a new one without the GPU.
  catch(e){const error=new Error(String(e?.message||e));error.gpu=true;throw error}
 }
 tts=await KokoroTTS.from_pretrained(MODEL,{dtype:"q8",device:"wasm",progress_callback:progress});return "wasm";
}
self.onmessage=e=>{
 const m=e.data;
 if(m.type==="load"){load(m.gpu).then(device=>self.postMessage({type:"ready",device}),error=>self.postMessage({type:"failed",error:String(error?.message||error),gpu:!!error.gpu}));return}
 if(m.type!=="generate")return;
 // One sentence at a time: the model cannot run two calls at once.
 serial=serial.then(async()=>{
  try{
   const started=performance.now(),sound=await tts.generate(m.text,{voice:m.voice,speed:m.speed});
   const audio=sound.audio instanceof Float32Array&&sound.audio.buffer instanceof ArrayBuffer?sound.audio:new Float32Array(sound.audio);
   self.postMessage({type:"audio",id:m.id,audio,rate:sound.sampling_rate||24000,ms:performance.now()-started},[audio.buffer]);
  }catch(error){self.postMessage({type:"error",id:m.id,error:String(error?.message||error)})}
 });
};
