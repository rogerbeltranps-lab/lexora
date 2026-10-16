# Lexora changelog

## 2026-10-16 · Working brand decision (documentation only)
- Adopted **LooKitUp** (exact capitalization) as the working brand for the prototype, inspired by “look it up.”
- Keep **Read. Discover. Remember.**, the existing rounded blue L/RBP favicon, and the goal of easy contextual word/idiom capture. Public-language support can expand to English, Spanish and other languages.
- **No implementation rename:** the live app, repository, URLs, manifest, Firebase/data identifiers and user's saved content remain Lexora. Trademark/domain clearance is deferred until a possible public launch; similar lookup products already use this phrase.
- Updated the consolidated README and documentation-agent guardrail; Lexitale is no longer the preferred candidate.


## 2026-10-16 · 39 — Remove blurred iPhone top status bar
- Replace the installed iPhone app's `black-translucent` status-bar mode with an **opaque black** status bar. This avoids the grey-to-navy system translucency/scroll-edge gradient visible above the app's header in the user screenshot.
- Set the PWA/browser `theme-color` to Lexora's header navy (light: `#122c42`, dark: `#15212c`) while outside immersive reading, rather than the pale content background; keep existing full-screen reader theme-color behavior.
- No changes to tab navigation, appearance setting, reading flow, EPUBs, flashcards, login, syncing or audio.
- App v39; PWA shell cache v38. Syntax and static checks passed; exact rendering must be verified on the installed iPhone because iOS controls native status-bar appearance.


