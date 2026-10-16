/* Reader-only EPUB bookmarks. No changes to narration, selection, flashcards or sync. */
(() => {
"use strict";
const bridge = window.lexoraReaderPosition;
const controls = document.querySelector(".lex-narr");
const panel = document.querySelector("#read .grid > .panel:first-child");
if (!bridge || !controls || !panel) return;

const style = document.createElement("style");
style.textContent = [
  ".lex-bookmark-trigger{display:inline-flex;align-items:center;justify-content:center;min-width:40px}",
  ".lex-bookmark-trigger svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linejoin:round}",
  ".lex-bookmark-trigger[hidden],#lex-bookmark-sheet[hidden]{display:none!important}",
  "#lex-bookmark-sheet{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1800;width:min(390px,calc(100vw - 28px));max-height:min(70dvh,640px);overflow:auto;padding:19px;border:1px solid #d3dee5;border-radius:17px;background:#fff;color:#213244;box-shadow:0 20px 60px #071a2d55}",
  ".lex-bookmark-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}",
  ".lex-bookmark-head h3{font-size:18px;margin:0}",
  "#lex-bookmark-save{width:100%;margin-bottom:12px;min-height:44px}",
  ".lex-bookmark-list{list-style:none;margin:0;padding:0;display:grid;gap:7px}",
  ".lex-bookmark-item{display:flex;align-items:center;gap:8px;border:1px solid #dce5eb;border-radius:10px;padding:6px}",
  ".lex-bookmark-jump{min-width:0;flex:1;text-align:left;border:0;background:transparent;color:inherit;padding:7px;font-size:14px;cursor:pointer}",
  ".lex-bookmark-remove{border:0;background:transparent;color:#8a4545;padding:8px;cursor:pointer}",
  ".lex-bookmark-note{font-size:13px;line-height:1.45;color:#617589;margin:6px 0 10px}",
  "html[data-lexora-theme='dark'] #lex-bookmark-sheet{background:#1b2935;color:#f0f5f8;border-color:#4f6472}",
  "html[data-lexora-theme='dark'] .lex-bookmark-item{border-color:#4f6472}",
  "html[data-lexora-theme='dark'] .lex-bookmark-note{color:#b5c5d0}",
  "html[data-lexora-theme='dark'] .lex-bookmark-remove{color:#efb6af}",
  ".lex-bookmark-floating{display:none!important}",
  "body.lex-reader-fullscreen #lex-bookmark-trigger{display:none!important}",
  "body.lex-reader-fullscreen .lex-bookmark-floating:not([hidden]){display:inline-flex!important;position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:calc(12px + env(safe-area-inset-left,0px));z-index:12;width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:#92929a;opacity:.8;box-shadow:none;padding:10px;align-items:center;justify-content:center}",
  "body.lex-reader-fullscreen .lex-bookmark-floating:not([hidden]):focus-visible,body.lex-reader-fullscreen .lex-bookmark-floating:not([hidden]):hover{opacity:1;background:#84949f20}",
  "html[data-lexora-theme='dark'] body.lex-reader-fullscreen .lex-bookmark-floating{color:#b5bfca}",
  "body.lex-reader-fullscreen #lex-bookmark-sheet{top:50%;left:50%;z-index:1800}",
  "@media(max-width:650px){#lex-bookmark-sheet{max-height:calc(100dvh - 95px)}}"
].join("\n");
document.head.appendChild(style);

const trigger = document.createElement("button");
trigger.type = "button";
trigger.className = "btn lex-bookmark-trigger";
trigger.id = "lex-bookmark-trigger";
trigger.setAttribute("aria-label", "Bookmarks");
trigger.setAttribute("title", "Bookmarks");
trigger.setAttribute("aria-expanded", "false");
trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z"/></svg>';
controls.insertBefore(trigger, controls.querySelector("#lex-options"));
// Keep a separate, unobtrusive icon visible beside the book title in immersive mode.
// The primary toolbar auto-hides; bookmarks must remain discoverable.
const floating = trigger.cloneNode(true);
floating.id = "lex-bookmark-floating";
floating.classList.add("lex-bookmark-floating");
panel.appendChild(floating);

const sheet = document.createElement("section");
sheet.id = "lex-bookmark-sheet";
sheet.hidden = true;
sheet.setAttribute("role", "dialog");
sheet.setAttribute("aria-labelledby", "lex-bookmark-title");
sheet.innerHTML = '<div class="lex-bookmark-head"><h3 id="lex-bookmark-title">Bookmarks</h3><button class="btn" id="lex-bookmark-close" type="button" aria-label="Close bookmarks">✕</button></div><button class="btn primary" id="lex-bookmark-save" type="button">＋ Bookmark this page</button><p class="lex-bookmark-note" id="lex-bookmark-note"></p><ul class="lex-bookmark-list" id="lex-bookmark-list"></ul>';
panel.appendChild(sheet);
const saveButton = sheet.querySelector("#lex-bookmark-save");
const note = sheet.querySelector("#lex-bookmark-note");
const list = sheet.querySelector("#lex-bookmark-list");
const guide = window.lexoraGuidePosition;
const guideEl = document.getElementById("guide");
const chapterSelect = document.getElementById("chapter");
const GUIDE_POSITION_KEY = "lexora-guide-last-page";
let pendingGuide = null;
let knownChapter = Number(chapterSelect?.value) || 0;
try {
  const position = JSON.parse(localStorage.getItem(GUIDE_POSITION_KEY));
  if (position && position.chapter === knownChapter && Number.isInteger(position.page) && position.page >= 0)
    pendingGuide = position;
} catch {}
function saveGuidePage() {
  if (selectedBook() !== "guide" || pendingGuide) return;
  const place = guide?.current();
  if (!place?.ready) return;
  try { localStorage.setItem(GUIDE_POSITION_KEY, JSON.stringify({chapter:place.chapter,page:place.page})); } catch {}
}
function restoreGuidePage() {
  if (!pendingGuide || selectedBook() !== "guide" || !document.body.classList.contains("lex-reader-fullscreen")) return;
  const place = guide?.current();
  if (!place?.ready || place.chapter !== pendingGuide.chapter || !guideEl?.firstElementChild?.classList.contains("lex-book-page")) return;
  if (guide.jump(pendingGuide.page)) {
    pendingGuide = null;
    saveGuidePage();
  }
}
if (guideEl) {
  guideEl.addEventListener("scroll", saveGuidePage, {passive:true});
  new MutationObserver(() => {
    const chapter = Number(chapterSelect?.value) || 0;
    if (knownChapter !== chapter) {
      knownChapter = chapter;
      if (!pendingGuide || pendingGuide.chapter !== chapter) pendingGuide = {chapter,page:0};
    }
    setTimeout(restoreGuidePage, 0);
  }).observe(guideEl, {childList:true});
}
window.addEventListener("pagehide", saveGuidePage);
document.addEventListener("visibilitychange", () => {if (document.hidden) saveGuidePage();});
function currentPosition() {
  if (selectedBook() !== "guide") return bridge.current();
  const place = guide?.current();
  if (!place) return null;
  return {bookId:"guide", cfi:"guide:" + place.chapter + ":" + (place.ready ? place.page : 0),
    label:"Chapter " + (place.chapter + 1) + " · page " + ((place.ready ? place.page : 0) + 1),
    percent:null};
}
function jumpToGuide(cfi) {
  const found = /^guide:(\d+):(\d+)$/.exec(cfi);
  if (!found) throw Error("Invalid guide bookmark");
  const chapter = Number(found[1]),page = Number(found[2]);
  if (!Number.isSafeInteger(chapter) || !Number.isSafeInteger(page) ||
      chapter < 0 || chapter >= chapterSelect.options.length || page < 0) throw Error("Invalid guide bookmark");
  pendingGuide = {chapter,page};
  if (Number(chapterSelect.value) !== chapter) {
    chapterSelect.value = String(chapter);
    chapterSelect.dispatchEvent(new Event("change", {bubbles:true}));
  }
  restoreGuidePage();
  return true;
}

function bookmarksFor(bookId) {
  try {
    const value = JSON.parse(localStorage.getItem("lexora-bookmarks-" + bookId));
    return Array.isArray(value) ? value.filter(x => x && typeof x.cfi === "string" && typeof x.id === "string") : [];
  } catch { return []; }
}
function writeBookmarks(bookId, value) {
  const before = bookmarksFor(bookId);
  const remaining = new Set(value.map(x => x.id));
  const deleted = before.filter(x => !remaining.has(x.id));
  if (deleted.length) {
    try {
      const removed = JSON.parse(localStorage.getItem("lexora-bookmark-deletions") || "{}");
      for (const item of deleted) removed[item.id] = {bookId, modifiedAt: new Date().toISOString(), deleted: true};
      localStorage.setItem("lexora-bookmark-deletions", JSON.stringify(removed));
    } catch (e) { console.warn("Could not record bookmark deletions", e); }
  }
  localStorage.setItem("lexora-bookmarks-" + bookId, JSON.stringify(value));
  window.dispatchEvent(new Event("lexora:bookmarks-changed"));
}
function close() {
  sheet.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  floating.setAttribute("aria-expanded", "false");
}
function selectedBook() {
  return document.getElementById("booklist")?.value || "guide";
}
function refreshTrigger() {
  const available = selectedBook() === "guide" ? Boolean(guide) : Boolean(bridge);
  trigger.hidden = !available;
  floating.hidden = !available;
  if (!available) close();
}
function render(message) {
  const bookId = selectedBook();
  list.replaceChildren();
  const saved = bookmarksFor(bookId);
  note.textContent = message || (saved.length ? "Select a bookmark to return to that location." : "No bookmarks in this book yet.");
  for (const item of saved.slice().reverse()) {
    const li = document.createElement("li");
    li.className = "lex-bookmark-item";
    const jump = document.createElement("button");
    jump.type = "button";
    jump.className = "lex-bookmark-jump";
    jump.textContent = item.label || "Saved location";
    jump.setAttribute("aria-label", "Go to " + jump.textContent);
    jump.onclick = async () => {
      if (selectedBook() !== bookId) return;
      try {
        if (bookId === "guide") jumpToGuide(item.cfi);
        else await bridge.jump(item.cfi);
        close();
      } catch { render("This bookmark could not be opened."); }
    };
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "lex-bookmark-remove";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Remove " + jump.textContent);
    remove.onclick = () => {
      writeBookmarks(bookId, bookmarksFor(bookId).filter(x => x.id !== item.id));
      render("Bookmark removed.");
    };
    li.append(jump, remove);
    list.append(li);
  }
}
function toggleSheet() {
  if (sheet.hidden) {
    render();
    sheet.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    floating.setAttribute("aria-expanded", "true");
    sheet.querySelector("#lex-bookmark-close").focus();
  } else close();
}
trigger.onclick = toggleSheet;
floating.onclick = toggleSheet;
sheet.querySelector("#lex-bookmark-close").onclick = close;
saveButton.onclick = () => {
  const position = currentPosition();
  if (!position || position.bookId !== selectedBook() || !position.cfi) {
    render("Open a book page before adding a bookmark.");
    return;
  }
  const saved = bookmarksFor(position.bookId);
  if (saved.some(x => x.cfi === position.cfi)) {
    render("This page is already bookmarked.");
    return;
  }
  const label = position.label || "Bookmark " + (saved.length + 1) + (position.percent == null ? "" : " · " + Math.round(position.percent * 100) + "%");
  saved.push({id: String(Date.now()) + "-" + Math.random().toString(36).slice(2), cfi: position.cfi, label, modifiedAt: new Date().toISOString()});
  writeBookmarks(position.bookId, saved);
  render("Bookmark saved.");
};
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !sheet.hidden) { e.stopPropagation(); close(); }
});
document.getElementById("booklist")?.addEventListener("change", () => { close(); refreshTrigger(); });
window.addEventListener("lexora:book-selected", () => { close(); refreshTrigger(); });
window.addEventListener("lexora:bookmarks-refreshed", () => { if (!sheet.hidden) render(); });
refreshTrigger();
})();
