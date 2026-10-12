/* Lexora Kokoro worker: runs wasm synthesis off the main thread so the reader, highlight and audio timing stay responsive. */
let ttsPromise=null;
function load(){
 if(!ttsPromise)ttsPromise=import("https://esm.sh/kokoro-js@1.2.1?bundle").then(mod=>mod.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm",progress_callback:e=>{if(e?.status==="progress"&&e.total>1e6)self.postMessage({type:"progress",progress:e.progress||0})}})).catch(e=>{ttsPromise=null;throw e});
 return ttsPromise;
}
self.onmessage=async e=>{
 const {id,text,voice,speed}=e.data;
 try{
  const tts=await load();
  if(!text){self.postMessage({id,ok:true});return}
  const started=performance.now(),sound=await tts.generate(text,{voice,speed});
  // With cross-origin isolation the samples can live in shared memory, which cannot be transferred: copy them out first.
  const audio=sound.audio.buffer instanceof ArrayBuffer?sound.audio:new Float32Array(sound.audio);
  self.postMessage({id,ok:true,audio,rate:sound.sampling_rate||24000,ms:performance.now()-started,isolated:self.crossOriginIsolated===true},[audio.buffer]);
 }catch(error){self.postMessage({id,ok:false,error:String(error?.message||error)})}
};