## 2026-10-16 · 38 — Efficient Firestore synchronization
- Stop repeated Firestore writes when cards/reviews are unchanged. Compare canonical card IDs and content regardless of array/object field order; ignore the server's `updatedAt` metadata when checking whether a write is needed.
- On initial sign-in, a manual Sync click and remote snapshot events, only `tx.set` when the merged card/review content actually differs from Firestore (or the document doesn't exist). An unchanged synchronization is read-only.
- **Saving or editing a flashcard immediately requests cloud synchronization**, with no 650 ms timer. Reviews and backup imports retain the short 650 ms debounce to group rapid changes.
- Preserve cards created during an in-flight transaction; queue an immediate follow-up write instead of overwriting the new local save. Keep the real-time snapshot listener for changes from other devices.
- Retry transient network failures when the device comes back online without background polling. Current Firestore status distinguishes saved changes from already-synchronized, no-change checks.
- No change to account configuration, EPUB storage, login, cards/reviews or the native reader. Code and mocked Firestore transaction tests pass; real-device sync testing pending.
- App v38; PWA shell v37.


## 2026-10-16 · 37 — EPUB navigation, playback and preferences
- **Image-only EPUB pages**: add subtle previous/next edge buttons outside the embedded EPUB frame, and attach touch-swipe handling at the chapter document root to support covers and publisher-logo pages whose embedded images intercept gestures.
- **Flashcard editor on iPhone**: all editable inputs/selects/textarea now use at least 16px text, preventing Safari's automatic focus zoom; dialog dimensions are constrained to the dynamic viewport, without disabling pinch zoom.
- **Read & Listen word start**: a single word tap opens "Read from here" and "Look up" actions. "Read from here" starts speech at that exact word (not the start of the sentence). Native long-press phrase selection and dictionary access remain separate.
- **Speech reliability**: speechSynthesis gets a duration/boundary watchdog, detecting cases where iOS reports speaking indefinitely without progressing. Playback stops with a clear **Tap Play to resume** message rather than being stuck; the current sentence is retained.
- **Appearance setting**: System (default), Light or Dark now controls the **entire app and EPUB**. Overrides persist; System updates on iPhone appearance changes. No theme icon reinstated.
- Static parsing and regression checks completed; this change is **not yet physically verified** on iPhone. Existing books, flashcards, settings other than theme, favicon, and native voice remain intact.
- App v37; PWA shell cache v36.


## 2026-10-15 · 36 — System dark mode throughout Lexora and player icons
- **Entire Lexora UI follows the device appearance automatically**, not only the EPUB: app background, navigation, library, vocabulary lookup, flashcards, practice, settings, controls, inputs, login gate and flashcard editor now receive coordinated dark colors.
- Dark reader overlays and menus (appearance, narration toolbar, exploration/dictionary sheet) use readable dark surfaces; immersive EPUB text keeps its existing device-following black/white presentation. OS changes switch CSS in real time, with the iPhone theme-color refreshed when the app is visible.
- Playback icons now match the supplied reference: thick, mirrored circular skip arrows with **15 on both sides**, and clear Play/rounded Pause symbols. Skip durations remain approximate ±15 seconds; no audio logic changes.
- Retains Modern as the initial font, existing typeface choices and app data. JavaScript syntax and code-level assertions passed; physical-device visual and accessibility testing remains outstanding.
- Version 36; PWA shell cache v35.


## 2026-10-15 · 35 — iPhone highlighting and auto-hide follow-up
- User screenshot confirms v34 still lacked visible sentence highlighting in a real imported EPUB and that the top playback menu remained on screen.
- Moved the translucent exact-sentence overlay inside the EPUB iframe, directly above the text, while keeping it non-interactive. Redraw when epub.js relocates pages. No EPUB text wrapping/rewriting or data deletion.
- Fixed the top toolbar hide timer so it runs on Play and after entering immersive mode, fading after ~3.2 seconds without interactions; bottom audio player remains visible.
- **Still requires user verification on a physical iPhone**. Code parses; neither bug is claimed fixed on-device.
- Version 35, service worker shell v34.


## 2026-10-15 · 34 — Exact spoken-sentence highlighting
- EPUB narration now paints the **exact current sentence** with a subtle, theme-aware overlay based on DOM Range rectangles instead of depending on CSS Highlights support or marking a whole paragraph as a fallback.
- Does not rewrite EPUB paragraphs, so iPhone long-press/drag selection and book location markers are better preserved. Uses the current sentence position to choose the visible starting point and follow narration across columns.
- Rebuilds sentence markers after guide pagination, including paragraphs split across pages; maintains highlighting as EPUB pages relocate.
- Added safeguards so the passive overlay is not mistaken for a newly loaded chapter.
- **Code change only:** verify physical iPhone Safari/PWA and desktop browser, plus mixed inline-format EPUB text and reflow behavior. Not yet validated on a real device.
- App version 34; PWA shell cache v33.

## 2026-10-15 · 33 — Default typeface and rewind icon
- New readers with **no saved typeface preference** now default to Modern (system sans-serif). Classic and New York remain options, and existing selections stay unchanged.
- Redesigned only the back-15-second curved arrow orientation and arrowhead; playback direction and approximate skipping behavior are unchanged.
- App v33, PWA shell cache v32. JavaScript syntax and control wiring checks passed; actual iPhone appearance still needs device verification.


## 2026-10-15 · 32 — iPhone phrase selection and smoother reading
- Reader selection: respond to native iPhone `selectionchange`, release/selection-handle actions and delayed WebKit updates in both the guide and EPUB iframes. Restore native `user-select` on EPUB inline elements; if WebKit fails to select during a deliberate long-press drag, create a text range without preventing default touch handling.
- **Explore selection** stays usable when native handles are dragged and sits above the narration controls. Long-presses are not mistaken for a single-word tap. Native swipe/page navigation still takes precedence for ordinary short swipes.
- Device narration now speaks up to three consecutive sentences in **one** utterance (maximum ~320 characters, same paragraph) instead of restarting after every period. Uses speech word-boundary offsets to follow highlighted sentences, with estimated highlight progression only when WebKit omits boundaries. This reduces synthetic gaps between sentences but cannot control Apple’s natural punctuation pauses.
- The approximate ±15-second controls are now circular, with curved SVG skip arrows and a central 15. Voice engine, app name, favicon, user content and flashcard storage unchanged.
- JavaScript syntax and mocked sentence grouping / selection range checks passed. Actual iPhone Safari/PWA touch and speech timing still require device verification. Version 32; PWA shell v31.



## 2026-10-15 · 31 — Automatic device appearance, no theme icons
- The EPUB and built-in reader always use the device's **current** dark/light appearance. Older saved sepia/white/black overrides no longer take precedence.
- Removed the compact sun/moon theme button and immersive theme choices. Font size and typeface controls remain.
- Watches operating-system appearance changes, and rechecks on app resume/pageshow for iOS PWA reliability. EPUB theme, highlights and status bar update without resetting the current reading position.
- Version 31; PWA shell cache v30. Physical iPhone testing remains pending.


## 2026-10-15 · 30 — Follow device reader appearance
- Reader now defaults to the device's light/dark preference (white in light mode, black in dark mode), rather than sepia.
- An explicit sepia/white/black preference is preserved. Added **Dispositiu** in immersive appearance settings to restore automatic behavior; the compact reader theme button cycles through all four options.
- In automatic mode, changes to the device's color scheme immediately update the guide, EPUB reading theme, narration highlights and iPhone status bar while keeping the manual override intact.
- Version 30, PWA shell cache v29. Physical iPhone visual verification still pending.


## 2026-10-15 · 29 — Read & Listen controls
- Reader audio **starts paused** when switching to Read & Listen, and only plays after a deliberate Play tap.
- A small persistent, safe-area-aware audio control in the immersive reader adds Play/Pause and backward/forward **approximately 15 seconds**. Native device TTS has no accurate audio timestamp seeking, so skips are estimated from sentence lengths and chosen speed.
- Manually swiping or turning pages while narration plays disengages automatic page following without stopping the audio. A **Narration** button returns to the currently spoken position. Resuming Play does not reset the reading page, and Pause no longer opens a blocking sentence popup.
- Soft sentence tracking: warm, low-contrast cream in light/sepia and muted blue-gray in dark mode. In EPUB paragraphs with inline formatting, CSS Highlight API ranges track individual sentences without rewriting the book DOM; browsers lacking this API fall back to paragraph highlighting for such paragraphs.
- Static JavaScript syntax validation passed; physical iPhone PWA, iOS Safari, desktop voice playback, complex EPUBs, and visual contrast/selection require real-device testing. PWA shell cache v28.



## 2026-10-15 · 28
- Mobile reader default font size increased from 19 to 26 on narrow screens (up to 650px); desktop default remains 19.
- Legacy 19px mobile defaults are upgraded automatically. Any new A−/A+ choice is kept, including choosing smaller text; EPUB and guide still share the same setting.
- Updated PWA version to 28, shell cache to v27. Physical iPhone appearance and EPUB reflow still need verification.

## 2026-10-15 · Documentation consolidation
- Consolidated product status, roadmap, deferred ideas, October 15 decisions, and unresolved bugs into the canonical `README.md`.
- Kept this dated changelog as the technical history and simplified the documentation agent's responsibilities. Retired duplicate `ROADMAP.md` and `docs/FEATURES.md`; their previous contents remain in Git history.
- Recorded **Lexitale as a candidate only**, with **no app/repository/URL/favicon rename**. Reaffirmed native device voice (Kokoro removed) and real-device checks outstanding.
- **Documentation change only**; no code, live deployment, or physical-device test was performed in this update.

## 2026-10-15 · 27
- Mobile reader: constrained the book selector, panel, toolbar and EPUB iframe to the iPhone viewport without horizontal overflow.
- EPUB sanitization now substitutes explicit Unicode presentation ligatures (e.g. the missing “fi” in “chafing”) with normal characters, restores selectable text and sensible word wrapping, and leaves personal book storage untouched.
- Reader selection now respects native iPhone long-press and drag handles. An unobtrusive **Explore selection** action appears after a phrase is selected; the exact selected phrase is used only after tapping it. One-tap word lookup remains available. Removed older handlers that immediately opened the dictionary and cleared the selection.
- Page swiping now distinguishes deliberate horizontal movements from long presses, selection-handle drags and vertical scrolling. Reader sentence spans are not focusable on touch devices.
- Native speech no longer cancels completed speech before queuing the next sentence (avoids a delayed, out-of-gesture iOS restart); desktop browsers no longer prime a silent HTML audio player. Unexpected speech errors and failure-to-start now surface in the UI.
- Static parsing of modified scripts and a mocked consecutive-sentence speech test passed. Physical iPhone / desktop browser playback and iOS WebKit layout/gesture behavior still require on-device verification.
- Version `2026-10-15 · 27`; PWA shell cache v26.

## 2026-10-15
- Native device voice only in Read & Listen, dictionary pronunciation, and flashcards. Removed Kokoro voice selector, model downloads, Web Worker, long prebuffer waits, and the delayed fallback. Narration invokes the built-in voice in the user's Play tap and displays failures.
- Removed Kokoro-only cross-origin isolation and its Google Sign-In extra reload; obsolete isolation caches are retired, preserving IndexedDB, personal EPUBs, flashcards and saved settings.
- Updated Audio check, Settings and app update; version `2026-10-15 · 26`, shell cache v25. The physical iPhone speech output still needs verification with all three diagnostic tests.


## 2026-10-13
- No audio in the computer browser. Likely causes, all fixed: cross-origin isolation (added for phones in version 18) was also switched on for computers, where it only risks breaking Kokoro's GPU path and gains nothing, so it is now phones only (service worker and sign-in code); the chapter pre-buffer wait started from the phone-speed guess on computers (now a GPU-speed guess); and a browser-suspended audio context left Kokoro silent forever (it now gives up after 2.5 s so the device voice reads). Version "2026-10-13 · 25", shell cache v24.
- Computer browsers: the full-screen reader shows ‹ and › page buttons at its left and right edges (only with a mouse or trackpad, so iPhone keeps the clean page and its swipes), and the left and right arrow keys turn the page, also after clicking into an EPUB page. Outside full screen the arrows move like the Previous / Next buttons. Keys are ignored while typing in a field or with the flashcard editor open. New file `reader-keys.js`; narration.js only exposes its page turn as `window.lexoraTurnPage`. Verified in Chromium (guide chapters, EPUB pages, buttons and keys). Version "2026-10-13 · 24", shell cache v23.
- EPUBs are stored in Firebase. Signed in with Google, an imported book is saved to the person's own Firestore library and listed on every signed-in device; it downloads the first time it is opened on a device and is kept in IndexedDB for offline reading. Cloud Storage would need the Blaze plan, so each book is split into 900 KB chunks under `users/{uid}/books/{id}/chunks`, which the published `users/{userId}/{document=**}` rule already restricts to its owner (no console changes; it counts against Spark's 1 GiB Firestore storage). Books imported while signed out, and the existing local library, upload at the next sign-in. Removing a cloud book removes it from the cloud and all devices, also when done while signed out. Signed-out use is unchanged. Verified against the Firebase emulator with the published rules: upload on sign-in, listing and download on a second device, import and delete across devices, a deletion made while signed out, and another account getting `permission-denied`. Version "2026-10-13 · 23", shell cache v22.
- Settings › American English voice now shows each voice's quality (Premium, Enhanced, Basic, read from Apple's voice id) and lists Premium and Enhanced voices first. On iPhone the same name (e.g. Samantha) appeared twice with no way to tell the downloaded better voice from the basic one. Version "2026-10-13 · 22", shell cache v21.
- Read & Listen with Kokoro on Roger's iPhone 13 Pro still highlighted the sentence in blue and stayed silent. Likely cause: when Kokoro stalls, the narration falls back to the device voice outside any tap, and iOS only lets `speechSynthesis` speak after a first `speak()` inside a tap, so the fallback was silent too. Play now says a silent utterance during the tap when Kokoro is the narrator (`lexoraSpeech.prime()`), and the Kokoro stall watchdog fires after 30 s without progress (was 40 to 45 s). Version "2026-10-13 · 21", shell cache v20.

