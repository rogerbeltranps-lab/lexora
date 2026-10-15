(()=>{"use strict";
const $=id=>document.getElementById(id);
let mode="read",playing=false,items=[],index=0,run=0,marker=null,followingAudio=true,activeHighlightDoc=null,lastAutoTurn=0;
const css=document.createElement("style");css.textContent=".lex-narr{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#eaf4f7;padding:10px;border-radius:12px;margin-bottom:12px}.lex-narr select{padding:9px;border:1px solid #cbd8df;border-radius:8px}.lex-narr-status{font-size:12px;color:#617589}.lex-tappable{cursor:pointer;border-radius:3px;-webkit-user-select:text;user-select:text}.lex-tappable:focus-visible{outline:2px solid #297eaa}.lex-active{background:rgba(229,195,123,.28)!important;color:inherit!important;border-radius:3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}.reader.lex-audio-only .prose,.reader.lex-audio-only #epub-view{visibility:hidden}.lex-inspect{background:#edf6f9;padding:15px;border-radius:12px;margin:0 0 12px;border:1px solid #cbdfe6}.lex-inspect p{line-height:1.6}";
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

/* Reader follows the device theme; Appearance controls are for typography only. */
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

/* Book-like immersive reading: page gestures, running title, and readable fonts. */
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader-foot{display:none!important}
.lex-running-title{display:none}
body.lex-reader-fullscreen .lex-running-title{display:block;position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:72px;right:72px;z-index:4;text-align:center;color:#92929a;font:500 13px/1.3 system-ui,-apple-system,sans-serif;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader .prose{padding-top:clamp(110px,16vh,155px)}
body.lex-reader-fullscreen.lex-controls-hidden #read .grid>.panel:first-child>.lex-narr{opacity:0;pointer-events:none}
body.lex-reader-fullscreen .lex-reader-reveal{top:calc(14px + env(safe-area-inset-top,0px));right:13px;background:transparent;box-shadow:none;color:#92929a;font-size:18px}
body.lex-reader-fullscreen .lex-reader-reveal:not(:focus-visible){opacity:.45}
body.lex-reader-fullscreen #read .reader.lex-font-classic .prose{font-family:Georgia,"Times New Roman",serif}
body.lex-reader-fullscreen #read .reader.lex-font-newyork .prose{font-family:ui-serif,"New York",Iowan Old Style,Palatino,serif}
body.lex-reader-fullscreen #read .reader.lex-font-modern .prose{font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}
#lex-appearance .lex-font-choices{display:flex;gap:5px;flex-wrap:wrap;width:100%}
#lex-appearance .lex-font-choices button{flex:1;min-width:80px}
body.lex-reader-fullscreen #lex-appearance:not([hidden]){max-width:min(380px,calc(100vw - 20px))}
@media(max-width:650px){body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader .prose{padding:clamp(108px,16vh,145px) 20px 65px}body.lex-reader-fullscreen .lex-running-title{font-size:12px}}

/* An actual paged viewport: no vertical scrolling in immersive reading. */
body.lex-reader-fullscreen{background:#fffaf1}
html:has(body.lex-reader-fullscreen){background:#fffaf1}
html:has(body.lex-reader-fullscreen #reader.white),body.lex-reader-fullscreen:has(#reader.white){background:#fff}
html:has(body.lex-reader-fullscreen #reader.black),body.lex-reader-fullscreen:has(#reader.black){background:#000}
/* Cover the iOS status-bar area with the reader colour (no navy strip from the app chrome underneath). */
body.lex-reader-fullscreen #read .grid>.panel:first-child{inset:0!important;padding-top:calc(12px + env(safe-area-inset-top,0px))!important}
body.lex-reader-fullscreen .app>aside,body.lex-reader-fullscreen .main>.top{visibility:hidden}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(#reader.black){background:#000}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(#reader.white){background:#fff}
body.lex-reader-fullscreen #read .grid>.panel:first-child:has(#reader.sepia){background:#fffaf1}
body.lex-reader-fullscreen #read .grid>.panel:first-child>.reader{overflow:hidden!important;overscroll-behavior:contain}
body.lex-reader-fullscreen #guide.lex-paginated{display:flex!important;gap:0!important;overflow:hidden!important;height:100%!important;max-width:none!important;width:100%!important;padding:0!important;scroll-behavior:smooth}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page{flex:0 0 100%;height:100%;min-height:0;overflow:hidden;box-sizing:border-box;padding:clamp(100px,15vh,145px) clamp(20px,5vw,65px) 50px;margin:0;min-width:0}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page>*{max-width:740px;margin-left:auto;margin-right:auto}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page h2{margin-top:0}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page p{overflow-wrap:break-word;orphans:3;widows:3}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page{padding-top:clamp(94px,12vh,120px)!important;padding-bottom:calc(35px + env(safe-area-inset-bottom,0px))!important}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page h2{font-size:1.4em;line-height:1.3;margin-bottom:1.4em}
body.lex-reader-fullscreen #guide.lex-paginated .lex-book-page p{line-height:1.6;margin-bottom:1em}
body.lex-reader-fullscreen #reader{touch-action:auto}

body.lex-reader-fullscreen #epub-view{height:100%!important}

/* iPhone dictionary: force radio and full definition into one row. */
#lex-reader-results #discovery label.lex-sense-option,
#discovery label.lex-sense-option{
 display:flex!important;flex-direction:row!important;align-items:flex-start!important;
 justify-content:flex-start!important;gap:12px!important;
 padding:12px 4px!important;margin:0!important;min-height:0!important;
 width:100%!important;height:auto!important;position:static!important;
 text-align:left!important;line-height:1.5!important;
}
#lex-reader-results #discovery label.lex-sense-option input.lex-sense-radio,
#discovery label.lex-sense-option input.lex-sense-radio{
 appearance:radio!important;-webkit-appearance:radio!important;
 flex:0 0 21px!important;width:21px!important;height:21px!important;
 position:static!important;float:none!important;margin:3px 0 0!important;
 padding:0!important;align-self:flex-start!important;
}
#lex-reader-results #discovery label.lex-sense-option .lex-sense-copy,
#discovery label.lex-sense-option .lex-sense-copy{
 flex:1 1 0!important;display:block!important;min-width:0!important;
 width:auto!important;margin:0!important;padding:0!important;
 text-align:left!important;line-height:1.55!important;overflow-wrap:break-word!important;
}
#lex-reader-results #discovery .sense-entry fieldset{display:block!important}
#lex-reader-results #discovery .sense-entry legend{margin-bottom:8px}
body.lex-reader-fullscreen .lex-narr{top:calc(12px + env(safe-area-inset-top,0px))!important}
/* Always-available playback controls stay visible when the top reader toolbar fades. */
.lex-audio-player{display:none}
body.lex-reader-fullscreen.lex-audio-mode #read .grid>.panel:first-child>.reader{margin-bottom:calc(86px + env(safe-area-inset-bottom,0px))!important}
body.lex-reader-fullscreen.lex-audio-mode .lex-audio-player:not([hidden]){
 position:absolute;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:9px;
 bottom:calc(12px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);
 z-index:7;max-width:calc(100% - 24px);width:max-content;padding:8px 12px;
 border:1px solid #e4ded2;border-radius:22px;background:#f8f4eced;box-shadow:0 5px 23px #10202d20;
}
.lex-player-btn{font:650 14px/1 system-ui,-apple-system,sans-serif;border:0;border-radius:13px;min-width:58px;min-height:46px;padding:8px;color:#344955;background:transparent;cursor:pointer}
.lex-player-btn:focus-visible,.lex-player-return:focus-visible{outline:3px solid #b58947;outline-offset:2px}
.lex-player-btn small{display:block;font-size:11px;font-weight:500;margin-top:4px}
.lex-player-play{background:#263d4c;color:#fff;font-size:21px;border-radius:50%;min-width:54px;width:54px;height:54px}
.lex-player-return{border:0;background:#e7e7db;color:#354951;padding:9px;border-radius:11px;font-size:12px;font-weight:650}
.reader.white .lex-active{background:#fff0cd!important}
.reader.black .lex-active{background:rgba(138,166,191,.30)!important;color:inherit!important}
body.lex-reader-fullscreen:has(#reader.black) .lex-audio-player{background:#1f252bf5!important;border-color:#3f4951!important}
body.lex-reader-fullscreen:has(#reader.black) .lex-player-btn{color:#d5e0e6}
body.lex-reader-fullscreen:has(#reader.black) .lex-player-play{background:#a1b6c7;color:#17242e}
body.lex-reader-fullscreen:has(#reader.black) .lex-player-return{background:#39454d;color:#e3ecf1}
@media(max-width:400px){.lex-audio-player{gap:4px!important;padding:6px 8px!important}.lex-player-btn{min-width:49px}}
`;document.head.appendChild(css);
const controls=document.createElement("div");controls.className="lex-narr";controls.innerHTML='<button class="btn" type="button" id="lex-read">Read</button><button class="btn" type="button" id="lex-listen">Read &amp; Listen</button><button class="btn primary" id="lex-play">▶ Play</button><button class="btn lex-advanced" id="lex-back">← Sentence</button><button class="btn lex-advanced" id="lex-forward">Sentence →</button><span class="lex-narr-status lex-advanced" id="lex-status">Ready</span><button class="btn lex-advanced" id="lex-enter" type="button">⛶ Full screen</button><button class="btn" id="lex-appearance-button" type="button" aria-label="Reader appearance" hidden>Aa</button><button class="btn" id="lex-options" type="button" aria-label="More reading controls">⋯</button><button class="btn lex-reader-exit" id="lex-exit" type="button">✕ Exit</button>';
document.querySelector(".reader-toolbar").insertAdjacentElement("afterend",controls);
const audioPlayer=document.createElement("div");audioPlayer.id="lex-audio-player";audioPlayer.className="lex-audio-player";audioPlayer.hidden=true;
audioPlayer.setAttribute("role","group");audioPlayer.setAttribute("aria-label","Narration playback");
audioPlayer.innerHTML='<button class="lex-player-btn" id="lex-seek-back" type="button" aria-label="Back approximately 15 seconds">↶<small>15s</small></button><button class="lex-player-btn lex-player-play" id="lex-player-play" type="button" aria-label="Play narration">▶</button><button class="lex-player-btn" id="lex-seek-forward" type="button" aria-label="Forward approximately 15 seconds">↷<small>15s</small></button><button class="lex-player-return" id="lex-return" type="button" hidden>↗ Narration</button>';
document.querySelector("#read .grid>.panel:first-child").appendChild(audioPlayer);
function syncPlaybackButtons(){
 $("lex-play").textContent=playing?"Ⅱ Pause":"▶ Play";
 $("lex-player-play").textContent=playing?"Ⅱ":"▶";
 $("lex-player-play").setAttribute("aria-label",playing?"Pause narration":"Play narration");
 audioPlayer.hidden=mode!=="both";
 $("lex-return").hidden=followingAudio;
}
function detachNarration(){if(playing&&followingAudio){followingAudio=false;syncPlaybackButtons()}}
const runningTitle=document.createElement("div");runningTitle.className="lex-running-title";runningTitle.setAttribute("aria-live","polite");
document.querySelector("#read .grid>.panel:first-child").appendChild(runningTitle);
function refreshRunningTitle(){const sel=$("booklist"),name=sel?.selectedOptions?.[0]?.textContent?.trim()||"Lexora";runningTitle.textContent=name}
$("booklist").addEventListener("change",()=>setTimeout(refreshRunningTitle,0));
refreshRunningTitle();
const fontFamilyChoices={classic:'Georgia,"Times New Roman",serif',newyork:'ui-serif,"New York","Iowan Old Style",Palatino,serif',modern:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif'};
let readerFont=localStorage.getItem("lexora-reader-font-family")||"classic";
function applyReaderFont(){
 const reader=$("reader");reader.classList.remove("lex-font-classic","lex-font-newyork","lex-font-modern");reader.classList.add("lex-font-"+readerFont);
 const doc=document.querySelector("#epub-view iframe")?.contentDocument;
 if(doc?.head){let el=doc.getElementById("lex-reader-font-override");if(!el){el=doc.createElement("style");el.id="lex-reader-font-override";doc.head.appendChild(el)}el.textContent="html body, html body *:not(svg):not(path){font-family:"+fontFamilyChoices[readerFont]+" !important}"}
 document.querySelectorAll("[data-lex-font]").forEach(b=>{b.classList.toggle("primary",b.dataset.lexFont===readerFont);b.setAttribute("aria-pressed",String(b.dataset.lexFont===readerFont))});
}
const epubHost=$("epub-view");new MutationObserver(()=>{applyReaderFont()}).observe(epubHost,{childList:true,subtree:false});
epubHost.addEventListener("load",applyReaderFont,true);
applyReaderFont();

const guideEl=$("guide");
let paginating=false,guideSource="",lastPageMarkup="",guidePageIndex=0,guidePageTotal=1;
const themeMeta=document.querySelector('meta[name="theme-color"]'),originalTheme=themeMeta?.content||"#152d42";
function syncStatusBar(){if(themeMeta)themeMeta.content=document.body.classList.contains("lex-reader-fullscreen")?($("reader").classList.contains("black")?"#000000":$("reader").classList.contains("white")?"#ffffff":"#fffaf1"):originalTheme}
function makeBookPage(){const p=document.createElement("div");p.className="lex-book-page";return p}
function bookPageOverflow(page){return page.scrollHeight>page.clientHeight+2}
function paginateGuide(reset=false){
 if(!document.body.classList.contains("lex-reader-fullscreen")||$("booklist").value!=="guide"||paginating)return;
 paginating=true;
 try{
  // Re-paginating after a resize or font change must start from the original text, not from the pages themselves (that nested pages and broke page turns).
  if(!guideEl.querySelector(":scope>.lex-book-page"))guideSource=guideEl.innerHTML;
  if(reset)guidePageIndex=0;
  const origin=document.createElement("div");origin.innerHTML=guideSource;
  const blocks=Array.from(origin.children);
  guideEl.classList.add("lex-paginated");guideEl.replaceChildren();
  let page=makeBookPage();guideEl.append(page);
  function newPage(){page=makeBookPage();guideEl.append(page)}
  for(const block of blocks){
   let clone=block.cloneNode(true);page.append(clone);
   if(!bookPageOverflow(page))continue;
   clone.remove();
   // Keep whole paragraphs together whenever they fit on an empty page.
   if(page.childElementCount>0){
    newPage();clone=block.cloneNode(true);page.append(clone);
    if(!bookPageOverflow(page))continue;
    clone.remove();
   }
   if(block.tagName!=="P"&&block.tagName!=="H2"){page.append(block.cloneNode(true));newPage();continue}
   // Only split an oversized paragraph, on word boundaries, after filling a page.
   const words=(block.textContent||"").trim().split(/\s+/).filter(Boolean);
   let start=0;
   while(start<words.length){
    const fragment=block.cloneNode(false);
    page.append(fragment);
    let lo=1,hi=words.length-start,fit=0;
    while(lo<=hi){
     const n=(lo+hi)>>1;
     fragment.textContent=words.slice(start,start+n).join(" ");
     if(!bookPageOverflow(page)){fit=n;lo=n+1}else hi=n-1;
    }
    if(!fit&&page.childElementCount>1){fragment.remove();newPage();continue}
    fit=Math.max(1,fit);
    fragment.textContent=words.slice(start,start+fit).join(" ");
    start+=fit;
    if(start<words.length)newPage();
   }
  }
  // Do not show a trailing empty page.
  if(page.childElementCount===0&&guideEl.children.length>1)page.remove();
  guidePageTotal=guideEl.children.length;
  guidePageIndex=Math.max(0,Math.min(guidePageIndex,guidePageTotal-1));
  guideEl.scrollLeft=guidePageIndex*guideEl.clientWidth;
  lastPageMarkup=guideEl.innerHTML;
  // The pages are new nodes: point the narration and its tap-to-replay at them.
  if(items.length&&!guideEl.querySelector("[data-lex-i]"))prepare(false);else items.forEach((_,i)=>liveEl(i));if(playing&&mode!=="listen")highlight();
 }finally{paginating=false}
}
function clearGuidePagination(){
 if(!guideEl.classList.contains("lex-paginated"))return;
 paginating=true;guideEl.classList.remove("lex-paginated");guideEl.innerHTML=guideSource;guideEl.scrollLeft=0;paginating=false;
}
new MutationObserver(()=>{if(paginating)return;if(document.body.classList.contains("lex-reader-fullscreen")&&$("booklist").value==="guide"){
 // Our own page building also lands here (observer callbacks run late); only a freshly rendered chapter has no book pages.
 if(guideEl.classList.contains("lex-paginated")){if(guideEl.innerHTML===lastPageMarkup||guideEl.querySelector(":scope>.lex-book-page"))return;guideSource=guideEl.innerHTML;guideEl.classList.remove("lex-paginated")}
 requestAnimationFrame(()=>paginateGuide(true));
}}).observe(guideEl,{childList:true});
let bookResizeTimer;window.addEventListener("resize",()=>{clearTimeout(bookResizeTimer);bookResizeTimer=setTimeout(()=>{if(guideEl.classList.contains("lex-paginated")){paginating=true;guideEl.classList.remove("lex-paginated");paginating=false;paginateGuide()}},160)});
function moveReadingPage(direction){
 if(!$("lex-reader-results")?.hidden||!document.querySelector(".lex-inspect")?.hidden)return;
 detachNarration();
 if($("booklist").value==="guide"){
 if(!guideEl.classList.contains("lex-paginated"))paginateGuide();
 const next=guidePageIndex+(direction>0?1:-1);
 if(next>=0&&next<guidePageTotal){guidePageIndex=next;guideEl.scrollTo({left:next*guideEl.clientWidth,behavior:"smooth"});
  // Play then starts from the page the reader turned to.
  const first=guideEl.children[next]?.querySelector("[data-lex-i]");if(first&&!playing)index=Number(first.dataset.lexI)}
 else $(""+(direction>0?"next":"prev")).click();
 }
 else if(typeof rendition!=="undefined"&&rendition){
  const movement=direction>0?rendition.next():rendition.prev();
  if(!playing)Promise.resolve(movement).then(()=>setTimeout(()=>{if(!playing)prepare(true)},180)).catch(()=>{});
 }
}
// Page buttons and arrow keys (reader-keys.js) turn pages the same way as a swipe.
window.lexoraTurnPage=moveReadingPage;
function attachSwipe(surface,doc){
 if(!surface||surface.dataset.lexSwipeAttached)return;
 surface.dataset.lexSwipeAttached="1";
 // Keep native iOS selection handles available. Touch listeners are passive and never cancel selection.
 surface.style.touchAction="auto";
 let start=null,last=null;
 const hasSelection=()=>{const selected=doc.getSelection?.();return !!selected&&!selected.isCollapsed&&!!selected.toString().trim()};
 function finish(){
  if(!start||!last){start=last=null;return}
  const dx=last.x-start.x,dy=last.y-start.y;
  const beganMoving=start.movedAt||Date.now();
  const longPress=beganMoving-start.at>420,wasSelecting=start.selecting;
  start=last=null;
  if(!document.body.classList.contains("lex-reader-fullscreen"))return;
  if(wasSelecting||hasSelection()||longPress)return; // Long-press or selected text is never a page turn.
  if(Math.abs(dx)<52||Math.abs(dx)<Math.abs(dy)*1.3)return;
  moveReadingPage(dx<0?1:-1);
 }
 surface.addEventListener("touchstart",e=>{
  if(e.touches.length!==1||!document.body.classList.contains("lex-reader-fullscreen")){start=last=null;return}
  const t=e.touches[0];start={x:t.clientX,y:t.clientY,at:Date.now(),selecting:hasSelection()};last={x:t.clientX,y:t.clientY};
 },{passive:true});
 surface.addEventListener("touchmove",e=>{
  if(!start||e.touches.length!==1)return;
  const t=e.touches[0];last={x:t.clientX,y:t.clientY};
  if(!start.movedAt&&Math.hypot(last.x-start.x,last.y-start.y)>10)start.movedAt=Date.now();
 },{passive:true});
 surface.addEventListener("touchend",e=>{
  if(!start)return;
  const t=e.changedTouches[0];if(t)last={x:t.clientX,y:t.clientY};finish();
 },{passive:true});
 // iOS can cancel a quick horizontal touch. The same selection/long-press guards still apply.
 surface.addEventListener("touchcancel",finish,{passive:true});
}
attachSwipe($("reader"),document);
function attachEpubSwipe(){const frame=epubHost.querySelector("iframe");try{if(frame?.contentDocument?.body)attachSwipe(frame.contentDocument.body,frame.contentDocument)}catch{}}
new MutationObserver(attachEpubSwipe).observe(epubHost,{childList:true,subtree:true});epubHost.addEventListener("load",attachEpubSwipe,true);

const appearance=document.createElement("div");
appearance.id="lex-appearance";appearance.hidden=true;
appearance.innerHTML='<span class="lex-appearance-label">Appearance</span><button class="btn" type="button" id="lex-font-down" aria-label="Smaller text">A−</button><button class="btn" type="button" id="lex-font-up" aria-label="Larger text">A＋</button><button class="btn" type="button" id="lex-appearance-close" aria-label="Close appearance settings">✕</button>';
document.querySelector("#read .grid>.panel:first-child").appendChild(appearance);
const fontChoices=document.createElement("div");fontChoices.className="lex-font-choices";
fontChoices.innerHTML='<button class="btn" type="button" data-lex-font="classic">Classic</button><button class="btn" type="button" data-lex-font="newyork">New York</button><button class="btn" type="button" data-lex-font="modern">Modern</button>';
appearance.insertBefore(fontChoices,$("lex-appearance-close"));
fontChoices.querySelectorAll("button").forEach(b=>b.onclick=()=>{readerFont=b.dataset.lexFont;localStorage.setItem("lexora-reader-font-family",readerFont);applyReaderFont();if(guideEl.classList.contains("lex-paginated")){paginating=true;guideEl.classList.remove("lex-paginated");paginating=false;paginateGuide()}});
applyReaderFont();

$("lex-font-down").onclick=()=>{$("smaller").click()};
$("lex-font-up").onclick=()=>{$("bigger").click()};
$("lex-appearance-close").onclick=()=>{appearance.hidden=true;controls.classList.remove("lex-show-advanced")};
function updateAppearance(){syncStatusBar();applyEpubHighlightStyle()}
window.addEventListener("lexora:reader-theme-changed",updateAppearance);

async function enterReader(){if(document.body.classList.contains("lex-reader-fullscreen"))return;document.body.classList.add("lex-reader-fullscreen");document.body.classList.add("lex-controls-hidden");refreshRunningTitle();syncStatusBar();requestAnimationFrame(()=>paginateGuide(false));$("lex-enter").hidden=true;const panel=document.querySelector("#read .grid>.panel:first-child");if(panel.requestFullscreen&&!document.fullscreenElement){try{await panel.requestFullscreen({navigationUI:"hide"})}catch(e){console.info("Using screen-filling reader layout",e)}}requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
function exitReader(){clearGuidePagination();appearance.hidden=true;closeResults();clearTimeout(fadeTimer);document.body.classList.remove("lex-reader-fullscreen","lex-controls-hidden");syncStatusBar();$("lex-enter").hidden=false;stop();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});requestAnimationFrame(()=>{try{window.rendition?.resize?.()}catch{}})}
$("lex-enter").onclick=enterReader;$("lex-exit").onclick=exitReader;
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("lex-reader-fullscreen"))exitReader()});
const reveal=document.createElement("button");reveal.className="btn lex-reader-reveal";reveal.type="button";reveal.textContent="☰";reveal.setAttribute("aria-label","Show reader controls");document.querySelector("#read .grid>.panel:first-child").appendChild(reveal);reveal.onclick=()=>showControls();
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
function clear(){
 if(activeHighlightDoc){try{activeHighlightDoc.defaultView?.CSS?.highlights?.delete("lexora-current-sentence")}catch{}activeHighlightDoc=null}
 if(marker){marker.classList.remove("lex-active");marker=null}
 // Paginating the guide clones its HTML, so a copy of the old highlight can linger on the new page.
 readingRoot()?.querySelectorAll(".lex-active").forEach(el=>el.classList.remove("lex-active"))
}
function applyEpubHighlightStyle(){
 const doc=epubBody();if(!doc?.head)return;
 const dark=$("reader").classList.contains("black"),white=$("reader").classList.contains("white");
 const fill=dark?"rgba(138,166,191,.30)":white?"#fff0cd":"rgba(229,195,123,.28)";
 let style=doc.getElementById("lexora-sentence-highlight");
 if(!style){style=doc.createElement("style");style.id="lexora-sentence-highlight";doc.head.appendChild(style)}
 style.textContent='html body .lex-active{background:'+fill+'!important;color:inherit!important;-webkit-box-decoration-break:clone;box-decoration-break:clone;border-radius:3px}::highlight(lexora-current-sentence){background-color:'+fill+'}';
}
/* Text ranges highlight exactly one sentence in EPUB paragraphs with inline formatting,
   without breaking the book's HTML, CFI navigation, or native selection. */
function sentenceRanges(p){
 const text=p.textContent||"",matches=[...text.matchAll(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)];
 const walker=p.ownerDocument.createTreeWalker(p,NodeFilter.SHOW_TEXT);
 const nodes=[];let offset=0,n;
 while((n=walker.nextNode())){nodes.push({node:n,start:offset,end:offset+n.textContent.length});offset+=n.textContent.length}
 function locate(at){for(const item of nodes){if(at<=item.end)return {node:item.node,at:Math.max(0,at-item.start)}}return nodes.length?{node:nodes[nodes.length-1].node,at:nodes[nodes.length-1].node.length}:null}
 return matches.map(m=>{
  const raw=m[0],trim=raw.trim(),leading=raw.length-raw.trimStart().length;
  if(!/[a-z]/i.test(trim))return null;
  const a=locate(m.index+leading),b=locate(m.index+leading+trim.length);
  if(!a||!b)return null;
  const range=p.ownerDocument.createRange();range.setStart(a.node,a.at);range.setEnd(b.node,b.at);
  return {text:trim,el:p,range}
 }).filter(Boolean);
}
function readingRoot(){return $("booklist").value==="guide"?$("guide"):epubBody()}
// Sentence spans carry data-lex-i so they can be found again after the guide is re-paginated into new nodes.
function liveEl(i){const item=items[i];if(!item)return null;if(item.el?.isConnected)return item.el;const found=readingRoot()?.querySelector('[data-lex-i="'+i+'"]');if(found){item.el=found;enableTap(item,i)}return found}
let autoContinue=false;
// At the end of a chapter keep reading into the next one, as an audiobook would.
function continueReading(){
 const guide=$("booklist").value==="guide",chapter=$("chapter");
 if(guide?!chapter||chapter.selectedIndex>=chapter.options.length-1:typeof rendition==="undefined"||!rendition){stop();$("lex-status").textContent="End of book";return}
 stop();$("next").click();autoContinue=true;$("lex-status").textContent="Next chapter…";
 const resume=()=>{if(!autoContinue)return;autoContinue=false;if(prepare(true))play(true)};
 if(guide)setTimeout(resume,900);else{let done=false;const once=()=>{if(done)return;done=true;setTimeout(resume,400)};try{rendition.once?.("relocated",once)}catch{}setTimeout(once,4000)}
}
function stop(){autoContinue=false;run++;playing=false;window.lexoraSpeech?.cancel();syncPlaybackButtons();
 // Do not leave "Speaking…" on screen after Pause or Exit.
 $("lex-status").textContent=items.length?"Sentence "+(Math.min(index,items.length-1)+1)+" / "+items.length:""}
function epubBody(){try{return document.querySelector("#epub-view iframe")?.contentDocument?.body}catch{return null}}
function prepare(reset){
 clear();if(reset)index=0;
 const guide=$("booklist").value==="guide",body=guide?$("guide"):epubBody();items=[];
 if(!body){$("lex-status").textContent="Waiting for EPUB page";return false}
 body.querySelectorAll("p").forEach(p=>{
  const txt=p.textContent||"";
  if(guide){
   let parts=sentences(txt);p.replaceChildren(...parts.map((part,i)=>{const sp=document.createElement("span");sp.textContent=part+(i<parts.length-1?" ":"");return sp}));
   p.querySelectorAll("span").forEach(sp=>{sp.dataset.lexI=String(items.length);items.push({text:sp.textContent.trim(),el:sp})})
  }else{
   const prior=Array.from(p.children);
   if(prior.length&&p.childNodes.length===prior.length&&prior.every(sp=>sp.matches("span[data-lex-i]"))){
    // A previous preparation already segmented plain paragraphs: reuse the sentence spans.
    prior.forEach(sp=>{sp.dataset.lexI=String(items.length);items.push({text:sp.textContent.trim(),el:sp})})
   }else if(p.children.length===0){
    const parts=sentences(txt);
    p.replaceChildren(...parts.map((part,i)=>{const sp=p.ownerDocument.createElement("span");sp.textContent=part+(i<parts.length-1?" ":"");return sp}));
    p.querySelectorAll("span").forEach(sp=>{sp.dataset.lexI=String(items.length);items.push({text:sp.textContent.trim(),el:sp})})
   }else{sentenceRanges(p).forEach(item=>items.push(item))}
  }
 });
 items.forEach(enableTap);if(!guide)applyEpubHighlightStyle();
 // An EPUB chapter is one long page strip: start from the page on screen, not the top of the chapter.
 if(reset&&!guide){const view=$("epub-view").getBoundingClientRect(),frame=document.querySelector("#epub-view iframe")?.getBoundingClientRect();if(frame){const i=items.findIndex(it=>{const x=frame.left+it.el.getBoundingClientRect().left;return x>=view.left-2&&x<view.right-2});if(i>0)index=i}}
 index=Math.min(index,Math.max(0,items.length-1));$("lex-status").textContent=items.length?"Sentence "+(index+1)+" / "+items.length:"No text on this page";
 return items.length>0
}
// A WeakSet, not a data attribute: paginated clones copy attributes but not listeners.
const tapReady=new WeakSet();
function enableTap(item,number){
 const el=item.el;
 if(!el)return;
 if(tapReady.has(el))return;tapReady.add(el);el.classList.add("lex-tappable");if(matchMedia("(hover:hover) and (pointer:fine)").matches){el.tabIndex=0;el.title="Double-click to replay sentence; click a word for its meaning"}
 function replay(){if(mode!=="both")return;const selection=el.ownerDocument.getSelection?.();if(selection&&!selection.isCollapsed)return;stop();index=number;play()}
 el.addEventListener("dblclick",replay);
 el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();replay()}});
}
function highlight(){
 clear();const item=items[index],el=liveEl(index);if(!item)return;
 if(mode==="both"&&el){
  const view=el.ownerDocument.defaultView;
  if(item.range&&item.range.startContainer.isConnected&&view?.CSS?.highlights&&view.Highlight){
   try{applyEpubHighlightStyle();view.CSS.highlights.set("lexora-current-sentence",new view.Highlight(item.range));activeHighlightDoc=el.ownerDocument}catch{marker=el;marker.classList.add("lex-active")}
  }else{marker=el;marker.classList.add("lex-active")}
  if(playing&&followingAudio)followPage(el)
 }
 $("lex-status").textContent="Sentence "+(index+1)+" / "+items.length
}
// Turn the page with the narration instead of leaving the highlight on a page that is not shown.
function followPage(el){
 if(guideEl.classList.contains("lex-paginated")){const page=el.closest(".lex-book-page"),i=page?Array.prototype.indexOf.call(guideEl.children,page):-1;if(i>=0&&i!==guidePageIndex){guidePageIndex=i;guideEl.scrollTo({left:i*guideEl.clientWidth,behavior:"smooth"})}return}
 if(el.ownerDocument!==document){try{
  const frame=document.querySelector("#epub-view iframe"),view=$("epub-view").getBoundingClientRect(),x=frame.getBoundingClientRect().left+el.getBoundingClientRect().left;
  if(Date.now()-lastAutoTurn>450&&typeof rendition!=="undefined"&&rendition){
   if(x>=view.right-2){lastAutoTurn=Date.now();rendition.next()}
   else if(x<view.left-2){lastAutoTurn=Date.now();rendition.prev()}
  }
 }catch{}return}
 el.scrollIntoView?.({block:"nearest",behavior:"smooth"})
}
// The system voice is the sole narrator. Begin inside the user's tap on iOS.
function play(auto=false){
 if(!auto)showControls();
 window.lexoraSpeech?.unlock();
 if(!items.length&&!prepare(true))return;
 if(!window.speechSynthesis||!window.lexoraSpeech){$("lex-status").textContent="Device voice unavailable. Try Settings → Audio check.";return}
 const session=++run;playing=true;inspect.hidden=true;syncPlaybackButtons();
 const speed=()=>Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9"));
 function next(){
  if(session!==run||!playing)return;
  if(index>=items.length){continueReading();return}
  highlight();let started=false,finished=false;
  const ok=lexoraSpeech.speak(items[index].text,{
   rate:speed(),
   voiceURI:JSON.parse(localStorage.getItem("lexora-voice-choice")||'""'),
   onstart:()=>{started=true;if(session===run)$("lex-status").textContent="Speaking…"},
   onend:()=>{finished=true;if(session===run&&playing){index++;next()}},
   onerror:error=>{finished=true;if(session!==run)return;stop();$("lex-status").textContent="Device voice failed ("+error+"). Try Settings → Audio check."}
  });
  if(ok===false){finished=true;return}
  setTimeout(()=>{if(session===run&&playing&&!started&&!finished&&!window.speechSynthesis.speaking)$("lex-status").textContent="Speech did not start. Try Settings → Audio check."},4500);
 }
 next();
}
inspect.addEventListener("click",e=>{if(e.target.closest(".lex-sheet-close"))inspect.hidden=true});
function examine(i){const item=items[i];if(!item)return;inspect.hidden=false;showControls();inspect.innerHTML='<button type="button" class="btn lex-sheet-close" aria-label="Close">✕</button><p><b>Selected sentence</b></p><p id="lex-sentence"></p><button class="btn primary" id="lex-analyze">Find expressions</button><p class="small muted">You can also select a shorter phrase above.</p>';$("lex-sentence").textContent=item.text;
 function send(){const chosen=window.getSelection()?.toString().trim()||item.text;openResults(chosen,item.text)}
 $("lex-analyze").onclick=()=>{window.getSelection()?.removeAllRanges();send()};$("lex-sentence").addEventListener("mouseup",()=>{if(window.getSelection()?.toString().trim())send()})
}
function pause(){showControls();stop();clear();inspect.hidden=true}
function chooseMode(next){appearance.hidden=true;closeResults();showControls();controls.classList.remove("lex-show-advanced");mode=next;followingAudio=true;stop();inspect.hidden=true;clear();document.body.classList.toggle("lex-audio-mode",mode==="both");$("lex-read").classList.toggle("primary",mode==="read");$("lex-listen").classList.toggle("primary",mode==="both");$("lex-play").hidden=mode==="read";$("lex-back").hidden=mode==="read";$("lex-forward").hidden=mode==="read";$("lex-status").hidden=mode==="read";syncPlaybackButtons();enterReader()}
$("lex-read").onclick=()=>chooseMode("read");$("lex-listen").onclick=()=>chooseMode("both");
function togglePlayback(){if(playing)pause();else if(mode==="read")chooseMode("both");else play()}
$("lex-play").onclick=togglePlayback;$("lex-player-play").onclick=togglePlayback;
function sentenceSeconds(i){
 const speed=Math.max(.5,Math.min(2,Number(JSON.parse(localStorage.getItem("lexora-voice-speed")||"0.9"))||.9));
 return Math.max(.8,(items[i]?.text.trim().split(/\s+/).length||1)*60/(175*speed)+.2);
}
function seekBy(seconds){
 if(!items.length&&!prepare(true))return;
 const wasPlaying=playing;let remaining=Math.abs(seconds),next=index;
 if(seconds>0){do{remaining-=sentenceSeconds(next);if(next>=items.length-1)break;next++}while(remaining>0)}
 else{do{if(next===0)break;next--;remaining-=sentenceSeconds(next)}while(remaining>0)}
 if(wasPlaying)stop();index=next;
 if(wasPlaying)play();else{$("lex-status").textContent="Sentence "+(index+1)+" / "+items.length;clear()}
}
$("lex-seek-back").onclick=()=>seekBy(-15);
$("lex-seek-forward").onclick=()=>seekBy(15);
$("lex-return").onclick=()=>{
 followingAudio=true;syncPlaybackButtons();
 const target=liveEl(index);if(!target)return;
 if(target.ownerDocument===document){followPage(target);return}
 // epub.js moves one column at a time; keep finding the narrated position on explicit request.
 const anchorIndex=index;let turns=0;
 async function locate(){
  while(turns++<40&&followingAudio&&index>=anchorIndex&&target.isConnected){
   const frame=document.querySelector("#epub-view iframe"),view=$("epub-view").getBoundingClientRect();
   if(!frame)break;
   const x=frame.getBoundingClientRect().left+target.getBoundingClientRect().left;
   if(x>=view.left-2&&x<view.right-2)break;
   if(typeof rendition==="undefined"||!rendition)break;
   try{if(x<view.left-2)await rendition.prev();else await rendition.next();await new Promise(resolve=>setTimeout(resolve,120))}catch{break}
  }
 }
 locate();
};
$("lex-back").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.max(0,index-1);highlight()};
$("lex-forward").onclick=()=>{stop();if(!items.length)prepare(true);index=Math.min(items.length-1,index+1);highlight()};
["chapter","booklist","prev","next","load-guide","upload-book"].forEach(id=>$(id)?.addEventListener("click",()=>{stop();setTimeout(()=>prepare(true),350)}));
$("chapter").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),100)});
$("booklist").addEventListener("change",()=>{stop();setTimeout(()=>prepare(true),900)});
const observer=new MutationObserver(()=>{if($("booklist").value!=="guide"&&!playing){setTimeout(()=>prepare(true),250)}});observer.observe($("epub-view"),{childList:true});
$("lex-read").classList.add("primary");$("lex-play").hidden=$("lex-back").hidden=$("lex-forward").hidden=$("lex-status").hidden=true;
syncPlaybackButtons();
$("reader").addEventListener("click",e=>{if(!document.body.classList.contains("lex-reader-fullscreen"))return;if(window.getSelection()?.toString().trim())return;if(e.target.closest(".lex-tappable"))return;showControls()});
prepare(true);
})();