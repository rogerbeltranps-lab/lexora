/* LumoUp audio check: on-device diagnostics for when the iPhone stays silent. Writes nothing to storage. */
(()=>{"use strict";
const anchor=document.getElementById("test-voice")?.closest(".buttonrow");if(!anchor)return;
const box=document.createElement("div");box.className="panel";box.style.cssText="margin:12px 0;padding:12px";
box.innerHTML='<b>Audio check</b><p class="small muted">If you hear nothing, tap each test, then “Copy report” and paste it to Claude.</p><div class="buttonrow"><button class="btn" type="button" id="ac-beep">1 · Beep</button><button class="btn" type="button" id="ac-plain">2 · Plain voice</button><button class="btn" type="button" id="ac-lexora">3 · LumoUp voice</button><button class="btn" type="button" id="ac-copy">Copy report</button></div><pre id="ac-log" style="white-space:pre-wrap;font-size:11px;max-height:260px;overflow:auto;margin-top:8px"></pre>';
anchor.after(box);
const out=box.querySelector("#ac-log"),t0=Date.now(),synth=window.speechSynthesis;
const log=m=>{out.textContent+="["+((Date.now()-t0)/1000).toFixed(1)+"s] "+m+"\n"};
const state=()=>synth?"speaking="+synth.speaking+" pending="+synth.pending+" paused="+synth.paused:"no speechSynthesis";
function info(){
 const vs=synth?synth.getVoices():[],us=vs.filter(v=>/^en[-_]us$/i.test(v.lang));
 log("app: "+(document.getElementById("lex-update-status")?.textContent.match(/Versió instal·lada: [^.]*/)?.[0]||"?"));
 log("ua: "+navigator.userAgent);
 log("standalone: "+(navigator.standalone===true||matchMedia("(display-mode: standalone)").matches));
 log("audioSession: "+(navigator.audioSession?navigator.audioSession.type:"none"));
 log("speechSynthesis: "+!!synth+", voices: "+vs.length+", en-US: "+us.length+(us.length?" ("+us.slice(0,6).map(v=>v.name+(v.default?"*":"")).join(", ")+")":""));
 log("saved voice: "+(localStorage.getItem("lexora-voice-choice")||"none"));
}
info();if(synth)synth.addEventListener?.("voiceschanged",()=>log("voiceschanged: "+synth.getVoices().length+" voices, en-US: "+synth.getVoices().filter(v=>/^en[-_]us$/i.test(v.lang)).length));
const watch=label=>[300,1500,4000].forEach(ms=>setTimeout(()=>log(label+" after "+ms+"ms: "+state()),ms));
box.querySelector("#ac-beep").onclick=()=>{
 try{const C=window.AudioContext||window.webkitAudioContext,ctx=new C();log("beep: context "+ctx.state);ctx.resume().then(()=>log("beep: resumed, "+ctx.state)).catch(e=>log("beep: resume failed "+e));const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=660;g.gain.value=0.25;o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.5);o.onended=()=>{log("beep: ended (did you hear it?)");ctx.close?.()}}catch(e){log("beep error: "+e)}
};
box.querySelector("#ac-plain").onclick=()=>{
 if(!synth){log("plain: no speechSynthesis");return}
 try{const u=new SpeechSynthesisUtterance("This is a plain voice test.");u.lang="en-US";
  u.onstart=()=>log("plain: start");u.onend=()=>log("plain: end");u.onerror=e=>log("plain: error "+(e.error||"?"));
  log("plain: speak, before "+state());synth.speak(u);watch("plain")}catch(e){log("plain exception: "+e)}
};
box.querySelector("#ac-lexora").onclick=()=>{
 if(!window.lexoraSpeech){log("lexora: speech.js not loaded");return}
 log("lexora: speak, before "+state());
 lexoraSpeech.speak("This is the LumoUp voice test.",{voiceURI:JSON.parse(localStorage.getItem("lexora-voice-choice")||'""'),onstart:()=>log("lexora: start"),onend:()=>log("lexora: end"),onerror:e=>log("lexora: error "+e)});watch("lexora");
};
box.querySelector("#ac-copy").onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);log("report copied")}catch{const r=document.createRange();r.selectNodeContents(out);const s=getSelection();s.removeAllRanges();s.addRange(r);log("select the text above and copy it")}};
})();
