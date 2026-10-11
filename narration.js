(()=>{"use strict";
const $=id=>document.getElementById(id);
let engine=localStorage.getItem("lexora-narration-engine")||"kokoro";let mode="read",playing=false,items=[],index=0,run=0,marker=null;
const css=document.createElement("style");css.textContent=".lex-narr{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#eaf4f7;padding:10px;border-radius:12px;margin-bottom:12px}.lex-narr select{padding:9px;border:1px solid #cbd8df;border-radius:8px}.lex-narr-status{font-size:12px;color:#617589}.lex-active{background:#b8e6f1!important;color:#153b49!important}.reader.lex-audio-only .prose,.reader.lex-audio-only #epub-view{visibility:hidden}.lex-inspect{background:#edf6f9;padding:15px;border-radius:12px;margin:0 0 12px;border:1px solid #cbdfe6}.lex-inspect p{line-height:1.6}";
document.head.appendChild(css);
const controls=document.createElement("div");controls.className="lex-narr";controls.innerHTML='<select id="lex-mode"><option value="read">Read only</option><option value="both">Read &amp; Listen</option></select><select id="lex-engine" aria-label="Narration voice"><option value="kokoro">Natural voice · Kokoro</option><option value="system">Device voice</option></select><button class="btn primary" id="lex-play">▶ Play</button><button class="btn" id="lex-back">← Sentence</button><button class="btn" id="lex-forward">Sentence →</button><span class="lex-narr-status" id="lex-status">Ready</span>';
document.querySelector(".reader-toolbar").insertAdjacentElement("afterend",controls);
$("lex-engine").value=engine;const inspect=document.createElement("div");inspect.className="lex-inspect";inspect.hidden=true;controls.insertAdjacentElement("afterend",inspect);
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
   sentences(txt).forEach(t=>items.push({text:t,el:p}))
  }
 });
 index=Math.min(index,Math.max(0,items.length-1));$("lex-status").textContent=items.length?"Sentence "+(index+1)+" / "+items.length:"No text on this page";
 return items.length>0
}
function highlight(){clear();const item=items[index];if(!item)return;if(mode!=="listen"){marker=item.el;marker.classList.add("lex-active");marker.scrollIntoView?.({block:"nearest",behavior:"smooth"})}$("lex-status").textContent="Sentence "+(index+1)+" / "+items.length}
function play(){if(!items.length&&!prepare(true))return;if(engine==="system"&&!window.speechSynthesis){$("lex-status").textContent="Voice unavailable";return}const session=++run;playing=true;inspect.hidden=true;$("lex-play").textContent="Ⅱ Pause";speechSynthesis.cancel();
 async function next(){if(session!==run||!playing)return;if(index>=items.length){stop();return}highlight();if(engine==="kokoro"&&window.lexoraKokoro){try{await window.lexoraKokoro.speak(items[index].text,{speed:Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9")),status:message=>{if(session===run)$("lex-status").textContent=message},cancelled:()=>session!==run||!playing});if(session===run&&playing){index++;next()}return}catch(error){if(session!==run)return;$("lex-status").textContent="Kokoro unavailable; using device voice";console.warn("Kokoro unavailable",error);engine="system";$("lex-engine").value=engine;localStorage.setItem("lexora-narration-engine",engine)}}const utterance=new SpeechSynthesisUtterance(items[index].text);utterance.lang="en-US";utterance.rate=Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9"));const wanted=JSON.parse(localStorage.getItem("lexora-voice-choice")||'""');const vs=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("en-us"));utterance.voice=vs.find(v=>v.voiceURI===wanted)||vs[0]||null;utterance.onend=()=>{if(session===run&&playing){index++;next()}};utterance.onerror=()=>{if(session===run){stop();$("lex-status").textContent="Speech stopped"}};speechSynthesis.speak(utterance)}
 next()
}
function examine(i){const item=items[i];if(!item)return;inspect.hidden=false;inspect.innerHTML='<p><b>Selected sentence</b></p><p id="lex-sentence"></p><button class="btn primary" id="lex-analyze">Find expressions</button><p class="small muted">You can also select a shorter phrase above.</p>';$("lex-sentence").textContent=item.text;
 function send(){const chosen=window.getSelection()?.toString().trim()||item.text;$("lookup").value=chosen;if(typeof window.lexoraAnalyze==="function")window.lexoraAnalyze(chosen,item.text)}
 $("lex-analyze").onclick=()=>{window.getSelection()?.removeAllRanges();send()};$("lex-sentence").addEventListener("mouseup",()=>{if(window.getSelection()?.toString().trim())send()})
}
function pause(){stop();clear();inspect.hidden=false;inspect.innerHTML='<b>Paused — explore a sentence</b><div class="buttonrow" style="margin-top:10px"><button class="btn" id="lex-current">Current sentence</button><button class="btn" id="lex-previous">Previous sentence</button></div>';$("lex-current").onclick=()=>examine(Math.min(index,items.length-1));$("lex-previous").onclick=()=>examine(Math.max(0,index-1))}
$("lex-play").onclick=()=>{if(playing)pause();else{if(mode==="read"){mode="both";$("lex-mode").value="both"}play()}};
$("lex-mode").onchange=e=>{stop();mode=e.target.value;inspect.hidden=true;if(mode==="read")clear()};
$("lex-engine").onchange=e=>{stop();engine=e.target.value;localStorage.setItem("lexora-narration-engine",engine);$("lex-status").textContent=engine==="kokoro"?"Kokoro ready to load on Play":"Device voice selected"};
$("lex-back").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.max(0,index-1);highlight()};
$("lex-forward").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.min(items.length-1,index+1);highlight()};
["chapter","booklist","prev","next","load-guide","upload-book"].forEach(id=>$(id)?.addEventListener("click",()=>{stop();setTimeout(()=>prepare(true),350)}));
$("chapter").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),100)});
$("booklist").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),900)});
const observer=new MutationObserver(()=>{if($("booklist").value!=="guide"&&!playing){setTimeout(()=>prepare(true),250)}});observer.observe($("epub-view"),{childList:true});
prepare(true);
})();