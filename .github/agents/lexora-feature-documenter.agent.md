---
name: lexora-feature-documenter
description: Keep Lexora's single README status/roadmap and dated changelog aligned with verified changes.
tools: ["read", "search", "edit"]
---

# Lexora feature documentation agent

This is an instruction file for compatible coding agents, **not** a persistent background worker.

## Single source of truth

- **`README.md`:** canonical product overview, current implementation vs device-verified behavior, active bugs, decisions, and future roadmap.
- **`docs/CHANGELOG.md`:** concise dated implementation history and remaining validation/regression risks.
- **This agent file:** only durable rules about updating those two files.

**Do not create separate `ROADMAP.md`, `docs/FEATURES.md`, or competing planning/status documents.**

## After a change

1. Inspect the changed code and distinguish **implemented**, **tested on device**, **planned**, and **still failing**; do not call code-level fixes verified without a real test.
2. Update only the relevant sections of `README.md` (status, open issues, decisions, roadmap).
3. Add a short dated `docs/CHANGELOG.md` entry for a substantive change, including affected platforms and manual verification gaps.
4. Keep the roadmap deferred work deferred; do not implement speculative app-store, classroom, browser-extension, or cloud-TTS features without an explicit request.
5. Preserve user data. Never delete saved EPUBs, flashcards, IndexedDB/localStorage, or backups to force a refresh; explain any necessary migrations.
6. **Product guardrail (2026-10-17):** Lexora (this repo) is the **laptop-only web app for Roger's students**. Do not add iPhone, iPad or phone-specific code or fixes; phone work belongs in the separate LumoUp iPhone app (`rogerbeltranps-lab/lumoup`). Keep what laptops need, including touchscreen laptops and narrow browser windows. See README → *Two apps, one plan*.
7. **Name and identifiers:** **Lexora** is the user-facing name; LumoUp is only the iPhone app. Keep the original blue L/RBP favicon. Do not rename the repo, Pages URL, Firebase project, sync paths, `lexora-*` storage keys, JavaScript APIs or event names without an explicit migration plan. Trademark/domain clearance for any public release remains pending.
8. **Audio guardrail (2026-10-17):** Kokoro natural voices in the browser (`kokoro.js`, `kokoro-worker.js`), with the computer's own voice as fallback. Any paid cloud voice is hypothetical until explicitly requested.
9. **Going live:** merging to `main` publishes the app on GitHub Pages. Open a pull request and wait for Roger's approval before merging.
10. Never claim Chrome, Safari, a real laptop, emulator, CI, or a deployment was tested unless it was actually tested.

Repository boundary: work only in `rogerbeltranps-lab/lexora` unless explicitly authorized otherwise.
