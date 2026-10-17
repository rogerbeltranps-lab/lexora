# Lexora — Read. Discover. Remember.

**Lexora is the web app for laptops, made for Roger's English students.** Students read EPUBs, discover words and idiomatic expressions in their original context, listen with natural Kokoro voices, and remember what they found with flashcards. The current version focuses on English with Catalan translations and American English pronunciation.

The live app is [rogerbeltranps-lab.github.io/lexora](https://rogerbeltranps-lab.github.io/lexora/). Merging to `main` publishes it (GitHub Pages), so every change goes through a pull request that Roger approves first. This README is the **single source of truth** for project direction, current status, known issues and future plans.

## Two apps, one plan (decided 2026-10-17)

| | **Lexora** (this repository) | **LumoUp** (`rogerbeltranps-lab/lumoup`) |
| --- | --- | --- |
| What | Web app | Native iPhone app |
| Who | Roger's **students** (Roger will link it from his English Lab) | **Roger** himself, and possibly a public App Store release later |
| Devices | **Laptops and desktop computers only** | iPhone |
| Voices | Kokoro running in the browser (WebGPU or CPU), 15 voices, device voice as fallback | Kokoro running natively on the phone |

- **Build Lexora for laptops.** Do not add iPhone, iPad or phone-specific code or fixes here; phone work belongs in the LumoUp app. Keep what laptops need: mouse, keyboard, touchscreen laptops (swipes and touch selection), narrow browser windows, and desktop Chrome, Edge, Safari and Firefox.
- **Names.** Lexora is the web app's user-facing name again (it was LumoUp from 2026-10-16 to 2026-10-17). LumoUp is only the iPhone app. Linking Lexora to the English Lab is Roger's decision and is not built yet.
- **Shared code.** The LumoUp app started from a copy of this web app (its `LumoUpWeb/` folder). The two now evolve separately; port a fix across only when it applies to both.
- **Technical identifiers** keep the `lexora` name: repository, Pages URL, Firebase project, sync document IDs, IndexedDB, `lexora-*` localStorage keys, event names and the `lexora-v1` backup format. Keep the original blue rounded L icon with the subtle RBP signature.

## Class library — Roger chooses the books (2026-10-17)

Students **cannot import EPUBs**. They read the books Roger puts in the class library, plus the built-in Lexora guide.

**To add a book:** on GitHub, open the repository's `library` folder → **Add file → Upload files** → drop the `.epub` files → **Commit changes**. About a minute later the *Update class library list* action rebuilds `library/books.json` (title from the EPUB's metadata) and the book appears in every student's book list. **To remove a book:** delete its file in the same folder. Replacing a file with a new version makes laptops download the new copy.

- Each laptop downloads a book the first time it is opened and keeps it for offline reading. Books are not uploaded to Firebase, so they cost nothing there.
- **The repository is public:** anyone who knows a book's address can download it. Only add books you are allowed to share with your class (your own, public domain, or licensed for it). A private class library would need Firebase Storage with sign-in, which is not built.
- Books Roger imported himself before this change still open on his laptop under *My books*.

## What the app is for

1. **Read:** import EPUBs and read in a comfortable, paginated interface.
2. **Discover:** select a word, phrasal verb, idiom, or sentence; explore its contextual meaning, American English IPA, Catalan translation, grammar/prepositions, and natural examples.
3. **Remember:** create a flashcard using the **exact sentence from the source** as its first example, then revisit it through spaced repetition.

The learner owns **one unified flashcard deck**; vocabulary, phrasal verbs, idioms, grammar and pronunciation are categories/filters, not separate decks. Prioritize straightforward language, useful explanations, contextual precision, and data portability.

## Current implementation and verification (2026-10-17)

| Area | Status | Important limitation or next check |
| --- | --- | --- |
| In-app guide, class library and EPUB reader | Implemented | Students read Roger's class library (no EPUB import). Saves and restores the reading position, with bookmarks. Check on a laptop with real EPUBs. |
| Immersive reader, themes, font sizes, page turning | Implemented | Arrow keys, page buttons, and swipes on touchscreen laptops. System, Light or Dark theme in Settings. |
| Dictionary, contextual lookup and phrase matching | Initial implementation | Coverage is incomplete. The starter lexicon and Kaikki-derived indexes exist; verify matches and sense selection in diverse EPUBs. |
| Unified flashcards, local review, JSON import/export | Implemented locally | Preserve local data. Source sentences and optional source metadata exist on newly captured cards. |
| Google sign-in and Firestore sync | Implemented in code; **real-browser reliability unresolved** | Earlier blank OAuth popups and `permission-denied` reports; emulator tests are not proof the browser sign-in flow works. |
| Cloud EPUB library (personal) | Implemented in code; no longer used for new books | Without EPUB import, only books Roger imported earlier sync this way. The class library replaces it. |
| Read & Listen, dictionary and flashcard pronunciation | **Kokoro natural voices** (2026-10-17) | Kokoro runs in the browser (WebGPU, or the CPU), with the same 15 voices as the LumoUp app; it falls back to the computer's voice if the model cannot load. Real-laptop listening test pending. |
| Install as an app, service worker, temporary manual update button | Implemented | Settings → **Comprova i actualitza** updates app files without deleting books or cards. Remove the button once automatic updates are proven reliable. |