## 2026-10-12
- Imported EPUBs on iPhone. Taps, swipes and selections inside the book did nothing on iOS Safari because epub.js shows each chapter in a sandboxed frame that may not run scripts, and WebKit then ignores every event listener in it: word lookup failed and swipes on the text did not turn the page. The book frame now allows scripts, and each chapter is cleaned before it is shown (its own scripts, `on…` handlers, `javascript:` links and embedded frames/objects are removed, plus a `script-src 'none'` policy). A− / A＋ now change the size of EPUB text: the size was set on a plain `body` rule that books sizing their body through a class (calibre's `.calibre`, as in Z-Library books) overrode; it now goes on the book's body with `!important`, without reloading the book, and returns to the same place. The book re-lays out its pages whenever its box changes size (entering full screen, rotation), which stops the next page showing at the right edge, and in full screen the text starts below the book title and menu button. New 🗑 button next to the book list removes an imported EPUB from the device (its reading position too; flashcards stay). Verified in Chromium with a calibre-style EPUB; still to verify on iPhone. Version "2026-10-12 · 20", shell cache v19.
- Kokoro never spoke on Roger's iPhone 13 Pro (iOS 18.7, Safari, version 18): the page was cross-origin isolated (4 cores) and no sentence was ever made, while the iOS 27 simulator worked. The narration now falls back to the device voice when the model download makes no progress for 45 s or a sentence takes over 40 s, instead of staying silent, and a Kokoro failure on an isolated page turns isolation off for good on that device (`lexora-isolation-off`), so the next open uses single-core Kokoro. Kokoro now also prepares the chapter ahead: before the first sentence (and after synthesis falls behind) it waits, showing "Preparing natural voice… N%", until enough audio is ready for the rest of the chapter to be made while it plays (capped at 90 s of audio), using the device's measured synthesis speed. Made sentences are kept in IndexedDB (`lexora-voice`, up to 150 MB, oldest dropped first), so a chapter heard once plays straight away. In a test with a model 1.5× slower than real time, the chapter read with no pauses after the initial wait (one ~6 s wait at the chapter change) and replayed instantly after a reload. Version "2026-10-12 · 19", shell cache v18.
- Kokoro on several cores. Single-threaded wasm synthesis is slower than real time on iPhone, which left 2 to 16 s pauses between sentences. The service worker now sends cross-origin isolation headers (COOP same-origin, COEP require-corp) so the ONNX runtime can use threads (SharedArrayBuffer). Isolation breaks the Google sign-in popup, so it is only switched on once the person is signed in or chose local mode, and takes effect the next time Lexora opens; tapping sign-in on an isolated page reopens Lexora without isolation and shows the sign-in screen asking for a second tap. The flag lives in Cache Storage (`lexora-flags`), which the service worker and the updater keep. jszip and epub.js now load with `crossorigin="anonymous"`. The service worker also registers on `localhost` for testing. The Audio check reports whether the page is isolated and how long the last Kokoro sentence took. Version "2026-10-12 · 18", shell cache v17. Verified in the iOS Simulator: `crossOriginIsolated` true on the second load, Kokoro about 1.5× real time (was about 2.4×), pauses between sentences roughly halved (longest about 10 s after a long sentence, was about 16 s), JSZip and epub.js load, and the sign-in retry reaches Google's account chooser.
- Kokoro (wasm, used on iPhone) now synthesizes in a Web Worker (`kokoro-worker.js`). In the iOS Simulator the single-threaded wasm synthesis froze the page for ~10 s at a time, so the highlight lagged and the next sentence started late; the page stays responsive now. Synthesis itself is still slower than real time on a phone. Version "2026-10-12 · 17", shell cache v16.
- Kokoro on iPhone: it never played in the iOS Simulator because `navigator.gpu` exists without a GPU adapter; the WebGPU attempt failed and left the ONNX runtime broken, so the wasm retry in the same page failed too ("no available backend found"). Kokoro now uses wasm (q8) on iPhone/iPad, tries WebGPU elsewhere only when `requestAdapter()` returns an adapter, and remembers a WebGPU failure so the next load goes straight to wasm. Note: wasm synthesis is slower than real time, so expect a few seconds before the first sentence and short pauses between sentences on a phone. Version "2026-10-12 · 16", shell cache v15.
- Verified in the iOS Simulator (installed web app, version 14): device voice narration advances, the highlight follows and pages and chapters turn. Fixed the status line still saying "Speaking…" after Pause or Exit. Version "2026-10-12 · 15", shell cache v14.
- Read & Listen turns the page again. The guide's page observer fired late for Lexora's own page building and, once narration had marked sentences, took the paginated pages as the new source text, nesting pages inside pages; the narration then could not tell which page a sentence was on. Re-pagination now always starts from the chapter text, and sentences are re-marked if a re-pagination drops them. Version "2026-10-12 · 14", shell cache v13.
- Read & Listen no longer brings the reader toolbar back each time the narration moves on to the next chapter; it only appears when you tap. Version "2026-10-12 · 13", shell cache v12.
- Audio reliability pass. Read & Listen keeps going into the next chapter instead of stopping; a failed Kokoro load falls back to the device voice for that session only (it used to switch the saved choice to the device voice for good); Kokoro shows download progress and prepares two sentences ahead to avoid gaps; a sentence the device voice can't say is skipped instead of ending the narration; a watchdog finishes a sentence when the browser never fires `onend`; Play starts from the page on screen (guide page swipe, EPUB page) instead of the chapter start; Test voice, flashcards and dictionary Listen use the Kokoro voice when it is the chosen narrator and already loaded. Version "2026-10-12 · 12", shell cache v11.
- Flashcards made from a reader selection now use the exact sentence from the book (built-in guide or imported EPUB) as their first example, ahead of the dictionary's example. New cards also keep an optional `source` (book title, exact sentence, location as EPUB CFI or guide chapter, capture time) that survives edits, backups and cloud sync; older cards without it are unchanged. The EPUB selection now hands the whole paragraph to the lookup so long paragraphs don't cut the sentence. Added the "Learning from real experiences" vision to `ROADMAP.md`. Version "2026-10-12 · 11". **Still to verify:** the sentence and location on a real imported EPUB on iPhone.
- Read & Listen: the sentence highlight now follows the voice. Entering the full-screen reader re-paginates the guide by cloning its HTML, so the narration kept highlighting the old, detached sentence nodes (and a copied highlight stayed stuck on the first sentence). Sentences now carry `data-lex-i` and are looked up again on the live page, the narration turns the guide page (and EPUB page) when the next sentence is on it, and tap-to-replay works on the paginated copies. Version "2026-10-12 · 10", shell cache v10.
- Audio still silent on Roger's iPhone after version 7. Added an **Audio check** panel under Settings › Test voice (`audio-check.js`): a Web Audio beep, a bare `speechSynthesis` test, the Lexora voice test, and a copyable report (version, user agent, standalone mode, audio session, voices, speech events and state). Version "2026-10-12 · 8", shell cache v9.
- iPhone audio: all speech (Settings test, flashcards, dictionary Listen, Read & Listen) now goes through a shared `speech.js`. It asks iOS for the media playback session (`navigator.audioSession`, plus a silent `<audio>` primer on older iOS) so the ring/silent switch no longer mutes Lexora, stops calling `speechSynthesis.cancel()` right before the first `speak()` (which can leave Safari silent), leaves the voice unset when none is chosen so iOS uses its own American default instead of the first listed voice (often a novelty voice like Albert), hides the novelty voices from Settings, and falls back to the default voice if a chosen voice stays silent. Version "2026-10-12 · 7", shell cache v8.
- Explore English finds far more idioms: phrase lookups now search the ~165,000 multiword Wiktionary entries already in the full import (new `dictionary/phrases/` shards built by `scripts/build_phrase_index.py`), not just the 3,150-entry phrase subset. Dictionary placeholders now match real text ("catch someone's eye" matches "caught my eye" / "caught the teacher's eye"; also one's, oneself, someone, something), and a phrase can no longer jump across a comma or full stop, so "catches your attention, then pick up" no longer suggests "catch up". Added the starter entry "catch someone's attention" (cridar l'atenció), which Wiktionary lacks. Version "2026-10-12 · 6".
- Navy strip in full screen on the installed iPhone app: iOS keeps the status-bar colour and style captured when the icon was added to the Home Screen (the manifest `theme_color` was navy `#152d42` until today). Added `viewport-fit=cover` with safe-area padding so the page itself paints the status-bar area; **the Home Screen icon must be removed and re-added once** for iOS to pick up the new settings. Version "2026-10-12 · 5".
- Updates arrive right away: the service worker now revalidates app files with GitHub Pages on every load instead of using the browser's 10-minute cache, and "Comprova i actualitza" refreshes every app file, not just index.html. Settings shows the installed version ("2026-10-12 · 4").
- Cloud sync is now visible: the header badge shows "☁ Desat al núvol" (or a warning) and Settings shows the time of the last Firestore save, with a hint for `permission-denied`. Sync verified end-to-end against the Firebase emulator with the published rules (two devices, live updates).
- Immersive reader: page swipes still turn the page when iOS cancels the touch, and the full-screen reader now covers the status-bar area so the navy strip no longer shows. Shell cache bumped to v5.
- Lexora now asks for Google sign-in when it opens instead of only offering it in Settings. "Continue without account" keeps local-only mode for the current session. Google always shows the account chooser; the broken cross-site redirect button was removed (redirect is used automatically only when popups are blocked). Shell cache bumped to v4.
- Fixed EPUB import: the EPUB engine needs JSZip, which was never loaded, so every import failed with "JSZip lib not loaded" (while still showing "EPUB imported"). The success message now only appears when the book actually opens, and the reading percentage is computed instead of staying at 0%.
- Follow-up iPhone fixes: more forgiving page swipe gestures; dictionary radio/definition alignment; iOS pronunciation activation and explicit error state. Physical iPhone audio playback still requires verification.
- Added immersive reader improvements: book title at the top, hidden controls, swipe navigation and three font options.
- Added initial guide pagination to fit pages within the visible reader area and theme-colored iOS status-bar metadata.
- Added a **temporary manual update button** under Settings: prefetches latest index, updates service worker registration, clears Lexora's app-shell cache only, and navigates to a fresh URL. It does **not** clear localStorage, IndexedDB or the EPUB collection.
- Added feature-documentation agent in `.github/agents/lexora-feature-documenter.agent.md` and feature inventory.
- **Still to verify on a physical iPhone:** install update through Home Screen icon, selected vocabulary after guide pagination, EPUB selection/swipe, iOS Safari theme, Firebase data persistence, and reader height at different font sizes.

## 2026-10-11
- Continued Lexora mobile reader, dictionary, flashcard and Firebase troubleshooting. See README for architecture and known issues.
