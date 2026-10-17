# LumoUp — Read. Discover. Remember.

**Read. Discover. Remember.**

LumoUp is a reading-first language-learning web app: discover words and idiomatic expressions in their original context, save useful examples, and remember them with flashcards. The current prototype focuses on English with Catalan translations and American English pronunciation; a future public release could support English, Spanish, and other languages. It begins with an EPUB reader and could eventually capture vocabulary from ChatGPT, websites, videos, and other apps.

**Current stage:** personal web/PWA prototype (v0.1). Some features are implemented in code but have **not** been verified on a physical phone or all browsers. The live app is [rogerbeltranps-lab.github.io/lexora](https://rogerbeltranps-lab.github.io/lexora/). This README is the **single source of truth** for project direction, current status, known issues, and future plans.

> **Brand decision (2026-10-16):** **LumoUp** (capital L and U) is the selected and implemented **user-facing brand**. The browser, web app, welcome guide, sign-in, Settings, PWA manifest and documentation show LumoUp. Keep the original blue rounded L icon and subtle RBP signature. The **technical** GitHub repository and URL, Firebase project, user data, and internal keys still use `lexora` to preserve existing functionality. Earlier candidates LooKitUp and Lexitale are superseded. Trademark and domain availability are **not legally cleared**; revisit before public or commercial launch.

## Brand — 2026-10-16

- **Name:** **LumoUp**. Suggested AmE pronunciation: /ˈluː.moʊˌʌp/. Invented name evoking *lumo* (light) and the uplifting feeling of *light up*.
- **Product line:** **Read. Discover. Remember.**
- **Visual identity:** retain the existing blue L/RBP favicon artwork; no redesign.
- **Languages:** current English/Catalan prototype; English, Spanish and other languages are potential future support, not a functionality claim.
- **Migration protection:** keep `rogerbeltranps-lab/lexora`, GitHub Pages URL, Firebase configuration, sync document IDs, IndexedDB, localStorage, event names and the `lexora-v1` backup format unchanged. These technical strings are *not* user-facing branding and must not be mass-renamed.
- **Name availability:** preliminary searches are not a trademark clearance; investigate before investing in a public launch.

## What the app is for

1. **Read:** import EPUBs and read in a comfortable, paginated interface.
2. **Discover:** select a word, phrasal verb, idiom, or sentence; explore its contextual meaning, American English IPA, Catalan translation, grammar/prepositions, and natural examples.
3. **Remember:** create a flashcard using the **exact sentence from the source** as its first example, then revisit it through spaced repetition.

The learner owns **one unified flashcard deck**; vocabulary, phrasal verbs, idioms, grammar and pronunciation are categories/filters, not separate decks. Prioritize straightforward language, useful explanations, contextual precision, and data portability.

## Current implementation and verification (2026-10-15)

| Area | Status | Important limitation or next check |
| --- | --- | --- |
| In-app guide and EPUB reader | Implemented; device QA pending | Save/restore EPUB text locations (CFI), resume the built-in guide page, and add bookmarks to either. The bookmark icon remains visible while reading; verify on a physical iPhone/PWA. |
| Immersive reader, themes, font sizes, swipe navigation | Implemented; **physical iPhone QA pending** | Choose System, Light or Dark under Settings; color selection covers every app surface and EPUB. Image-only EPUB pages have edge navigation when swipes fail. On-device testing is still needed. |
| Dictionary, contextual lookup and phrase matching | Initial implementation | Coverage is incomplete. The starter lexicon and Kaikki-derived indexes exist; verify matches and sense selection in diverse EPUBs. |
| Unified flashcards, local review, JSON import/export | Implemented locally | Preserve local data. Source sentences and optional source metadata exist on newly captured cards. |
| Google sign-in and Firestore sync | Implemented in code; **real-device reliability unresolved** | Earlier blank OAuth popups and `permission-denied` reports; emulator tests are not proof the browser sign-in flow works for the user. |
| Cloud EPUB library | Implemented in code; emulator tested | Firestore book chunking / multi-device exchange were tested in emulator; verify end to end after real Google sign-in succeeds. Reading position remains per-device. |
| Read & Listen, dictionary and flashcard pronunciation | **Kokoro natural voices on computers; device voice on iPhone/iPad** (Oct 17) | Kokoro runs in the browser (WebGPU, or the CPU), with the same 15 voices as the iPhone app; it falls back to the device voice if the model cannot load. Real-laptop listening test pending. |
| PWA install, service worker, temporary manual update button | Implemented; device QA pending | Settings → **Comprova i actualitza** updates app assets without deleting user books/cards. Remove button only when automatic PWA updates are proven reliable. |

**Verification rule:** “Implemented” means present in code, not necessarily functioning on every device. Do not report a bug as fixed until the relevant user flow is tested.

## Decisions made on October 15, 2026

- **Naming history:** Lexitale and LooKitUp were explored earlier; **LumoUp** became the selected user-facing brand on 2026-10-16. The technical repo retains its original `lexora` name to avoid disruption.
- **Keep the favicon:** retain the **existing rounded blue icon with the stylized L and discreet RBP signature exactly as it is**. No new logo/favicon work is authorized by this decision.
- **Voice update (2026-10-17):** the web app is for laptops, and on computers it speaks with **Kokoro** again (see the changelog, v46); the iPhone app in `rogerbeltranps-lab/lumoup` has native Kokoro. The Oct 15 decision that follows applied to phones:
- **Voice simplification:** use **only the device's native voice** for narration, dictionary audio, and flashcards. **Kokoro has been removed** along with its heavy model-loading / worker / isolation logic. Optional high-quality cloud voices (e.g. Chirp 3 HD) are a **later possibility**, not part of the current implementation or an approved paid dependency.
- **Stability before expansion:** current priority is reliable audio, mobile layout, text selection by long-press/drag, swipe navigation, and sign-in/sync. Oct 15 code changes target these problems; real iPhone 13 Pro and desktop browser testing remains outstanding.
- **No data loss during debugging:** avoid deleting localStorage, IndexedDB, EPUBs, flashcards or backups to force a refresh.

## Active work — stabilize the prototype first

- [ ] **Verify native audio** on a physical iPhone (Safari and installed Home Screen PWA) and on a desktop browser: Settings voice test, Read & Listen, dictionary pronunciation, and flashcards. Inspect Audio check reports if silent; displaying voices does **not** prove playback works.
- [ ] **Verify mobile reader** on real EPUBs: responsive layout without horizontal overflow, book title/header, full-page text, paragraph spacing, selected text remaining draggable, **Explore selection** behavior, one-word lookup, and horizontal swipe without interfering with text selection.
- [ ] **Verify Google sign-in and Firestore sync** on the actual Mac and iPhone; preserve locally stored cards and books throughout. Confirm identity, Firestore permissions, two-device syncing, offline edits, and conflict handling before calling the sync reliable.
- [ ] **Verify sentence-by-sentence soft highlighting** on real imported EPUBs and the built-in guide, including iPhone Safari/PWA, mixed-format paragraphs and paginated pages. Version 34 draws exact sentence rectangles over EPUB content without editing the book DOM; this is implemented in code but **not yet device-verified**. Narration position across page turns/reloads still needs QA.
- [ ] Expand dictionary coverage, lemmatization/idiom matching, accuracy and licensing checks; validate Kaikki import output and mobile performance.
- [ ] Test installed PWA update/reload and offline behavior; remove the **temporary** Settings update button only once unnecessary.
- [ ] Review accessibility, privacy, synchronization rules, error reporting, EPUB robustness, and any security-scanning warnings. Treat publicly embedded Firebase client configuration differently from genuinely private credentials; investigate rather than assume every reported key is a secret.

### Known sign-in incident (first reported 2026-10-11)

Firebase project: `lexora-2d1f4`; Google Authentication enabled; authorized GitHub Pages domain configured; Firestore in `europe-west1`. The OAuth handler `lexora-2d1f4.firebaseapp.com/__/auth/handler` previously showed a blank popup or a quickly closed tab; Firestore reported `permission-denied`. These symptoms **do not establish a single root cause**. Before changing Firestore rules, confirm the active signed-in UID, OAuth handler/network errors, and exact denied path. Do **not** open database access to the public to bypass the problem or erase the local backup. A JSON backup was previously exported; create a fresh one before risky changes.

## Future roadmap — deferred until the core is reliable

### 1. Better contextual learning

- [ ] More complete vocabulary and idiom explanations: clear English, Catalan, literal/figurative meanings, AmE IPA, common prepositions, grammar patterns such as *carry something out*, real examples and a helpful mnemonic.
- [ ] Higher-quality sentence alignment, pronunciation notes, and reliable reading/listening state.
- [ ] Optional cloud HD speech **only after** native audio is working and there is an explicit decision on cost, privacy and browser reliability.

### 2. ⭐ Very high priority: vocabulary capture from anywhere

**Important but deferred; do not begin in the current stabilization phase.**

- [ ] Authorized **ChatGPT → LumoUp** command such as “Add this to LumoUp,” storing the expression, context and source in the **same** collection.
- [ ] Browser extension to select text on webpages and add it from the context menu.
- [ ] iOS/iPadOS and Android sharing workflows (try simple system sharing/Shortcuts before considering native extensions).
- [ ] Secure, common capture/sync pipeline with duplicate detection and user review.
- [ ] Test a first phone-based integration before building broad app-store distribution. Consider a shared codebase such as Capacitor if needed.

### 3. Learn from real experiences

- [x] Save the **exact original book sentence** as the first flashcard example, and optional `source` metadata on new cards.
- [ ] Later capture context from video, webpages, conversations or apps with a location/URL/timestamp where applicable.
- [ ] Gentle opt-in **reminders**, not only quizzes. First proposed notification: “Remember that *look up* means *buscar*? You came across it in this sentence: ‘[exact sentence from the source].’”
- [ ] Show familiar expressions in new contexts; let the learner choose notification frequency. Apple Watch reminders are a possible future extension.

Cards already have an editable `examples` list and a `context` passage. New cards can additionally store the optional `source` object, without breaking old cards or backups:

```json
{
  "source": {
    "kind": "book",
    "title": "Source title",
    "bookId": "local EPUB id or guide",
    "sentence": "Exact original sentence.",
    "location": "EPUB CFI, guide chapter, URL or later timestamp",
    "capturedAt": "ISO-8601 timestamp"
  }
}
```

The `source` fields may eventually expand to multiple contexts; **do not rewrite older flashcards just to support future ideas**.

### 4. Optional mobile and student editions

- [ ] Evaluate dedicated iOS/Android releases **only if the PWA proves insufficient** for sharing, reading, offline use or notifications.
- [ ] Optional student mode with privacy-appropriate accounts, teacher control, accessible differentiated learning and school safeguards.
- [ ] **Unit-end student vocabulary books** collecting language learned during a unit in **three differentiated versions: Insecure, Safe and Daring**. Allow teacher review/editing before EPUB/export. No student rollout until the personal product is stable and privacy requirements are addressed.

## Data, privacy and technical notes

- EPUBs and flashcards are available locally; deleting browser/app storage can erase unsynced data. **Export JSON backups regularly**.
- Intended architecture: responsive GitHub Pages web/PWA; local IndexedDB/other app storage; Google Authentication and per-user Firestore sync. EPUB cloud records are implemented using per-user Firestore chunks; storage/usage limits and real sign-in must be monitored.
- For local development, serve `index.html` from a web server. Live preview: <https://rogerbeltranps-lab.github.io/lexora/>.
- This repository is **`rogerbeltranps-lab/lexora` only**. Never change English Lab or other repositories as part of this app without separate authorization.

## Documentation — keep it simple

There are only **three maintained project documents**:

1. **`README.md` (this file):** the canonical product description, implemented/verified status, current issues, decisions and roadmap. Update it when priorities or real functionality change.
2. **`docs/CHANGELOG.md`:** dated **history of changes** and what still needed checking at the time. Historical entries may describe superseded implementations; they are not current instructions.
3. **`.github/agents/lexora-feature-documenter.agent.md`:** the small instruction file required by compatible coding agents; it points here instead of creating separate feature inventories or roadmaps. It does not run a background process.

The old standalone `ROADMAP.md` and `docs/FEATURES.md` were consolidated into this README on **2026-10-15**. Earlier contents remain available in Git history. Do not recreate duplicate status or planning documents. Log substantive code changes in the changelog and update this README accordingly.

**Last documentation consolidation:** 2026-10-15. Documentation-only reorganization; not evidence of a new app release or successful device test.

## Narration controls — October 15, 2026

- In the immersive reader, **Read & Listen** does not automatically start speaking. Tap **Play** to begin and **Pause** to stop. Pause does not open an obstructing sentence dialog.
- A bottom audio bar offers **back 15s / forward 15s**. The native Web Speech API does **not** expose reliable audio timestamps or seeking, so these buttons skip an *estimated* 15 seconds across sentences, not precisely 15 seconds within the recording.
- Swiping to browse pages while audio is playing keeps speech going and suspends automatic page following. Choose **↗ Narration** to return to the spoken position. Paused page browsing changes the sentence where the next Play starts.
- Highlight the spoken sentence with a soft warm tint (light theme) or muted blue (dark theme). Version 34 uses non-interactive range-based rectangles over EPUB content rather than relying on CSS Highlights or marking whole paragraphs, preserving native selection and the EPUB text. Physical iPhone/desktop verification is still required.
- **Verification still needed:** actual iPhone PWA and Safari playback, desktop Chrome/Safari, book pages with nested markup, selection-and-drag gestures, ±15s jump feel, and transitions between chapters. No claim of live device verification.

## iPhone reading refinements (October 15, 2026)

- **Select an expression:** long-press words in the guide or EPUB, drag across the phrase/sentence, then choose **Explore selection**. The action appears above the audio bar. Native selection handles remain available; a fallback builds a selection range during deliberate long-press drags if WebKit does not produce one.
- **Narration rhythm:** native device speech now speaks several consecutive sentences per utterance (up to three, within one paragraph and ~320 characters) to avoid restarting the TTS engine after every full stop. Sentence highlighting follows speech word boundaries where supported; when the browser omits them, progress highlighting is approximate.
- **15-second controls:** buttons now have round outlines and curved arrows; seeking time is still estimated from words rather than audio timestamps.
- **Validation:** static JavaScript and mock logic tests passed. Physical iPhone PWA/Safari behavior and audio rhythm must be tested before marking these problems as resolved on-device.

## Reader typography and playback controls (October 15, 2026)

- The initial reader font is now **Modern** only if no valid preference is stored. An existing Classic, New York or Modern choice remains as selected by the user. No stored preferences are overwritten on launch.
- The curved rewind button icon is reversed for clearer visual direction; rewind remains an approximately 15-second backward seek, and the forward control is unchanged.
- Updated app version 33 and PWA shell cache v32. Real iPhone/PWA visual verification remains pending.

## Open issues follow-up — 2026-10-15 (v35)

- **User-confirmed on physical iPhone:** spoken-sentence shading remained invisible in an imported EPUB in v34, despite code-level highlighting changes; the top Read / Read & Listen / Pause toolbar did not fade away during playback. Both are real, unresolved user observations, not verified fixes.
- **v35 code changes to test:** place the noninteractive exact-sentence highlight layer inside the EPUB's own iframe (rather than over the parent container), redraw after EPUB page relocation, and restart the top toolbar's 3.2-second inactivity auto-hide timer when playback starts. Bottom ±15s/Play controls remain visible.
- [ ] **Verify on the user's iPhone:** select Read & Listen → Play. The spoken sentence should be visibly but softly shaded, including italic and justified sentences in a real book; the top control bar should disappear after ~3 seconds with no interaction, while the lower audio controls remain accessible. Tap the menu button to reveal the top controls again.
- Preserve EPUB data/CFI positions, selection gestures, device voice, reader theme, and existing favicon. Do not mark either bug resolved until confirmed on the real device.

## Whole-app appearance and audio controls (October 15, 2026)

- The operating system controls light/dark mode across **all LumoUp screens**, not only EPUB content. This includes navigation, flashcards, practice, Settings, forms, sign-in and dictionary/reader overlays. No manual theme toggle is introduced.
- The reader audio controls use bold, mirrored circular-arrow icons for **back 15s** and **forward 15s**, with a matching Play/Pause symbol, based on the supplied reference. These remain estimated 15-second jumps with native speech.
- App version 36, PWA shell v35. Code has been checked, but iPhone Safari/PWA and desktop visual inspection are still pending. No reading data or saved typeface preferences have been modified.

## EPUB navigation, read from word and iPhone reliability (October 16, 2026)

- On image-only EPUB pages (e.g. book covers and publisher pages) the immersive reader shows unobtrusive left/right edge buttons to turn pages even if WebKit does not deliver swipe events. The EPUB frame document root also handles swipe gestures. Confirm with imported books on a physical iPhone.
- In **Read & Listen**, tap a word to choose **Read from here** or **Look up**. The first option starts native speech at the tapped word within the sentence. Long-press and drag for multi-word dictionary selection as before.
- A native speech progress watchdog detects utterances that never finish and stops playback with a message to tap Play again; position is retained at the current sentence. It cannot guarantee recovery from all iOS background-audio restrictions.
- The flashcard editor avoids Safari's zoom-on-focus by using inputs of at least 16px and a keyboard-friendly scrollable modal; pinch zoom remains enabled.
- **Settings → Appearance → App theme:** **Match my device** (default), **Light** or **Dark**. The preference applies to the library, editor, settings, reader, menus and EPUB and persists across sessions.
- Version 37 / PWA shell v36. Changes have passed static and logic checks but must still be verified on a physical iPhone (cover page, keyboard/editor, selected word, voice behavior and theme switching). No clearing of personal EPUBs, flashcards or review history.

## Firestore sync efficiency (October 16, 2026)

- Flashcards are **saved locally first**, then an immediate Firestore synchronization is requested after each successful create/edit. The UI confirms the write when Firebase responds; offline changes remain locally saved and will sync when the connection comes back.
- No-op checks are **read-only**: LumoUp compares canonical card and review content and does not write again merely because Firestore reordered fields/cards or updated its timestamp. Other-device changes still arrive through Firestore's realtime listener.
- Review ratings and bulk imports still use the 650 ms debounce; synchronization calls already in flight are coalesced and preserve cards saved during a pending transaction.
- Version 38 (PWA shell v37). Mocked Firestore tests cover unchanged reads, a newly saved card, and avoiding duplicate writes; the exact behavior on physical iPhone and on multiple active browsers still needs live verification.

## iPhone status bar (October 16, 2026)

- On the installed iPhone PWA, the status bar uses opaque black rather than `black-translucent` to eliminate the faded grey overlay above the LumoUp navy header. Browser/PWA theme color now uses the matching navy header color in each app theme. The immersive reader retains its existing document background and theme handling.
- App v39, shell cache v38. Physical iPhone visual verification is still required: Apple controls this part of the standalone UI, and these native effects can vary across iOS versions.

## Visible rebrand — 2026-10-16 (v40)

- [x] Brand user-visible website text, browser title, PWA manifest, sign-in, Settings, built-in guide, voice test and accessibility descriptions **LumoUp**.
- [x] Keep the original blue L/RBP icon art and all local/cloud data identifiers unchanged.
- [x] Name new backups `lumoup-backup.json` without changing the importable legacy `lexora-v1` JSON format.
- [ ] Verify the interface and web install on a real iPhone and browser. The installed iPhone Home Screen label may be cached; **do not remove/reinstall the existing PWA just to refresh its label until local-only EPUBs and cards are safely backed up or synced**.
- [ ] Before a public launch, check trademarks/domains/stores and plan any requested repo/URL migration separately.
