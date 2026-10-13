/* Computer browsers: Previous / Next buttons at the edges of the full-screen reader, and the left and right arrow keys. */
(()=>{"use strict";
const $=id=>document.getElementById(id),panel=document.querySelector("#read .grid>.panel:first-child");
if(!panel)return;
const css=document.createElement("style");
css.textContent=`.lex-page-turn{display:none}
@media (hover:hover) and (pointer:fine){
body.lex-reader-fullscreen .lex-page-turn{display:flex;align-items:center;justify-content:center;position:absolute;top:50%;transform:translateY(-50%);z-index:7;width:44px;height:88px;border:0;border-radius:14px;background:transparent;color:#92929a;font-size:30px;line-height:1;opacity:.45;transition:opacity .15s,background .15s}
body.lex-reader-fullscreen .lex-page-turn:hover,body.lex-reader-fullscreen .lex-page-turn:focus-visible{opacity:1;background:#8a8a9426}
body.lex-reader-fullscreen .lex-page-prev{left:6px}
body.lex-reader-fullscreen .lex-page-next{right:6px}
}`;
document.head.appendChild(css);
function button(cls,label,text,direction){const b=document.createElement("button");b.type="button";b.className="lex-page-turn "+cls;b.setAttribute("aria-label",label);b.title=label;b.textContent=text;b.onclick=()=>turn(direction);panel.appendChild(b)}
button("lex-page-prev","Previous page","‹",-1);button("lex-page-next","Next page","›",1);
function turn(direction){
 if(document.body.classList.contains("lex-reader-fullscreen"))window.lexoraTurnPage?.(direction);
 else{const b=$(direction>0?"next":"prev");if(b&&!b.disabled)b.click()}
}
function onKey(e){
 if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
 if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented)return;
 if(!$("read")?.classList.contains("active")||$("edit-dialog")?.open)return;
 const t=e.target;if(t?.closest?.("input,textarea,select,[contenteditable]")||t?.isContentEditable)return;
 e.preventDefault();turn(e.key==="ArrowRight"?1:-1);
}
document.addEventListener("keydown",onKey);
// Once the book has been clicked, the key presses go to the book's own page frame.
const bound=new WeakSet();
function bindFrame(){const d=document.querySelector("#epub-view iframe")?.contentDocument;if(d&&!bound.has(d)){bound.add(d);d.addEventListener("keydown",onKey)}}
const view=$("epub-view");
if(view){new MutationObserver(bindFrame).observe(view,{childList:true,subtree:true});view.addEventListener("load",()=>setTimeout(bindFrame,50),true)}
})();
