/* iPhone-friendly native text selection and explicit phrase lookup in guide and EPUB frames. */
(()=>{"use strict";
const bound=new WeakSet();
const panel=document.querySelector("#read .grid>.panel:first-child");
if(!panel)return;
const style=document.createElement("style");
style.textContent=`
#guide,#guide p,#guide p *,#epub-view{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default}
.lex-selection-lookup{position:fixed;bottom:calc(22px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);z-index:1200;max-width:calc(100vw - 28px);min-height:48px;padding:11px 20px!important;border-radius:24px!important;box-shadow:0 5px 24px #0005;white-space:nowrap}
body.lex-reader-fullscreen.lex-audio-mode .lex-selection-lookup{bottom:calc(102px + env(safe-area-inset-bottom,0px))}
.lex-selection-lookup[hidden]{display:none!important}
.lex-word-actions[hidden]{display:none!important}
.lex-word-actions{position:fixed;left:50%;bottom:calc(102px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100vw - 24px);z-index:1210;display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #667b895a;border-radius:18px;background:#f3f5f7f5;box-shadow:0 12px 30px #0004}
.lex-word-actions .btn{font-size:14px;white-space:nowrap;min-height:44px}
html[data-lexora-theme="dark"] .lex-word-actions{background:#1b2935f5;color:#edf3f6;border-color:#4f6674}
`;
document.head.appendChild(style);
const action=document.createElement("button");
action.id="lex-explore-selection";action.type="button";action.className="btn primary lex-selection-lookup";
action.textContent="Explore selection";action.hidden=true;
action.setAttribute("aria-label","Look up the selected phrase in Lexora");
panel.appendChild(action);
const wordActions=document.createElement("div");wordActions.className="lex-word-actions";wordActions.hidden=true;wordActions.setAttribute("role","group");wordActions.setAttribute("aria-label","Word actions");
wordActions.innerHTML='<button class="btn primary" type="button" data-action="read">▶ Read from here</button><button class="btn" type="button" data-action="lookup">Look up</button>';
panel.appendChild(wordActions);
let tappedWord=null;
wordActions.addEventListener("click",e=>{
 const mode=e.target.closest("button")?.dataset.action,entry=tappedWord;
 if(!mode||!entry)return;
 wordActions.hidden=true;tappedWord=null;
 if(mode==="read"){
  if(!window.lexoraStartReadingAt?.(entry.doc,entry.node,entry.offset))entry.lookup(entry.term,entry.context);
 }else entry.lookup(entry.term,entry.context);
});
let current=null,buttonHeld=false,hideTimer=null;
function hide(){clearTimeout(hideTimer);current=null;action.hidden=true;wordActions.hidden=true;tappedWord=null}
function selectionOf(doc,root,lookup){
 const sel=doc.getSelection?.();
 if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
 const range=sel.getRangeAt(0);
 if(!root.contains(range.startContainer)||!root.contains(range.endContainer))return null;
 const term=sel.toString().trim();
 if(!term)return null;
 const parent=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
 const paragraph=parent?.closest?.("p,li,blockquote");
 const context=(paragraph?.textContent||term).trim();
 return {doc,term:term.slice(0,800),context:context.slice(0,1200),lookup};
}
function update(doc,root,lookup){
 if(buttonHeld)return;
 const selected=selectionOf(doc,root,lookup);
 clearTimeout(hideTimer);
 if(selected){current=selected;action.hidden=false;wordActions.hidden=true;tappedWord=null}
 else if(current?.doc===doc)hideTimer=setTimeout(()=>{if(!buttonHeld)hide()},900);
}
for(const event of ["pointerdown","touchstart"])action.addEventListener(event,()=>{buttonHeld=true},{passive:true});
action.addEventListener("click",e=>{
 e.preventDefault();e.stopPropagation();
 const entry=current;buttonHeld=false;hide();
 if(!entry)return;
 entry.lookup(entry.term,entry.context);
 try{entry.doc.getSelection()?.removeAllRanges()}catch{}
});
action.addEventListener("pointercancel",()=>{buttonHeld=false});
function caretAt(doc,x,y){
 if(doc.caretPositionFromPoint){const p=doc.caretPositionFromPoint(x,y);if(p)return {node:p.offsetNode,offset:p.offset}}
 if(doc.caretRangeFromPoint){const r=doc.caretRangeFromPoint(x,y);if(r)return {node:r.startContainer,offset:r.startOffset}}
 return null;
}
function selectFromDrag(doc,root,from,to){
 if(!from||!to||!root.contains(from.node)||!root.contains(to.node))return false;
 try{
  const range=doc.createRange();
  range.setStart(from.node,from.offset);range.setEnd(to.node,to.offset);
  // If the drag went backwards, use the other direction.
  if(range.collapsed){range.setStart(to.node,to.offset);range.setEnd(from.node,from.offset)}
  if(range.collapsed)return false;
  const sel=doc.getSelection();sel.removeAllRanges();sel.addRange(range);
  return true;
 }catch{return false}
}
function bind(doc,root,lookup){
 if(!root||bound.has(root))return;
 bound.add(root);
 // Some EPUB styles explicitly disable selection on spans or links. Do not modify
 // EPUB markup/CFIs; enforce native selection through a stylesheet in its own frame.
 if(doc!==document&&doc.head&&!doc.getElementById("lexora-allow-selection")){
  const css=doc.createElement("style");css.id="lexora-allow-selection";
  css.textContent="html body,html body :is(p,li,blockquote,span,em,i,b,strong,a){-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}";
  doc.head.appendChild(css);
 }
 let start=null,dragged=false,lastTouch=0,suppressTapUntil=0;
 const check=(delay=0)=>setTimeout(()=>update(doc,root,lookup),delay);
 // iOS WebKit does not consistently send selectionchange for selection-handle drags.
 // Also recheck after native context menus close and after the selection settles.
 const refresh=()=>{check(0);check(100);check(300);check(650)};
 doc.addEventListener("selectionchange",()=>check(30));
 root.addEventListener("selectstart",refresh,true);
 root.addEventListener("contextmenu",refresh,true);
 root.addEventListener("mouseup",refresh,true);
 root.addEventListener("keyup",refresh,true);
 root.addEventListener("pointerup",refresh,true);
 root.addEventListener("touchstart",e=>{
  if(e.touches.length!==1)return;
  const t=e.touches[0];
  start={x:t.clientX,y:t.clientY,at:Date.now(),caret:caretAt(doc,t.clientX,t.clientY)};
  dragged=false;lastTouch=Date.now();
 },{passive:true,capture:true});
 root.addEventListener("touchmove",e=>{
  if(!start||e.touches.length!==1)return;
  const t=e.touches[0],distance=Math.hypot(t.clientX-start.x,t.clientY-start.y);
  if(distance>10)dragged=true;
  // Preserve Safari's native handles when it has a selection. Only help when
  // dragging after holding text and WebKit has not selected anything itself.
  if(distance>16&&Date.now()-start.at>440&&!selectionOf(doc,root,lookup)){
   const end=caretAt(doc,t.clientX,t.clientY);
   if(selectFromDrag(doc,root,start.caret,end))check(30);
  }
 },{passive:true,capture:true});
 root.addEventListener("touchend",()=>{lastTouch=Date.now();if(start&&(dragged||lastTouch-start.at>350))suppressTapUntil=lastTouch+750;start=null;refresh()},{passive:true,capture:true});
 root.addEventListener("touchcancel",()=>{start=null;refresh()},{passive:true,capture:true});
 root.addEventListener("pointerdown",e=>{
  if(e.pointerType!=="mouse"||e.button!==0)return;
  start={x:e.clientX,y:e.clientY,at:Date.now()};dragged=false;
 },true);
 root.addEventListener("pointermove",e=>{
  if(e.pointerType==="mouse"&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)dragged=true
 },true);
 root.addEventListener("click",e=>{
  if(e.detail>1||dragged||Date.now()<suppressTapUntil||e.target.closest?.("a,button,input,select"))return;
  if(Date.now()-lastTouch<700&&(selectionOf(doc,root,lookup)||!doc.getSelection()?.isCollapsed))return;
  if(selectionOf(doc,root,lookup))return; // Never substitute a word tap for a drag selection.
  const pos=caretAt(doc,e.clientX,e.clientY);
  if(!pos||pos.node.nodeType!==3||!root.contains(pos.node))return;
  const text=pos.node.textContent||"";
  let i=Math.min(pos.offset,Math.max(0,text.length-1));
  if(!/[A-Za-z'-]/.test(text[i])&&i>0&&/[A-Za-z'-]/.test(text[i-1]))i--;
  if(!/[A-Za-z]/.test(text[i]))return;
  let a=i,b=i+1;
  while(a>0&&/[A-Za-z'-]/.test(text[a-1]))a--;
  while(b<text.length&&/[A-Za-z'-]/.test(text[b]))b++;
  const word=text.slice(a,b).replace(/^['-]+|['-]+$/g,"");
  if(!word)return;
  const context=pos.node.parentElement?.closest?.("p,li,blockquote")?.textContent||word;
  hide();
  if(window.lexoraNarrationIsActive?.()){
   tappedWord={doc,node:pos.node,offset:a,term:word,context,lookup};
   wordActions.hidden=false;
  }else lookup(word,context);
 },true);
}
const guide=document.getElementById("guide");
if(guide)bind(document,guide,(term,context)=>window.choose?.(term,context));
function bindEpub(){
 const frame=document.querySelector("#epub-view iframe");
 if(!frame)return;
 try{const doc=frame.contentDocument;if(doc?.body)bind(doc,doc.body,(term,context)=>window.choose?.(term,context))}catch{}
}
const host=document.getElementById("epub-view");
if(host){
 new MutationObserver(bindEpub).observe(host,{childList:true,subtree:true});
 host.addEventListener("load",()=>setTimeout(bindEpub,60),true);
}
document.getElementById("booklist")?.addEventListener("change",hide);
document.getElementById("lex-results-close")?.addEventListener("click",hide);
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",hide));
bindEpub();
})();