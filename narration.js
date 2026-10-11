(()=>{"use strict";
const $=id=>document.getElementById(id);
let engine=localStorage.getItem("lexora-narration-engine")||"kokoro";let kokoroVoice=localStorage.getItem("lexora-kokoro-voice")||"af_heart";if(kokoroVoice==="am_adam"||kokoroVoice==="bm_george"){kokoroVoice=kokoroVoice==="am_adam"?"am_michael":"bm_fable";localStorage.setItem("lexora-kokoro-voice",kokoroVoice)}let mode="read",playing=false,items=[],index=0,run=0,marker=null;
const css=document.createElement("style");css.textContent=".lex-narr{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#eaf4f7;padding:10px;border-radius:12px;margin-bottom:12px}.lex-narr select{padding:9px;border:1px solid #cbd8df;border-radius:8px}.lex-narr-status{font-size:12px;color:#617589}.lex-tappable{cursor:pointer;border-radius:3px}.lex-tappable:focus-visible{outline:2px solid #297eaa}.lex-active{background:#b8e6f1!important;color:#153b49!important}.reader.lex-audio-only .prose,.reader.lex-audio-only #epub-view{visibility:hidden}.lex-inspect{background:#edf6f9;padding:15px;border-radius:12px;margin:0 0 12px;border:1px solid #cbdfe6}.lex-inspect p{line-height:1.6}";
css.textContent+=`
body.lex-reader-fullscreen{overflow:hidden}
body.lex-reader-fullscreen #read .grid>.panel:first-child, #read .grid>.panel:first-child:fullscreen{position:fixed;inset:0;z-index:1000;background:#fff;display:flex;flex-direction:column;min-height:0;padding:12px clamp(10px,3vw,32px);border-radius:0;border:0;box-shadow:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.section-title, #read .grid>.panel:first-child:fullscreen>.section-title{display:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.callout, #read .grid>.panel:first-child:fullscreen>.callout{display:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-toolbar{flex-shrink:0;margin-bottom:7px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{flex-shrink:0;margin-bottom:8px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader, #read .grid>.panel:first-child:fullscreen>.reader{flex:1;min-height:0;height:auto}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot, #read .grid>.panel:first-child:fullscreen>.reader-foot{flex-shrink:0;margin-top:8px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect:not([hidden]){position:absolute;z-index:3;bottom:64px;left:12px;right:12px;max-height:45vh;overflow:auto;box-shadow:0 8px 25px #122c4226}
body.lex-reader-fullscreen #read .reader .prose{max-width:800px}
.lex-reader-exit{display:none}
body.lex-reader-fullscreen .lex-reader-exit{display:inline-flex}
@media(max-width:650px){body.lex-reader-fullscreen #read .grid>.panel:first-child{padding:8px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-toolbar{gap:5px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot .reader-copyright{display:none}body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{gap:5px;padding:7px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr .lex-narr-status{flex-basis:100%}}

/* Immersive reader: the book remains visible behind a light control overlay. */
body.lex-reader-fullscreen #read .grid>.panel:first-child{padding:0!important;background:#fffaf1!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-toolbar{display:none!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:7px 18px;margin:0!important;background:linear-gradient(transparent,#fffaf1e8);opacity:.75}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot .reader-copyright{display:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader{border:none;border-radius:0;height:100%;min-height:0;background:#fffaf1}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader .prose{padding-top:clamp(84px,11vh,140px);padding-bottom:100px;max-width:740px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100% - 28px);z-index:6;display:flex;flex-wrap:wrap;justify-content:center;background:#ffffffed;border:1px solid #dce6e6;box-shadow:0 6px 22px #122c421a;border-radius:18px;padding:7px!important;margin:0!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr .btn{padding:8px 11px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr [hidden]{display:none!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr .lex-advanced{display:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr.lex-show-advanced .lex-advanced{display:inline-flex}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr select.lex-advanced{display:none}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr.lex-show-advanced select.lex-advanced{display:block}
body.lex-reader-fullscreen.lex-controls-hidden #read .grid>.panel:first-child>.lex-narr{opacity:0;pointer-events:none;transform:translate(-50%,-14px)}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{transition:opacity .2s,transform .2s}
.lex-reader-reveal{display:none!important}
body.lex-reader-fullscreen .lex-reader-reveal{display:block!important;position:absolute;top:14px;right:15px;z-index:8;border-radius:20px;background:#ffffffc9;box-shadow:0 3px 14px #122c4215}
body.lex-reader-fullscreen:not(.lex-controls-hidden) .lex-reader-reveal{display:none!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect:not([hidden]){position:absolute;z-index:9;bottom:20px;left:50%;right:auto;width:min(460px,calc(100% - 24px));transform:translateX(-50%);background:#fff;border:1px solid #dce6e6;border-radius:18px;box-shadow:0 12px 34px #122c4230;padding:20px;max-height:55vh;overflow:auto}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect p{font-size:14px;margin:8px 0 12px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect .lex-sheet-close{float:right}
@media(max-width:650px){body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{top:8px;max-width:calc(100% - 12px)}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot{padding:5px 9px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader .prose{padding:80px 20px 85px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr .btn{padding:7px 9px;font-size:13px}}
`;document.head.appendChild(css);
const controls=document.createElement("div");controls.className="lex-narr";controls.innerHTML='<button class="btn" type="button" id="lex-read">Read</button><button class="btn" type="button" id="lex-listen">Read &amp; Listen</button><select class="lex-advanced" id="lex-engine" aria-label="Narration voice"><option value="kokoro">Natural voice · Kokoro</option><option value="system">Device voice</option></select><select class="lex-advanced" id="lex-kokoro-voice" aria-label="Kokoro accent and voice"><option value="af_heart">US · Female · Heart</option><option value="am_michael">US · Male · Michael</option><option value="bf_emma">UK · Female · Emma</option><option value="bm_fable">UK · Male · Fable</option></select><button class="btn primary" id="lex-play">▶ Play</button><button class="btn lex-advanced" id="lex-back">← Sentence</button><button class="btn lex-advanced" id="lex-forward">Sentence →</button><span class="lex-narr-status lex-advanced" id="lex-status">Ready</span><button class="btn lex-advanced" id="lex-enter" type="button">⛶ Full screen</button><button class="btn" id="lex-options" type="button" aria-label="More reading controls">⋯</button><button class="btn lex-reader-exit" id="lex-exit" type="button">✕ Exit</button>';
document.querySelector(".reader-toolbar").insertAdjacentElement("afterend",controls);
async function enterReader(){document.body.classList.add("lex-reader-fullscreen");document.body.classList.remove("lex-controls-hidden");$("lex-enter").hidden=true;const panel=document.querySelector("#read .grid>.panel:first-child");if(panel.requestFullscreen&&!document.fullscreenElement){try{await panel.requestFullscreen({navigationUI:"hide"})}catch(e){console.info("Using screen-filling reader layout",e)}}requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
function exitReader(){clearTimeout(fadeTimer);document.body.classList.remove("lex-reader-fullscreen","lex-controls-hidden");$("lex-enter").hidden=false;stop();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
$("lex-enter").onclick=enterReader;$("lex-exit").onclick=exitReader;
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
$("lex-engine").value=engine;$("lex-kokoro-voice").value=kokoroVoice;$("lex-kokoro-voice").hidden=engine!=="kokoro";const reveal=document.createElement("button");reveal.className="btn lex-reader-reveal";reveal.type="button";reveal.textContent="☰";reveal.setAttribute("aria-label","Show reader controls");document.querySelector("#read .grid>.panel:first-child").appendChild(reveal);reveal.onclick=()=>showControls();
let fadeTimer=null;function showControls(){document.body.classList.remove("lex-controls-hidden");clearTimeout(fadeTimer);if(playing)fadeTimer=setTimeout(()=>{if(playing&&inspect.hidden)document.body.classList.add("lex-controls-hidden")},4500)}
$("lex-options").onclick=()=>{controls.classList.toggle("lex-show-advanced");showControls()};
const inspect=document.createElement("div");inspect.className="lex-inspect";inspect.hidden=true;controls.insertAdjacentElement("afterend",inspect);
function sentences(s){return (s.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)||[]).map(v=>v.trim()).filter(v=>/[a-z]/i.test(v))}
function clear(){if(marker){marker.classList.remove("lex-active");marker=null}}
function stop(){run++;playing=false;window.lexoraKokoro?.stop();if(window.speechSynthesis)speechSynthesis.cancel();$("lex-play").textContent="▶ Play"}
function epubBody(){try{return document.querySelector("#epub-view iframe")?.contentDocument?.body}catch{return null}}
function prepare(reset){
 clear();if(reset)index=0;
 const guide=$("booklist").value==="guide",body=guide?$("guide"):epubBody();items=[];
 if(!body){$("lex-status").textContent="Waiting for EPUB page";return false}
 body.querySelectorAll("p").forEach(p=>{
  const txt=p.textContent||"";
  if(guide){
   let parts=sentences(txt);p.replaceChildren(...parts.map((part,i)=>{const sp=document.createElement("span");sp.textContent=part+(i<parts.length-1?" ":"");return sp}));
   p.querySelectorAll("span").forEach(sp=>items.push({text:sp.textContent.trim(),el:sp}))
  }else{
   if(p.children.length===0){const parts=sentences(txt);p.replaceChildren(...parts.map((part,i)=>{const sp=p.ownerDocument.createElement("span");sp.textContent=part+(i<parts.length-1?" ":"");return sp}));p.querySelectorAll("span").forEach(sp=>items.push({text:sp.textContent.trim(),el:sp}))}else{sentences(txt).forEach(t=>items.push({text:t,el:p}))}
  }
 });
 items.forEach(enableTap);index=Math.min(index,Math.max(0,items.length-1));$("lex-status").textContent=items.length?"Sentence "+(index+1)+" / "+items.length:"No text on this page";
 return items.length>0
}
function enableTap(item,number){
 const el=item.el;
 if(!el)return;
 if(el.dataset.lexReplay==="1")return;el.dataset.lexReplay="1";el.classList.add("lex-tappable");el.tabIndex=0;el.title="Tap to listen again";
 function replay(){if(mode!=="both")return;const selection=el.ownerDocument.getSelection?.();if(selection&&!selection.isCollapsed)return;stop();index=number;play()}
 el.addEventListener("click",replay);
 el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();replay()}});
}
function highlight(){clear();const item=items[index];if(!item)return;if(mode!=="listen"){marker=item.el;marker.classList.add("lex-active");marker.scrollIntoView?.({block:"nearest",behavior:"smooth"})}$("lex-status").textContent="Sentence "+(index+1)+" / "+items.length}
function play(){showControls();if(!items.length&&!prepare(true))return;if(engine==="system"&&!window.speechSynthesis){$("lex-status").textContent="Voice unavailable";return}const session=++run;playing=true;inspect.hidden=true;$("lex-play").textContent="Ⅱ Pause";speechSynthesis.cancel();
 async function next(){if(session!==run||!playing)return;if(index>=items.length){stop();return}highlight();if(engine==="kokoro"&&window.lexoraKokoro){try{await window.lexoraKokoro.speak(items[index].text,{nextText:items[index+1]?.text||"",voice:kokoroVoice,speed:Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9")),status:message=>{if(session===run)$("lex-status").textContent=message},cancelled:()=>session!==run||!playing});if(session===run&&playing){index++;next()}return}catch(error){if(session!==run)return;$("lex-status").textContent="Kokoro unavailable; using device voice";console.warn("Kokoro unavailable",error);engine="system";$("lex-engine").value=engine;localStorage.setItem("lexora-narration-engine",engine)}}const utterance=new SpeechSynthesisUtterance(items[index].text);utterance.lang="en-US";utterance.rate=Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9"));const wanted=JSON.parse(localStorage.getItem("lexora-voice-choice")||'""');const vs=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("en-us"));utterance.voice=vs.find(v=>v.voiceURI===wanted)||vs[0]||null;utterance.onend=()=>{if(session===run&&playing){index++;next()}};utterance.onerror=()=>{if(session===run){stop();$("lex-status").textContent="Speech stopped"}};speechSynthesis.speak(utterance)}
 next()
}
inspect.addEventListener("click",e=>{if(e.target.closest(".lex-sheet-close"))inspect.hidden=true});
function examine(i){const item=items[i];if(!item)return;inspect.hidden=false;showControls();inspect.innerHTML='<button type="button" class="btn lex-sheet-close" aria-label="Close">✕</button><p><b>Selected sentence</b></p><p id="lex-sentence"></p><button class="btn primary" id="lex-analyze">Find expressions</button><p class="small muted">You can also select a shorter phrase above.</p>';$("lex-sentence").textContent=item.text;
 function send(){const chosen=window.getSelection()?.toString().trim()||item.text;$("lookup").value=chosen;if(typeof window.lexoraAnalyze==="function")window.lexoraAnalyze(chosen,item.text)}
 $("lex-analyze").onclick=()=>{window.getSelection()?.removeAllRanges();send()};$("lex-sentence").addEventListener("mouseup",()=>{if(window.getSelection()?.toString().trim())send()})
}
function pause(){showControls();stop();clear();inspect.hidden=false;inspect.innerHTML='<button type="button" class="btn lex-sheet-close" aria-label="Close">✕</button><b>Explore a sentence</b><div class="buttonrow" style="margin-top:10px"><button class="btn" id="lex-current">Current sentence</button><button class="btn" id="lex-previous">Previous sentence</button></div>';$("lex-current").onclick=()=>examine(Math.min(index,items.length-1));$("lex-previous").onclick=()=>examine(Math.max(0,index-1))}
function chooseMode(next){showControls();controls.classList.remove("lex-show-advanced");mode=next;stop();inspect.hidden=true;clear();$("lex-read").classList.toggle("primary",mode==="read");$("lex-listen").classList.toggle("primary",mode==="both");$("lex-play").hidden=mode==="read";$("lex-back").hidden=mode==="read";$("lex-forward").hidden=mode==="read";$("lex-engine").hidden=mode==="read";$("lex-kokoro-voice").hidden=mode==="read"||engine!=="kokoro";$("lex-status").hidden=mode==="read";enterReader();if(mode==="both")play()}
$("lex-read").onclick=()=>chooseMode("read");$("lex-listen").onclick=()=>chooseMode("both");
$("lex-play").onclick=()=>{if(playing)pause();else{if(mode==="read")chooseMode("both");else{enterReader();play()}}};
$("lex-engine").onchange=e=>{stop();engine=e.target.value;localStorage.setItem("lexora-narration-engine",engine);$("lex-kokoro-voice").hidden=engine!=="kokoro";$("lex-status").textContent=engine==="kokoro"?"Kokoro ready to load on Play":"Device voice selected"};
$("lex-kokoro-voice").onchange=e=>{stop();kokoroVoice=e.target.value;localStorage.setItem("lexora-kokoro-voice",kokoroVoice);$("lex-status").textContent=({"af_heart":"American female voice selected","am_michael":"American male voice selected","bf_emma":"British female voice selected","bm_fable":"British male voice selected"}[kokoroVoice]||"Voice selected")};
$("lex-back").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.max(0,index-1);highlight()};
$("lex-forward").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.min(items.length-1,index+1);highlight()};
["chapter","booklist","prev","next","load-guide","upload-book"].forEach(id=>$(id)?.addEventListener("click",()=>{stop();setTimeout(()=>prepare(true),350)}));
$("chapter").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),100)});
$("booklist").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),900)});
const observer=new MutationObserver(()=>{if($("booklist").value!=="guide"&&!playing){setTimeout(()=>prepare(true),250)}});observer.observe($("epub-view"),{childList:true});
$("lex-read").classList.add("primary");$("lex-play").hidden=$("lex-back").hidden=$("lex-forward").hidden=$("lex-engine").hidden=$("lex-kokoro-voice").hidden=$("lex-status").hidden=true;
$("reader").addEventListener("click",e=>{if(!document.body.classList.contains("lex-reader-fullscreen"))return;if(window.getSelection()?.toString().trim())return;if(e.target.closest(".lex-tappable"))return;showControls()});
prepare(true);
})();