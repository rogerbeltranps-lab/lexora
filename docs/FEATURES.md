# Lexora — feature inventory

Last reviewed: 2026-10-12. Status descriptions are based on repository code, not device testing.

| Feature | Status | Notes |
| --- | --- | --- |
| Built-in seven-chapter guide | Implemented | Includes interactive vocabulary selection. |
| EPUB library | Implemented; test on iPhone | Signed in with Google, imported EPUBs are saved to the person's Firestore library (`users/{uid}/books`, split into 900 KB chunks) and appear on every signed-in device; a book downloads the first time it is opened there and stays in IndexedDB for offline reading. Books imported while signed out stay on the device and upload at the next sign-in. 🗑 removes a cloud book from all devices. Reading position is still per device. |
| Word and phrase lookup | Implemented | Built-in glossary and discovery panel; coverage varies. |
| Unified flashcards and spaced repetition | Implemented locally; cloud sync blocked | Local flashcards and review work, but Google/Firebase login is currently **NOT WORKING**, so cross-device synchronization cannot be relied upon. |
| Google/Firebase login | Sign-in screen at launch; **still to verify on devices** | Lexora now opens on a Google sign-in screen (with a "continue without account" option that only lasts for the current browser session). The account chooser is always shown, and the popup falls back to a redirect only when popups are blocked. The separate redirect button was removed because browsers block cross-site redirect sign-in between github.io and firebaseapp.com. Earlier reports: blank popup and `permission-denied`; confirm end-to-end on iPhone and desktop before calling sync operational. |
| Text/audio reading modes | Implemented; test on iPhone | Device TTS and optional Kokoro. |
| Immersive reader | Implemented; test on iPhone | Small running book title, hidden controls, swipe and paginated guide introduced October 12. Check guide paragraph breaks, selection, and EPUB swipe. |
| Reader appearance | Implemented; test on device | Classic, New York-like and Modern fonts, plus themes and text sizes. |
| Temporary manual app updater | Implemented; test on iPhone | Settings → Comprova i actualitza. Refreshes shell and service worker without clearing user data; remove once automatic updates are dependable. |
| External ChatGPT-to-Lexora capture | High-priority planned | Requires authorized integration. |
| Chrome extension and native mobile capture | High-priority planned | Not yet built. |
| Three-level student vocabulary books | Planned | Insecure, Safe, Daring. |

See `README.md` for the product roadmap and `docs/CHANGELOG.md` for changes.
