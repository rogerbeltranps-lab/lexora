# Lexora — Development Roadmap

**Read. Discover. Remember.**

Lexora starts as a personal English-learning web app. Once it works reliably, it may expand to students and, eventually, dedicated mobile distribution.

> **Status:** Planning. All tasks below are proposals, not completed features.
>
> **Repository boundary:** Development happens in `rogerbeltranps-lab/lexora` only. Changes to other repositories require separate permission.

## Phase 1 — Core Web App

**Goal:** Establish a responsive foundation for personal use.

- [ ] Set up a maintainable project structure and responsive design system.
- [ ] Configure Firebase Authentication with Google Sign-In.
- [ ] Set up Cloud Firestore with user-specific security rules.
- [ ] Define the unified flashcard data model (vocabulary, idioms, phrasal verbs, expressions, grammar, pronunciation).
- [ ] Build a searchable collection and a card editor.
- [ ] Implement a basic EPUB reader.
- [ ] Write and include **one original introductory EPUB** that explains how to use Lexora and doubles as a reader test.
- [ ] Save reading position and basic preferences.
- [ ] Verify usability on desktop, iPhone, and Chromebook.

**Milestone:** Sign in, read the Lexora guide, and manually save and review cards.

## Phase 2 — Smart Reading and Language Learning

**Goal:** Turn real reading discoveries into memorable English.

- [ ] Select a word, phrase, or passage in an EPUB.
- [ ] Provide context-aware meanings in clear English and translations into Catalan.
- [ ] Explain literal/figurative meanings, idioms, phrasal verbs, collocations, prepositions, and natural grammar patterns.
- [ ] Add American English IPA, audio playback, word stress, and pronunciation notes.
- [ ] Include natural usage examples and optional memory tips.
- [ ] Create flashcards directly from selected EPUB passages while preserving source context.
- [ ] Introduce spaced-repetition reviews and progress tracking.
- [ ] Specify a user-authorized ChatGPT-to-Lexora workflow for requests such as “Add this to Lexora.”
- [ ] Test explanation quality and make uncertainty visible when interpretations depend on context.

**Milestone:** Highlight an expression, understand it, save it, and review it later.

## Phase 3 — Synchronization and PWA

**Goal:** Use the same Lexora account and learning collection across devices.

- [ ] Sync flashcards, review history, highlights, and reading progress through Firestore.
- [ ] Decide whether EPUB files stay on-device or need optional cloud storage.
- [ ] Handle offline edits and synchronization conflicts safely.
- [ ] Add PWA manifest, icons, and installable home-screen experience.
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
