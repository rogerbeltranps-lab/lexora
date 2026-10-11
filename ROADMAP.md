# Lexora — Development Roadmap

**Read. Discover. Remember.**

Lexora starts as a personal English-learning web app. Once it works reliably, it may expand to students and, eventually, dedicated mobile distribution.

> **Status:** v0.1 MVP implemented on 2026-10-11. Checked tasks reflect features implemented at an initial level, not final production quality.
>
> **Repository boundary:** Development happens in `rogerbeltranps-lab/lexora` only. Changes to other repositories require separate permission.

## Phase 1 — Core Web App

**Goal:** Establish a responsive foundation for personal use.

- [x] Set up an initial responsive single-page app (architecture can be modularized later).
- [ ] Configure Firebase Authentication with Google Sign-In.
- [ ] Set up Cloud Firestore with user-specific security rules.
- [x] Define an initial unified flashcard data model (vocabulary, idioms, phrasal verbs, expressions, grammar, pronunciation).
- [x] Build a searchable local collection and a card editor.
- [x] Implement basic EPUB import and navigation using epub.js (requires network for the dependency).
- [ ] Write and include **one original introductory EPUB** that explains how to use Lexora and doubles as a reader test.
- [x] Save same-device reading position and basic preferences.
- [ ] Verify usability on desktop, iPhone, and Chromebook.

**Milestone:** Sign in, read the Lexora guide, and manually save and review cards.

## Phase 2 — Smart Reading and Language Learning

**Goal:** Turn real reading discoveries into memorable English.

- [ ] Select a word, phrase, or passage in an EPUB.
- [ ] Provide context-aware meanings in clear English and translations into Catalan.
- [ ] Explain literal/figurative meanings, idioms, phrasal verbs, collocations, prepositions, and natural grammar patterns.
- [ ] Expand American English IPA, audio playback, word stress, and pronunciation notes (basic IPA and browser audio available).
- [ ] Include natural usage examples and optional memory tips.
- [ ] Create flashcards directly from selected EPUB passages while preserving source context.
- [x] Introduce initial local spaced-repetition reviews and progress tracking.
- [ ] Specify a user-authorized ChatGPT-to-Lexora workflow for requests such as “Add this to Lexora.”
- [ ] Test explanation quality and make uncertainty visible when interpretations depend on context.

**Milestone:** Highlight an expression, understand it, save it, and review it later.

## Phase 3 — Synchronization and PWA

**Goal:** Use the same Lexora account and learning collection across devices.

- [ ] Sync flashcards, review history, highlights, and reading progress through Firestore.
- [ ] Decide whether EPUB files stay on-device or need optional cloud storage.
- [ ] Handle offline edits and synchronization conflicts safely.
- [ ] Complete PWA manifest, icons, and installable home-screen experience (manifest and shell caching started; icons pending).
- [ ] Enable offline access to permitted books and cached flashcards.
- [ ] Test iPhone Safari, Android Chrome, and desktop browsers.
- [ ] Add data export, import, and recovery options.
- [ ] Audit privacy, access control, and account deletion.

**Milestone:** Install Lexora on a phone and continue reading and reviewing across devices.

## Phase 4 — Optional Mobile App

**Goal:** Consider app-store distribution only if the PWA is insufficient.

- [ ] Evaluate whether a dedicated iOS/Android app offers meaningful benefits.
- [ ] Compare a shared-codebase wrapper (for example, Capacitor) with a native implementation.
- [ ] Prototype device-specific reading, navigation, and offline behavior.
- [ ] Evaluate maintenance and app-store publishing requirements.
- [ ] Decide whether to release to Apple's App Store and/or Google Play.

**Milestone:** A documented go/no-go decision on dedicated mobile apps.

## Phase 5 — Optional Student Edition

**Goal:** Adapt a stable personal product for classroom use.

- [ ] Define teacher and student roles with separate accounts and data.
- [ ] Decide whether students can import their own EPUBs or only teacher-provided books.
- [ ] Add assigned readings and age-appropriate differentiated language support.
- [ ] Build a **unit-end vocabulary book generator** for teachers: collect the vocabulary, phrasal verbs, idioms, and expressions learned during each unit into a student revision book.
- [ ] Generate **three differentiated versions** of each book (Insecure, Safe, Daring), aligned to the same unit vocabulary but adapted in language complexity, scaffolding, examples, and practice activities.
- [ ] Include clear meanings, contextual examples, and retrieval/revision activities so students can remember what they learned after finishing the unit.
- [ ] Allow teacher review and editing before exporting or sharing the books (EPUB first; printable formats may follow).
- [ ] Consider teacher-curated vocabulary sets and optional learning insights.
- [ ] Review child privacy, school policies, consent, retention, and data minimization before onboarding minors.
- [ ] Pilot with a small group, gather feedback, and improve accessibility.

