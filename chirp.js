/* Sentence chunks only: no speculative synthesis and no automatic paid retries. */
(()=>{'use strict';
const voices=['Charon','Orus','Aoede','Kore','Leda','Achernar'];
let context,source,controller,finish,generation=0;
const memory=new Map();
function unlock(){
 try{context ||= new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});
 const node=context.createBufferSource();node.buffer=context.createBuffer(1,1,22050);node.connect(context.destination);node.start();}catch{}
}
function stop(){generation++;controller?.abort();controller=null;if(source){source.onended=null;try{source.stop();source.disconnect()}catch{}source=null}finish?.();finish=null;}
function chunks(text){const out=[];let part='';for(const char of text){if(new TextEncoder().encode(part+char).length>1000){out.push(part);part=''}part+=char}if(part.trim())out.push(part);return out;}
async function speak(text,options={}){
 const mine=generation, cancelled=()=>mine!==generation||options.cancelled?.();
 if(!context||context.state!=='running')throw Error('Tap Play to enable audio');
 const endpoint=localStorage.getItem('lexora-chirp-endpoint');
 if(!endpoint||!/^https:\/\//.test(endpoint))throw Error('Set the cloud narration URL in Settings');
 const voice=voices.includes(options.voice)?options.voice:'Charon';
 for(const part of chunks(text)){
  if(cancelled())return;
  const key=JSON.stringify([voice,part]);let bytes=memory.get(key);
  if(!bytes){
   let token,authTimer;
   try{token=await Promise.race([Promise.resolve(window.lexoraTtsToken?.()),new Promise((_,reject)=>{authTimer=setTimeout(()=>reject(Error('Sign-in timed out')),8000)})]);}finally{clearTimeout(authTimer)}
   if(cancelled())return;
   if(!token)throw Error('Sign in to use cloud narration');
   const request=new AbortController();controller=request;const timer=setTimeout(()=>request.abort(),25000);
   try{
    options.status?.('Preparing Chirp voice…');
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({text:part,voice}),signal:request.signal});
    if(!response.ok){const body=await response.json().catch(()=>({}));throw Error(body.error||'Cloud voice unavailable');}
    const body=await response.json();bytes=Uint8Array.from(atob(body.audio),c=>c.charCodeAt(0)).buffer;
    memory.set(key,bytes);while(memory.size>20)memory.delete(memory.keys().next().value);
   }finally{clearTimeout(timer);if(controller===request)controller=null}
  }
  if(cancelled())return;
  const buffer=await context.decodeAudioData(bytes.slice(0));if(cancelled())return;
  if(context.state!=='running')throw Error('Audio interrupted; tap Play again');
  options.status?.('Speaking…');options.onstart?.();
  const node=context.createBufferSource();node.buffer=buffer;node.playbackRate.value=Math.max(.6,Math.min(1.2,Number(options.speed)||.9));node.connect(context.destination);source=node;
  await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{try{node.stop()}catch{}done(Error('Audio playback interrupted'));},buffer.duration/node.playbackRate.value*1000+5000);
   function done(error){clearTimeout(timer);node.onended=null;node.disconnect();if(source===node)source=null;finish=null;error?reject(error):resolve();}
   finish=()=>done();node.onended=()=>done();try{node.start()}catch(e){done(e)}
  });
 }
}
window.lexoraChirp={voices,speak,stop,unlock};
})();
