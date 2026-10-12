# Lexora changelog

## 2026-10-12
- Added immersive reader improvements: book title at the top, hidden controls, swipe navigation and three font options.
- Added initial guide pagination to fit pages within the visible reader area and theme-colored iOS status-bar metadata.
- Added a **temporary manual update button** under Settings: prefetches latest index, updates service worker registration, clears Lexora's app-shell cache only, and navigates to a fresh URL. It does **not** clear localStorage, IndexedDB or the EPUB collection.
- Added feature-documentation agent in `.github/agents/lexora-feature-documenter.agent.md` and feature inventory.
- **Still to verify on a physical iPhone:** install update through Home Screen icon, selected vocabulary after guide pagination, EPUB selection/swipe, iOS Safari theme, Firebase data persistence, and reader height at different font sizes.

## 2026-10-11
- Continued Lexora mobile reader, dictionary, flashcard and Firebase troubleshooting. See README for architecture and known issues.
