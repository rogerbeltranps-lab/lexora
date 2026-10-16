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
  "html[data-lexora-theme='dark'] .lex-bookmark-remove{color:#efb6af}"
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

function bookmarksFor(bookId) {
  try {
    const value = JSON.parse(localStorage.getItem("lexora-bookmarks-" + bookId));
    return Array.isArray(value) ? value.filter(x => x && typeof x.cfi === "string" && typeof x.id === "string") : [];
  } catch { return []; }
}
function writeBookmarks(bookId, value) {
  localStorage.setItem("lexora-bookmarks-" + bookId, JSON.stringify(value));
}
function close() {
  sheet.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
}
function selectedBook() {
  return document.getElementById("booklist")?.value || "guide";
}
function refreshTrigger() {
  const available = selectedBook() !== "guide";
  trigger.hidden = !available;
  if (!available) close();
}
function render(message) {
  const bookId = selectedBook();
  if (bookId === "guide") { close(); return; }
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
        await bridge.jump(item.cfi);
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
trigger.onclick = () => {
  if (sheet.hidden) {
    render();
    sheet.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    sheet.querySelector("#lex-bookmark-close").focus();
  } else close();
};
sheet.querySelector("#lex-bookmark-close").onclick = close;
saveButton.onclick = () => {
  const position = bridge.current();
  if (!position || position.bookId !== selectedBook() || !position.cfi) {
    render("Open a book page before adding a bookmark.");
    return;
  }
  const saved = bookmarksFor(position.bookId);
  if (saved.some(x => x.cfi === position.cfi)) {
    render("This page is already bookmarked.");
    return;
  }
  const label = "Bookmark " + (saved.length + 1) + (position.percent == null ? "" : " · " + Math.round(position.percent * 100) + "%");
  saved.push({id: String(Date.now()) + "-" + Math.random().toString(36).slice(2), cfi: position.cfi, label});
  writeBookmarks(position.bookId, saved);
  render("Bookmark saved.");
};
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !sheet.hidden) { e.stopPropagation(); close(); }
});
document.getElementById("booklist")?.addEventListener("change", () => { close(); refreshTrigger(); });
window.addEventListener("lexora:book-selected", () => { close(); refreshTrigger(); });
refreshTrigger();
})();
