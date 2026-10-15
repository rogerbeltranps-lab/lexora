# Lexora

**Read. Discover. Remember.**

Lexora is a personal web app for learning natural American English from reading and real-life encounters: discover a word or expression, understand it in context, save its original sentence, and remember it in one flashcard collection. It begins with an EPUB reader and can eventually accept vocabulary from ChatGPT, websites, videos, and other apps.

**Current stage:** personal web/PWA prototype (v0.1). Some features are implemented in code but have **not** been verified on a physical phone or all browsers. The live app is [rogerbeltranps-lab.github.io/lexora](https://rogerbeltranps-lab.github.io/lexora/). This README is the **single source of truth** for project direction, current status, known issues, and future plans.

> **Naming decision (2026-10-15):** **Lexitale** is the preferred *candidate* for a future rebrand, **not an approved rename**. Keep the application name, repository, URLs, code identifiers, manifest, and existing favicon **unchanged** until an explicit decision to switch.

## What the app is for

1. **Read:** import EPUBs and read in a comfortable, paginated interface.
2. **Discover:** select a word, phrasal verb, idiom, or sentence; explore its contextual meaning, American English IPA, Catalan translation, grammar/prepositions, and natural examples.
3. **Remember:** create a flashcard using the **exact sentence from the source** as its first example, then revisit it through spaced repetition.

The learner owns **one unified flashcard deck**; vocabulary, phrasal verbs, idioms, grammar and pronunciation are categories/filters, not separate decks. Prioritize straightforward language, useful explanations, contextual precision, and data portability.

## Current implementation and verification (2026-10-15)

| Area | Status | Important limitation or next check |
| --- | --- | --- |
| In-app guide and EPUB reader | Implemented | Imported EPUB behavior, pagination, and reading position still need broader real-device testing. |
| Immersive reader, themes, font sizes, swipe navigation | Implemented; **physical iPhone QA pending** | Device light/dark theme now extends to the entire app, including settings, flashcards, login and dictionary overlays. Swipe and selection behavior still needs device QA. |
| Dictionary, contextual lookup and phrase matching | Initial implementation | Coverage is incomplete. The starter lexicon and Kaikki-derived indexes exist; verify matches and sense selection in diverse EPUBs. |
| Unified flashcards, local review, JSON import/export | Implemented locally | Preserve local data. Source sentences and optional source metadata exist on newly captured cards. |
| Google sign-in and Firestore sync | Implemented in code; **real-device reliability unresolved** | Earlier blank OAuth popups and `permission-denied` reports; emulator tests are not proof the browser sign-in flow works for the user. |
| Cloud EPUB library | Implemented in code; emulator tested | Firestore book chunking / multi-device exchange were tested in emulator; verify end to end after real Google sign-in succeeds. Reading position remains per-device. |
| Read & Listen, dictionary and flashcard pronunciation | **Native device voice only** (Oct 15) | Read & Listen starts paused. Version 32 groups up to three sentences per utterance to reduce sentence-gap delays; rounded ±15s controls and soft highlighting remain. On-device playback/selection verification pending. |
| PWA install, service worker, temporary manual update button | Implemented; device QA pending | Settings → **Comprova i actualitza** updates app assets without deleting user books/cards. Remove button only when automatic PWA updates are proven reliable. |

**Verification rule:** “Implemented” means present in code, not necessarily functioning on every device. Do not report a bug as fixed until the relevant user flow is tested.

## Decisions made on October 15, 2026

- **Branding exploration, no rename:** **Lexitale** (lexicon + tale) is the favored candidate. Potential brand line: **“Every word has a story.”** It remains a proposal, not finalized branding. **Lexora** remains the product name everywhere for now.
- **Keep the favicon:** retain the **existing rounded blue icon with the stylized L and discreet RBP signature exactly as it is**. No new logo/favicon work is authorized by this decision.
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

- [ ] Authorized **ChatGPT → Lexora** command such as “Add this to Lexora,” storing the expression, context and source in the **same** collection.
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

- The operating system controls light/dark mode across **all Lexora screens**, not only EPUB content. This includes navigation, flashcards, practice, Settings, forms, sign-in and dictionary/reader overlays. No manual theme toggle is introduced.
- The reader audio controls use bold, mirrored circular-arrow icons for **back 15s** and **forward 15s**, with a matching Play/Pause symbol, based on the supplied reference. These remain estimated 15-second jumps with native speech.
- App version 36, PWA shell v35. Code has been checked, but iPhone Safari/PWA and desktop visual inspection are still pending. No reading data or saved typeface preferences have been modified.
