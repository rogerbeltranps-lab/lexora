/* Lexora speech: every Listen / Play button goes through here so iPhone quirks are handled in one place. */
(()=>{"use strict";
const synth=window.speechSynthesis;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
// iOS 17+ lists Apple's novelty voices as en-US. Some of them speak nothing in Safari, and one of them was often voices[0].
const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Fred|Good News|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
let primer=null,current=null,cancelledAt=0,generation=0;
// 0.1 s of 8-bit silence, built here so no audio file has to be cached.
function silentWav(){const n=800,d=new DataView(new ArrayBuffer(44+n)),s=(o,t)=>[...t].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));s(0,"RIFF");d.setUint32(4,36+n,true);s(8,"WAVEfmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);s(36,"data");d.setUint32(40,n,true);for(let i=0;i<n;i++)d.setUint8(44+i,128);return URL.createObjectURL(new Blob([d],{type:"audio/wav"}))}
// Call inside the tap handler. The iPhone ring/silent switch mutes web audio unless the page holds the media playback session.
function unlock(){
 try{if(navigator.audioSession&&navigator.audioSession.type!=="playback")navigator.audioSession.type="playback"}catch{}
 // Older iOS has no audioSession API; starting an <audio> element during a tap moves the page to the playback session.
 if(isIOS)try{if(!primer){primer=new Audio(silentWav());primer.setAttribute("playsinline","");primer.preload="auto"}primer.currentTime=0;primer.play()?.catch?.(()=>{})}catch{}
}
// Apple puts the quality in the voice id (com.apple.voice.premium.en-US.Ava); the name alone is the same for every quality.
function quality(v){const id=String(v?.voiceURI||"");return /premium/i.test(id)?"Premium":/enhanced/i.test(id)?"Enhanced":/compact/i.test(id)?"Basic":""}
const rank=v=>({Premium:0,Enhanced:1}[quality(v)]??2);
function voices(){return synth?synth.getVoices().filter(v=>/^en[-_]us$/i.test(v.lang)&&!NOVELTY.test(v.name)).sort((a,b)=>rank(a)-rank(b)):[]}
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
  let started=false,currentStartedAt=0,lastBoundary=0,hadBoundary=false;current=u;
  const estimated=60000*Math.max(1,text.trim().split(/\s+/).length)/(130*Math.max(.5,u.rate));
  const maxDuration=Math.max(18000,Math.min(90000,estimated*1.9+8500));
  const failStall=()=>{if(current!==u)return;current=null;generation++;try{synth.cancel();cancelledAt=Date.now()}catch{}options.onerror?.("speech-stalled")};
  u.onstart=()=>{started=true;currentStartedAt=Date.now();lastBoundary=currentStartedAt;if(current===u)options.onstart?.()};
  // One utterance can contain several sentences; boundary offsets let the reader follow without restarting speech after every period.
  u.onboundary=e=>{if(current===u){lastBoundary=Date.now();hadBoundary=true;options.onboundary?.({charIndex:e.charIndex,elapsedTime:e.elapsedTime,name:e.name})}};
  u.onend=()=>{if(current===u){current=null;options.onend?.()}};
  u.onerror=e=>{if(current!==u)return;current=null;options.onerror?.(e.error||"error")};
  synth.speak(u);if(synth.paused)synth.resume();
  // Chrome and Safari sometimes never fire onend (long text, remote voices); finish the sentence ourselves once speech has gone quiet.
  let quiet=0;const watch=setInterval(()=>{
   if(current!==u){clearInterval(watch);return}
   if(started&&!synth.speaking&&!synth.pending){
    if(++quiet>=3){clearInterval(watch);current=null;options.onend?.()}return
   }
   quiet=0;
   // iOS can permanently report "speaking" without boundaries or onend.
   // Fail once and let Play resume from the last highlighted sentence.
   const now=Date.now();
   if(started&&((now-currentStartedAt>maxDuration)||(hadBoundary&&now-lastBoundary>16000))){
    clearInterval(watch);failStall();
   }
  },500);
  // A downloaded-then-removed or enhanced voice can stay silent on iPhone: fall back once to the default voice.
  if(chosen&&retry)setTimeout(()=>{
   if(current===u&&!started&&!synth.speaking){
    current=null;synth.cancel();cancelledAt=Date.now();
    setTimeout(()=>say("",false),120);
   }
  },2500);
  // Some WebKit/Chromium versions never emit start or error: return an actionable failure.
  setTimeout(()=>{
   if(current===u&&!started&&!synth.speaking&&!synth.pending){
    current=null;options.onerror?.("speech-not-started");
   }
  },6500);
 };
 // Safari on iPhone drops a speak() issued straight after cancel(). Speech is already unlocked by the utterance
 // that was playing, so a short delay is safe; with nothing playing, speak synchronously to keep the user's tap.
 if(busy)setTimeout(()=>say(options.voiceURI||"",true),80);else say(options.voiceURI||"",true);
 return true;
}
// Only cancel real speech: a needless cancel() before the first speak() is what can leave an iPhone silent.
function cancel(){
 // onend has already cleared current, even if WebKit briefly still reports speaking.
 // Cancelling that completed sentence used to delay every new sentence outside the initial tap.
 const active=!!current;
 generation++;current=null;
 if(active&&synth&&(synth.speaking||synth.pending)){synth.cancel();cancelledAt=Date.now()}
}
// iOS fills the voice list lazily; asking once at load makes it ready by the first tap.
if(synth)synth.getVoices();
// Words and flashcards use the same built-in voice as book narration.
function speakBest(text,options={}){return speak(text,options)}
window.lexoraSpeech={speak,speakBest,cancel,unlock,voices,quality};
})();
