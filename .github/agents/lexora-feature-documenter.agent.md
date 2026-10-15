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
6. **Branding guardrail (2026-10-15):** `Lexitale` is **only a name under consideration**; keep all `Lexora` identifiers and the existing blue L/RBP favicon unchanged until approved.
7. **Audio guardrail (2026-10-15):** native device voice only; Kokoro was removed. Any premium cloud-voice integration is hypothetical until explicitly requested.
8. Never claim Chrome, Safari, real iPhone, emulator, CI, or a deployment was tested unless it was actually tested.

Repository boundary: work only in `rogerbeltranps-lab/lexora` unless explicitly authorized otherwise.
