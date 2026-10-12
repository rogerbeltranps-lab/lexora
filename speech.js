/* Lexora speech: every Listen / Play button goes through here so iPhone quirks are handled in one place. */
(()=>{"use strict";
const synth=window.speechSynthesis;
// iOS 17+ lists Apple's novelty voices as en-US. Some of them speak nothing in Safari, and one of them was often voices[0].
const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Fred|Good News|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
let primer=null,current=null,cancelledAt=0,generation=0;
// 0.1 s of 8-bit silence, built here so no audio file has to be cached.
function silentWav(){const n=800,d=new DataView(new ArrayBuffer(44+n)),s=(o,t)=>[...t].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));s(0,"RIFF");d.setUint32(4,36+n,true);s(8,"WAVEfmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);s(36,"data");d.setUint32(40,n,true);for(let i=0;i<n;i++)d.setUint8(44+i,128);return URL.createObjectURL(new Blob([d],{type:"audio/wav"}))}
// Call inside the tap handler. The iPhone ring/silent switch mutes web audio unless the page holds the media playback session.
function unlock(){
 try{if(navigator.audioSession&&navigator.audioSession.type!=="playback")navigator.audioSession.type="playback"}catch{}
 // Older iOS has no audioSession API; starting an <audio> element during a tap moves the page to the playback session.
 try{if(!primer){primer=new Audio(silentWav());primer.setAttribute("playsinline","");primer.preload="auto"}primer.currentTime=0;primer.play()?.catch?.(()=>{})}catch{}
}
function voices(){return synth?synth.getVoices().filter(v=>/^en[-_]us$/i.test(v.lang)&&!NOVELTY.test(v.name)):[]}
function speak(text,options={}){
 text=String(text||"").trim();if(!text)return false;
 if(!synth||!("SpeechSynthesisUtterance"in window)){options.onerror?.("unsupported");return false}
 unlock();
 cancel();const busy=Date.now()-cancelledAt<150,mine=generation;
 const say=(voiceURI,retry)=>{
  if(mine!==generation)return;
  const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=Number(options.rate)||0.9;u.volume=1;
  // With no saved choice, leave the voice unset so iOS uses its own American default.
  const chosen=voiceURI&&voices().find(v=>v.voiceURI===voiceURI);if(chosen)u.voice=chosen;
  let started=false;current=u;
  u.onstart=()=>{started=true;if(current===u)options.onstart?.()};
  u.onend=()=>{if(current===u){current=null;options.onend?.()}};
  u.onerror=e=>{if(current!==u||e.error==="interrupted"||e.error==="canceled")return;current=null;options.onerror?.(e.error||"error")};
  synth.speak(u);if(synth.paused)synth.resume();
  // A downloaded-then-removed or enhanced voice can stay silent on iPhone: fall back once to the default voice.
  if(chosen&&retry)setTimeout(()=>{if(current===u&&!started&&!synth.speaking){current=null;synth.cancel();setTimeout(()=>say("",false),80)}},2000);
 };
 // Safari on iPhone drops a speak() issued straight after cancel(). Speech is already unlocked by the utterance
 // that was playing, so a short delay is safe; with nothing playing, speak synchronously to keep the user's tap.
 if(busy)setTimeout(()=>say(options.voiceURI||"",true),80);else say(options.voiceURI||"",true);
 return true;
}
// Only cancel real speech: a needless cancel() before the first speak() is what can leave an iPhone silent.
function cancel(){generation++;current=null;if(synth&&(synth.speaking||synth.pending)){synth.cancel();cancelledAt=Date.now()}}
// iOS fills the voice list lazily; asking once at load makes it ready by the first tap.
if(synth)synth.getVoices();
window.lexoraSpeech={speak,cancel,unlock,voices};
})();