**Verification rule:** “Implemented” means present in code, not necessarily working in every browser. Do not report a bug as fixed until the relevant flow is tested.

## Decisions

- **2026-10-17:** Lexora is the laptop web app for students, with Kokoro voices; LumoUp is the iPhone app (see *Two apps, one plan*).
- **2026-10-17:** students cannot import EPUBs; they read the class library Roger fills.
- **No data loss during debugging:** never delete localStorage, IndexedDB, EPUBs, flashcards or backups to force a refresh.
- **Stability before expansion:** reliable audio, reading, text selection and sign-in/sync come before new features.

## Active work

- [ ] **Listen to Kokoro on a real laptop** (Chrome and Safari): first model download, Read & Listen, dictionary and flashcards, and the device-voice fallback.
- [ ] **Verify the reader on a laptop** with real EPUBs: layout, sentence highlighting and page following during narration, text selection, **Explore selection**, one-word lookup, bookmarks and reopening at the right page.
- [ ] **Verify Google sign-in and Firestore sync** on real browsers; preserve local cards and books throughout.
- [ ] **Prepare for students:** privacy-appropriate accounts and data, and how Roger links Lexora from the English Lab.
- [ ] Expand dictionary coverage, lemmatization/idiom matching, accuracy and licensing checks.
- [ ] Remove the temporary Settings update button once automatic updates are reliable.
- [ ] Review accessibility, privacy, synchronization rules, error reporting, EPUB robustness and any security-scanning warnings. Treat publicly embedded Firebase client configuration differently from genuinely private credentials.

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
- [ ] Secure, common capture/sync pipeline with duplicate detection and user review.
- Phone capture (iOS sharing, Shortcuts) belongs to the LumoUp iPhone app, not to Lexora.

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

### 4. Student edition

- [ ] Student mode with privacy-appropriate accounts, teacher control, accessible differentiated learning and school safeguards.
- [ ] **Unit-end student vocabulary books** collecting language learned during a unit in **three differentiated versions: Insecure, Safe and Daring**. Allow teacher review/editing before EPUB/export.
- Phone and App Store editions are the LumoUp app's job, not Lexora's.

## Data, privacy and technical notes

- EPUBs and flashcards are available locally; deleting browser/app storage can erase unsynced data. **Export JSON backups regularly**.
- Architecture: GitHub Pages web app for laptops (installable as a browser app); local IndexedDB/other app storage; Google Authentication and per-user Firestore sync. EPUB cloud records are implemented using per-user Firestore chunks; storage/usage limits and real sign-in must be monitored.
- For local development, serve `index.html` from a web server. Live preview: <https://rogerbeltranps-lab.github.io/lexora/>.
- This repository is **`rogerbeltranps-lab/lexora` only**. Never change English Lab or other repositories as part of this app without separate authorization.

## Documentation — keep it simple

There are only **three maintained project documents**:

1. **`README.md` (this file):** the canonical product description, implemented/verified status, current issues, decisions and roadmap. Update it when priorities or real functionality change.
2. **`docs/CHANGELOG.md`:** dated **history of changes** and what still needed checking at the time. Historical entries may describe superseded implementations; they are not current instructions.
3. **`.github/agents/lexora-feature-documenter.agent.md`:** the small instruction file required by compatible coding agents; it points here instead of creating separate feature inventories or roadmaps. It does not run a background process.

The old standalone `ROADMAP.md` and `docs/FEATURES.md` were consolidated into this README on **2026-10-15**. The dated iPhone-era notes (2026-10-15 and 16) that used to follow this section were removed on 2026-10-17; the same history is in `docs/CHANGELOG.md`. Earlier contents remain available in Git history. Do not recreate duplicate status or planning documents. Log substantive code changes in the changelog and update this README accordingly.

**Last documentation consolidation:** 2026-10-17 (laptop-only Lexora, LumoUp for iPhone).
