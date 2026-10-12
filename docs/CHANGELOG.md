# Lexora changelog

## 2026-10-12
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
