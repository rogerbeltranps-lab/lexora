/* Native touch text selection + deliberate phrase lookup (guide and EPUB iframe). */
(()=>{"use strict";
const bound=new WeakSet();
const panel=document.querySelector("#read .grid>.panel:first-child");
if(!panel)return;
const style=document.createElement("style");
style.textContent=`
#guide, #guide p, #guide p *, #epub-view { -webkit-user-select:text; user-select:text }
.lex-selection-lookup{position:fixed;bottom:calc(22px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);z-index:1200;max-width:calc(100vw - 28px);min-height:48px;padding:11px 20px!important;border-radius:24px!important;box-shadow:0 5px 24px #0005;white-space:nowrap}
.lex-selection-lookup[hidden]{display:none!important}
`;
document.head.appendChild(style);
const action=document.createElement("button");
action.id="lex-explore-selection";action.type="button";action.className="btn primary lex-selection-lookup";
action.textContent="Explore selection";action.hidden=true;
action.setAttribute("aria-label","Look up selected words in Lexora");
panel.appendChild(action);
let current=null,lock=false,hideTimer=null;
function hide(){clearTimeout(hideTimer);current=null;action.hidden=true}
function selectionOf(doc,root,lookup){
 const sel=doc.getSelection?.();
 if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
 const anchor=sel.anchorNode,focus=sel.focusNode;
 if(!anchor||!focus||!root.contains(anchor)||!root.contains(focus))return null;
 const term=sel.toString().trim();
 if(!term)return null;
 const parent=anchor.nodeType===1?anchor:anchor.parentElement;
 const paragraph=parent?.closest?.("p,li,blockquote");
 const context=(paragraph?.textContent||term).trim();
 return {doc,term:term.slice(0,800),context:context.slice(0,1200),lookup};
}
function update(doc,root,lookup){
 if(lock)return;
 const match=selectionOf(doc,root,lookup);
 clearTimeout(hideTimer);
 if(match){current=match;action.hidden=false}
 else if(current?.doc===doc)hideTimer=setTimeout(()=>{if(!lock)hide()},420);
}
action.addEventListener("pointerdown",()=>{lock=true},true);
action.addEventListener("click",()=>{
 const entry=current;lock=false;hide();
 if(!entry)return;
 entry.lookup(entry.term,entry.context);
 // The selection has been accepted. Do not clear it while the user is adjusting the handles.
 try{entry.doc.getSelection()?.removeAllRanges()}catch{}
});
function getCaret(doc,x,y){
 if(doc.caretPositionFromPoint){const p=doc.caretPositionFromPoint(x,y);if(p)return {node:p.offsetNode,offset:p.offset}}
 if(doc.caretRangeFromPoint){const r=doc.caretRangeFromPoint(x,y);if(r)return {node:r.startContainer,offset:r.startOffset}}
 return null;
}
function bind(doc,root,lookup){
 if(!root||bound.has(root))return;
 bound.add(root);
 let began=0,start=null,moved=false;
 doc.addEventListener("selectionchange",()=>update(doc,root,lookup));
 root.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  began=Date.now();start={x:e.clientX,y:e.clientY};moved=false;
 },true);
 root.addEventListener("pointermove",e=>{
  if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)moved=true
 },true);
 root.addEventListener("click",e=>{
  if(e.detail>1||moved||Date.now()-began>380||e.target.closest?.("a,button,input,select"))return;
  if(selectionOf(doc,root,lookup))return; // Never replace an active drag-selection with a single-word lookup.
  const pos=getCaret(doc,e.clientX,e.clientY);
  if(!pos||pos.node.nodeType!==3)return;
  const text=pos.node.textContent||"";
  let i=Math.min(pos.offset,Math.max(0,text.length-1));
  if(!/[A-Za-z'-]/.test(text[i])&&i>0&&/[A-Za-z'-]/.test(text[i-1]))i--;
  if(!/[A-Za-z]/.test(text[i]))return;
  let a=i,b=i+1;
  while(a>0&&/[A-Za-z'-]/.test(text[a-1]))a--;
  while(b<text.length&&/[A-Za-z'-]/.test(text[b]))b++;
  const word=text.slice(a,b).replace(/^['-]+|['-]+$/g,"");
  if(!word)return;
  const source=pos.node.parentElement?.closest?.("p,li")?.textContent||word;
  hide();lookup(word,source);
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
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",hide));
bindEpub();
})();