**Milestone:** A privacy-reviewed classroom pilot.

## Guiding Decisions

- **Start personal:** The initial app is for one user, not a school rollout.
- **One starter book:** Begin with an original Lexora guide EPUB, while keeping the architecture open for more books later.
- **One flashcard collection:** Categories are filters, not separate decks.
- **American English first:** Prioritize US pronunciation and natural phrasing, with Catalan translations.
- **Web first, mobile-ready:** Use responsive design from day one; PWA before deciding on native apps.
- **Google + Firebase:** Google Sign-In via Firebase Authentication is the planned sign-in approach; Firestore is the planned sync database.
- **Be explicit about storage:** Distinguish local EPUBs, local caches, and synchronized user data.
- **No silent repository changes:** Discuss significant changes and obtain authorization before implementation.

## Progress Tracking

Use GitHub Markdown checkboxes to track completed work. Mark tasks complete only when implemented and tested. Adjust priorities as requirements become clearer.

Last updated: 2026-10-11.

## Current preview (v0.1)

- [x] Create single-page responsive reader, glossary, flashcards, and practice screens.
- [x] Include a seven-chapter in-app guide for testing selections.
- [x] Add local EPUB import using IndexedDB.
- [x] Add JSON flashcard/review backup and import.
- [ ] Import the original editable guide EPUB directly into the app bundle.
- [ ] Configure GitHub Pages and test the live deployed build.
- [ ] Add Firebase project credentials, Google provider, Firestore rules, and secure data synchronization.
- [ ] Add an AI explanation service and user-authorized ChatGPT card ingestion.
- [ ] QA on real EPUB files, Safari, Chrome, desktop, and phone.


## Dictionary and contextual meaning selection (started 2026-10-11)

- [x] Create small GitHub-hosted JSON dictionary shards fetched on demand.
- [x] Provide an original starter lexicon with 36 expressions and vocabulary entries, several with multiple senses.
- [x] Match many multiword expressions in selected sentences, including common inflected verbs and some separated particles.
- [x] Allow readers to choose a sense, use “Not sure / None of these”, and create a contextual flashcard.
- [ ] Evaluate downloadable Wiktionary/Kaikki and WordNet data and comply with each source's attribution and license terms before redistribution.
- [ ] Expand to broad general vocabulary, idioms, and phrasal verbs through automated data processing.
- [ ] Improve lemmatization, syntactic matching, phrase boundaries, and contextual precision.
- [ ] QA dictionary matches and sense selection across a wide range of EPUBs and sentence forms.
- [ ] Add optional caching and storage limits for offline dictionary access.

This is an **initial implementation**, not a complete dictionary. Cloud login and AI APIs are not required for the first dictionary experience.

### Kaikki import pipeline — 2026-10-11
- [x] Add reproducible Wiktionary JSONL → compact Lexora shard converter.
- [x] Add attribution/licensing notes and a manually triggered GitHub Actions import workflow.
- [x] Configure the reader to use imported shards if present, falling back to the starter dictionary.
- [ ] Run the importer and verify actual Wiktionary-derived dictionary entries in GitHub Pages.
- [ ] Expand beyond the initial Kaikki **phrase** subset to verbs, phrasal verbs, and general vocabulary.

**Important:** The first importer uses Kaikki's English *phrase* export only. That is a practical initial batch, not a complete English dictionary and not a full phrasal-verb database. To run it, open GitHub → Actions → **Import Kaikki phrase dictionary** → **Run workflow**; the repository's Actions permissions must allow workflow commits.

## Read & Listen preview — 2026-10-11

- [x] Add Read only, Read & Listen, and Listen only controls to the shared reader.
- [x] Narrate visible text sentence by sentence with browser speech synthesis.
- [x] Highlight each sentence in the built-in guide while it is spoken.
- [x] On pause, offer current or previous sentence for dictionary analysis.
- [ ] Improve EPUB sentence-level visual highlighting: currently imported EPUBs highlight the containing paragraph rather than the exact sentence.
- [ ] Test sentence navigation and voice playback on iOS Safari and real imported EPUBs.
- [ ] Preserve narration position reliably across EPUB page turns and reloads.
- [ ] Consider Kokoro or another locally downloaded neural voice after the browser-voice version is stable.

