(()=>{"use strict";
const $=id=>document.getElementById(id);
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);let engine=localStorage.getItem("lexora-narration-engine")||"kokoro";if(ios&&!localStorage.getItem("lexora-ios-voice-choice-v2")){engine="system";localStorage.setItem("lexora-narration-engine",engine);localStorage.setItem("lexora-ios-voice-choice-v2","1")}let kokoroVoice=localStorage.getItem("lexora-kokoro-voice")||"af_heart";if(kokoroVoice==="am_adam"||kokoroVoice==="bm_george"){kokoroVoice=kokoroVoice==="am_adam"?"am_michael":"bm_fable";localStorage.setItem("lexora-kokoro-voice",kokoroVoice)}let mode="read",playing=false,items=[],index=0,run=0,marker=null;
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
#lex-reader-results[hidden]{display:none!important}
#lex-reader-results{position:absolute;z-index:15;bottom:12px;left:50%;transform:translateX(-50%);width:min(580px,calc(100% - 24px));max-height:min(65vh,680px);overflow:auto;padding:18px;background:#fff;border:1px solid #cbdde6;border-radius:18px;box-shadow:0 12px 40px #132e4240}
.lex-results-top{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-18px;background:white;padding:8px 0 12px;z-index:1;border-bottom:1px solid #e1e9ef}
#lex-reader-results #discovery{margin-top:12px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect p{font-size:14px;margin:8px 0 12px}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-inspect .lex-sheet-close{float:right}
@media(max-width:650px){body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr{top:8px;max-width:calc(100% - 12px)}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot{padding:5px 9px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader .prose{padding:80px 20px 85px}body.lex-reader-fullscreen #read .grid>.panel:first-child>.lex-narr .btn{padding:7px 9px;font-size:13px}}


/* Mobile dictionary: keep the selected word visible and the actions reachable. */
#lex-reader-results{display:flex;flex-direction:column;overflow:hidden;max-height:min(76dvh,720px);min-height:0}
#lex-reader-results #lex-results-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))}
#lex-reader-results .lex-results-top{position:relative;top:auto;flex:none;padding:4px 0 10px}
#lex-reader-results .lex-dictionary-heading{position:sticky;top:0;z-index:3;background:#fff;padding:6px 0 10px;border-bottom:1px solid #e1e9ef}
#lex-reader-results .lex-selected-word{display:block!important;visibility:visible!important;font-family:Georgia,serif;font-weight:700;font-size:clamp(27px,5vw,38px);line-height:1.2;color:#1c3547!important;overflow-wrap:anywhere;white-space:normal;margin:9px 0 0}
#lex-reader-results #discovery{min-width:0}
#lex-reader-results .quote{overflow-wrap:anywhere}
@media(max-width:650px){
 #lex-reader-results{position:fixed;top:auto;bottom:0;left:0;right:0;transform:none;width:100%;max-width:none;height:min(77dvh,760px);max-height:calc(100dvh - env(safe-area-inset-top,0px) - 75px);padding:12px 16px 0;border-radius:20px 20px 0 0;box-sizing:border-box}
 #lex-reader-results #lex-results-content{padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}
 #lex-reader-results .chip{max-width:100%;white-space:normal}
 #lex-reader-results .sense-entry{min-width:0}
 #lex-reader-results .sense-entry label{overflow-wrap:anywhere}
 #lex-reader-results #dictionary-listen{min-height:44px}
}

/* Keep each radio and its full answer together in the mobile discovery sheet. */
#discovery .lex-sense-option{display:grid!important;grid-template-columns:22px minmax(0,1fr)!important;column-gap:12px!important;align-items:start!important;justify-content:initial!important;width:100%;margin:10px 0!important;padding:12px 8px!important;border-radius:10px;line-height:1.5;font-size:15px;text-align:left;white-space:normal}
#discovery .lex-sense-radio{appearance:auto;-webkit-appearance:radio;display:block;position:static;flex:none;width:20px;height:20px;margin:2px 0 0!important;align-self:start}
#discovery .lex-sense-copy{display:block;min-width:0;overflow-wrap:anywhere;white-space:normal;text-align:left}
#discovery .lex-sense-copy .muted{display:inline}
#discovery .sense-entry fieldset{min-width:0}
@media(max-width:650px){#discovery .lex-sense-option{grid-template-columns:22px minmax(0,1fr)!important;padding:10px 4px!important;font-size:14px}}

/* Reader appearance controls share the application's existing theme and font settings. */
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(.reader.black){background:#000!important;color:#fff}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader.black{background:#000!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(.reader.black)>.reader-foot{background:linear-gradient(transparent,#000);color:#fff}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(.reader.black)>.reader-foot .muted{color:#fff}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(.reader.white){background:#fff!important}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader.white{background:#fff!important}
#lex-appearance{display:none}
body.lex-reader-fullscreen #lex-appearance:not([hidden]){display:flex;position:absolute;top:68px;right:clamp(10px,5vw,80px);z-index:12;align-items:center;gap:9px;flex-wrap:wrap;padding:12px;background:#fff;border:1px solid #cbdde6;box-shadow:0 9px 27px #122c4229;border-radius:15px}
body.lex-reader-fullscreen #lex-appearance[hidden]{display:none!important}
#lex-appearance .lex-appearance-label{color:#526c7d;font-size:13px;font-weight:650}
@media(max-width:650px){body.lex-reader-fullscreen #lex-appearance:not([hidden]){top:64px;right:8px;left:8px;justify-content:center}}
`;document.head.appendChild(css);
const controls=document.createElement("div");controls.className="lex-narr";controls.innerHTML='<button class="btn" type="button" id="lex-read">Read</button><button class="btn" type="button" id="lex-listen">Read &amp; Listen</button><select class="lex-advanced" id="lex-engine" aria-label="Narration voice"><option value="kokoro">Natural voice · Kokoro</option><option value="system">Device voice</option></select><select class="lex-advanced" id="lex-kokoro-voice" aria-label="Kokoro accent and voice"><option value="af_heart">US · Female · Heart (Recommended)</option><option value="am_michael">US · Male · Michael</option><option value="bf_emma">UK · Female · Emma</option><option value="bm_fable">UK · Male · Fable</option></select><button class="btn primary" id="lex-play">▶ Play</button><button class="btn lex-advanced" id="lex-back">← Sentence</button><button class="btn lex-advanced" id="lex-forward">Sentence →</button><span class="lex-narr-status lex-advanced" id="lex-status">Ready</span><button class="btn lex-advanced" id="lex-enter" type="button">⛶ Full screen</button><button class="btn" id="lex-appearance-button" type="button" aria-label="Reader appearance" hidden>Aa</button><button class="btn" id="lex-options" type="button" aria-label="More reading controls">⋯</button><button class="btn lex-reader-exit" id="lex-exit" type="button">✕ Exit</button>';
document.querySelector(".reader-toolbar").insertAdjacentElement("afterend",controls);
const appearance=document.createElement("div");
appearance.id="lex-appearance";appearance.hidden=true;
appearance.innerHTML='<span class="lex-appearance-label">Appearance</span><button class="btn" type="button" id="lex-font-down" aria-label="Smaller text">A−</button><button class="btn" type="button" id="lex-font-up" aria-label="Larger text">A＋</button><button class="btn" type="button" id="lex-theme-sepia">Sèpia</button><button class="btn" type="button" id="lex-theme-white">Blanc</button><button class="btn" type="button" id="lex-theme-black">Negre</button><button class="btn" type="button" id="lex-appearance-close" aria-label="Close appearance settings">✕</button>';
document.querySelector("#read .grid>.panel:first-child").appendChild(appearance);
$("lex-font-down").onclick=()=>{$("smaller").click()};
$("lex-font-up").onclick=()=>{$("bigger").click()};
["sepia","white","black"].forEach(t=>{$("lex-theme-"+t).onclick=()=>{window.lexoraSetReadingTheme?.(t);updateAppearance()}});
$("lex-appearance-close").onclick=()=>{appearance.hidden=true;controls.classList.remove("lex-show-advanced")};
function updateAppearance(){const active=$("reader").classList.contains("black")?"black":$("reader").classList.contains("white")?"white":"sepia";["sepia","white","black"].forEach(t=>{$("lex-theme-"+t).classList.toggle("primary",t===active);$("lex-theme-"+t).setAttribute("aria-pressed",String(t===active))})}

async function enterReader(){document.body.classList.add("lex-reader-fullscreen");document.body.classList.remove("lex-controls-hidden");$("lex-enter").hidden=true;const panel=document.querySelector("#read .grid>.panel:first-child");if(panel.requestFullscreen&&!document.fullscreenElement){try{await panel.requestFullscreen({navigationUI:"hide"})}catch(e){console.info("Using screen-filling reader layout",e)}}requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
function exitReader(){appearance.hidden=true;closeResults();clearTimeout(fadeTimer);document.body.classList.remove("lex-reader-fullscreen","lex-controls-hidden");$("lex-enter").hidden=false;stop();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
$("lex-enter").onclick=enterReader;$("lex-exit").onclick=exitReader;
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
$("lex-engine").value=engine;$("lex-kokoro-voice").value=kokoroVoice;$("lex-kokoro-voice").hidden=engine!=="kokoro";const reveal=document.createElement("button");reveal.className="btn lex-reader-reveal";reveal.type="button";reveal.textContent="☰";reveal.setAttribute("aria-label","Show reader controls");document.querySelector("#read .grid>.panel:first-child").appendChild(reveal);reveal.onclick=()=>showControls();
let fadeTimer=null;function showControls(){document.body.classList.remove("lex-controls-hidden");clearTimeout(fadeTimer);if(playing)fadeTimer=setTimeout(()=>{if(playing&&inspect.hidden&&appearance.hidden&&!controls.classList.contains("lex-show-advanced"))document.body.classList.add("lex-controls-hidden")},4500)}
$("lex-appearance-button").onclick=()=>{appearance.hidden=!appearance.hidden;updateAppearance();showControls()};
$("lex-options").onclick=()=>{const opening=appearance.hidden;appearance.hidden=!opening;controls.classList.toggle("lex-show-advanced",opening&&mode==="both");updateAppearance();showControls()};
const inspect=document.createElement("div");inspect.className="lex-inspect";inspect.hidden=true;controls.insertAdjacentElement("afterend",inspect);
// Show the existing dictionary results INSIDE the full-screen reader.
const discovery=$("discovery"),home=discovery.parentNode,placeholder=document.createComment("Lexora dictionary home");
home.insertBefore(placeholder,discovery);
const results=document.createElement("section");
results.id="lex-reader-results";results.hidden=true;
results.innerHTML='<div class="lex-results-top"><strong>Explore English</strong><button class="btn" type="button" id="lex-results-close" aria-label="Return to book">✕</button></div><div id="lex-results-content"></div>';
document.querySelector("#read .grid>.panel:first-child").appendChild(results);
function closeResults(){if(discovery.parentNode!==home)placeholder.after(discovery);results.hidden=true}
function openResults(term,source){inspect.hidden=true;results.hidden=false;results.querySelector("#lex-results-content").appendChild(discovery);results.scrollTop=0;$("lookup").value=term;
 if(typeof window.lexoraAnalyze==="function")window.lexoraAnalyze(term,source);
 else discovery.textContent="Dictionary is unavailable. Try reopening Lexora.";
}
$("lex-results-close").onclick=closeResults;
// Both guide and EPUB selections call choose(). Route them to the visible reader sheet.
const originalChoose=window.choose;
if(typeof originalChoose==="function"){
 window.choose=function(term,source=""){
  if(document.body.classList.contains("lex-reader-fullscreen")){
   stop();openResults(term,source);
  }else originalChoose(term,source);
 };
}

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
 if(el.dataset.lexReplay==="1")return;el.dataset.lexReplay="1";el.classList.add("lex-tappable");el.tabIndex=0;el.title="Double-click to replay sentence; click a word for its meaning";
 function replay(){if(mode!=="both")return;const selection=el.ownerDocument.getSelection?.();if(selection&&!selection.isCollapsed)return;stop();index=number;play()}
 el.addEventListener("dblclick",replay);
 el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();replay()}});
}
function highlight(){clear();const item=items[index];if(!item)return;if(mode!=="listen"){marker=item.el;marker.classList.add("lex-active");marker.scrollIntoView?.({block:"nearest",behavior:"smooth"})}$("lex-status").textContent="Sentence "+(index+1)+" / "+items.length}
function play(){if(engine==="kokoro")window.lexoraKokoro?.unlock?.();showControls();if(!items.length&&!prepare(true))return;if(engine==="system"&&!window.speechSynthesis){$("lex-status").textContent="Voice unavailable";return}const session=++run;playing=true;inspect.hidden=true;$("lex-play").textContent="Ⅱ Pause";window.speechSynthesis?.cancel();
 async function next(){if(session!==run||!playing)return;if(index>=items.length){stop();return}highlight();if(engine==="kokoro"&&window.lexoraKokoro){try{await window.lexoraKokoro.speak(items[index].text,{nextText:items[index+1]?.text||"",voice:kokoroVoice,speed:Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9")),status:message=>{if(session===run)$("lex-status").textContent=message},cancelled:()=>session!==run||!playing});if(session===run&&playing){index++;next()}return}catch(error){if(session!==run)return;$("lex-status").textContent="Kokoro unavailable; using device voice";console.warn("Kokoro unavailable",error);engine="system";$("lex-engine").value=engine;localStorage.setItem("lexora-narration-engine",engine)}}const utterance=new SpeechSynthesisUtterance(items[index].text);utterance.lang="en-US";utterance.rate=Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9"));const wanted=JSON.parse(localStorage.getItem("lexora-voice-choice")||'""');const vs=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("en-us"));utterance.voice=vs.find(v=>v.voiceURI===wanted)||vs[0]||null;let started=false;utterance.onstart=()=>{started=true;if(session===run)$("lex-status").textContent="Speaking…"};utterance.onend=()=>{if(session===run&&playing){index++;next()}};utterance.onerror=()=>{if(session===run){stop();$("lex-status").textContent="Audio blocked. Tap Play again or try Safari."}};speechSynthesis.speak(utterance);setTimeout(()=>{if(session===run&&playing&&!started&&engine==="system"){$("lex-status").textContent="No sound yet? Tap Pause then Play, or open Lexora in Safari."}},3500)}
 next()
}
inspect.addEventListener("click",e=>{if(e.target.closest(".lex-sheet-close"))inspect.hidden=true});
function examine(i){const item=items[i];if(!item)return;inspect.hidden=false;showControls();inspect.innerHTML='<button type="button" class="btn lex-sheet-close" aria-label="Close">✕</button><p><b>Selected sentence</b></p><p id="lex-sentence"></p><button class="btn primary" id="lex-analyze">Find expressions</button><p class="small muted">You can also select a shorter phrase above.</p>';$("lex-sentence").textContent=item.text;
 function send(){const chosen=window.getSelection()?.toString().trim()||item.text;openResults(chosen,item.text)}
 $("lex-analyze").onclick=()=>{window.getSelection()?.removeAllRanges();send()};$("lex-sentence").addEventListener("mouseup",()=>{if(window.getSelection()?.toString().trim())send()})
}
function pause(){showControls();stop();clear();inspect.hidden=false;inspect.innerHTML='<button type="button" class="btn lex-sheet-close" aria-label="Close">✕</button><b>Explore a sentence</b><div class="buttonrow" style="margin-top:10px"><button class="btn" id="lex-current">Current sentence</button><button class="btn" id="lex-previous">Previous sentence</button></div>';$("lex-current").onclick=()=>examine(Math.min(index,items.length-1));$("lex-previous").onclick=()=>examine(Math.max(0,index-1))}
function chooseMode(next){appearance.hidden=true;closeResults();showControls();controls.classList.remove("lex-show-advanced");mode=next;stop();inspect.hidden=true;clear();$("lex-read").classList.toggle("primary",mode==="read");$("lex-listen").classList.toggle("primary",mode==="both");$("lex-play").hidden=mode==="read";$("lex-back").hidden=mode==="read";$("lex-forward").hidden=mode==="read";$("lex-engine").hidden=mode==="read";$("lex-kokoro-voice").hidden=mode==="read"||engine!=="kokoro";$("lex-status").hidden=mode==="read";if(mode==="both")play();enterReader()}
$("lex-read").onclick=()=>chooseMode("read");$("lex-listen").onclick=()=>chooseMode("both");
$("lex-play").onclick=()=>{if(playing)pause();else{if(mode==="read")chooseMode("both");else{play();enterReader()}}};
$("lex-engine").onchange=e=>{stop();engine=e.target.value;localStorage.setItem("lexora-narration-engine",engine);$("lex-kokoro-voice").hidden=engine!=="kokoro";$("lex-status").textContent=engine==="kokoro"?"Kokoro can be slow or unavailable on iPhone; press Play to test":"Device voice selected — press Play"};
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