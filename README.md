# Lexora

**Read. Discover. Remember.**

Lexora is a planned web application for learning natural American English through reading, exploration, and long-term vocabulary practice. It brings an EPUB reader, contextual language explanations, pronunciation support, and a unified flashcard collection into one learning environment.

> **Project status:** v0.1 personal MVP. The reader, an in-app guide, local EPUB imports, built-in glossary, personal flashcards, review scheduling, and local backups are implemented. Other features described below remain planned.

## The idea

Language learning is more effective when words and expressions are encountered in meaningful contexts. Lexora is designed to turn questions that come up while reading—or during everyday conversations with an AI assistant—into reusable learning material.

The core journey is simple:

1. **Read** — Import an EPUB book and enjoy it in a comfortable, distraction-free reader.
2. **Discover** — Select an unfamiliar word, phrasal verb, idiom, or sentence to understand what it means *in context*, how it's used, and how it sounds in American English.
3. **Remember** — Save useful discoveries as flashcards in one personal collection and revisit them through spaced repetition.

## Planned features

### 📖 EPUB reader
- Import EPUB books and browse a personal reading library.
- Read with adjustable text size, theme, and layout.
- Select words and passages without leaving the reading experience.
- Keep useful context alongside vocabulary discoveries.
- Save reading progress and return to where you left off.

### 💡 Context-aware English explanations
- Explain vocabulary, idioms, phrasal verbs, collocations, and natural ways of saying things.
- Distinguish literal and figurative meanings.
- Provide simple English definitions and Catalan translations.
- Highlight common prepositions and natural grammar patterns, such as **look after somebody** or **carry something out**.
- Give practical American English examples, with the original reading context whenever available.
- Offer memory tips that make expressions easier to remember.

### 🔊 American English pronunciation
- Show American English IPA transcriptions.
- Play audio pronunciations.
- Highlight word stress, connected speech, and commonly confusing sounds.
- Save pronunciation questions as flashcards too.

### 🗂️ One unified flashcard deck
All learning items belong to **one collection**, rather than separate decks for vocabulary, idioms, phrasal verbs, or pronunciation.

A flashcard may include:
- The English word or expression
- Category and American English IPA
- A clear English meaning and Catalan translation
- Idiomatic structure and required prepositions, where relevant
- Natural examples and the sentence where it was encountered
- A mnemonic or usage note
- Review history and spaced-repetition scheduling

Users should be able to search, filter, edit, import, export, and review their cards.

### 💬 ChatGPT-assisted card creation
An important goal is to make adding cards feel effortless. When a learner asks ChatGPT about an English expression, they should be able to say:

> **“Add this to the Lexora flashcards.”**

With an authorized integration, the assistant would format the card and add it to the shared collection without manual copying. This workflow must preserve the user's control over repository changes and data. **It is a planned integration, not an automatic capability of the current repository.**

## Design principles

- **Context first:** Learn how language is actually used, not just isolated definitions.
- **American English focus:** Prioritize natural US usage and pronunciation.
- **English + Catalan:** Use English for explanations and Catalan as a translation aid.
- **One place for everything:** Reading discoveries and conversational questions feed the same collection.
- **Simple but powerful:** Keep the interface clean and practical on desktop, tablet, and mobile.
- **User-controlled data:** Make the vocabulary collection portable, and be clear about what is stored locally versus synchronized.

## Development roadmap

- [ ] Define the application structure and data model.
- [ ] Build the responsive application shell and EPUB reader.
- [ ] Add text selection and context-aware explanations.
- [ ] Build the unified flashcard collection and editor.
- [ ] Add spaced-repetition review and progress tracking.
- [ ] Add American English pronunciation support.
- [ ] Implement import/export and a cross-device synchronization strategy.
- [ ] Connect an explicitly authorized ChatGPT-to-Lexora flashcard workflow.
- [ ] Test accessibility, mobile usability, and EPUB compatibility.

## Repository

This repository is the future home of Lexora. The initial prototype previously made under the English Lab project is **not** automatically part of this repository; migration and future code changes will be handled separately with permission.

---

*Lexora — Read. Discover. Remember.*


## Try the v0.1 preview

The app is at [Lexora](https://rogerbeltranps-lab.github.io/lexora/) **once GitHub Pages is enabled** for the main branch (root directory). Open `index.html` through a local web server during development.

### Available now

- Seven-chapter **in-app** Lexora guide (the original EPUB can be imported separately).
- Import EPUB books, navigate pages, and restore reading location on the same device. Signed in with Google, books are saved to your Firestore library and available on every device.
- Select words or expressions in the guide or an EPUB and see built-in glossary entries.
- Add/edit one unified collection of flashcards with AmE IPA, Catalan translations, examples, structures and source context.
- Text-to-speech via your browser, spaced-repetition review, and JSON backup/import.
- Responsive desktop/mobile interface and basic web-app manifest/offline app shell.

### Not connected yet

- Reliable cross-device sync: Google Sign-In and Firestore sync are implemented (sign-in screen at launch) but not yet verified end-to-end. EPUBs sync through Firestore when signed in.
- Automated AI-generated explanations and ChatGPT-to-Lexora additions.
- Full offline EPUB engine dependency, student accounts and App Store release.

**Privacy note:** This version saves content locally in the current browser. Browser data removal may delete your flashcards and books; export backups regularly. Signed out, EPUBs stay on this device until the next sign-in. The built-in glossary is limited; unfamiliar selections open a manual card editor, not a live AI explanation.


## Informe d'incidència: Google Sign-In i sincronització Firebase — 11/10/2026

**Estat: PENDENT DE RESOLDRE.** No es pot confirmar l'inici de sessió ni la sincronització entre dispositius. Aquesta secció documenta les observacions i les hipòtesis; no dona per diagnosticada una causa encara no verificada.

### Entorn i configuració confirmada

- Aplicació: https://rogerbeltranps-lab.github.io/lexora/ (GitHub Pages; també oberta com a finestra d'aplicació de Chrome a macOS).
- Projecte Firebase: `lexora-2d1f4`, pla Spark.
- Firebase Authentication: proveïdor **Google — Enabled**.
- Authorized domains: `rogerbeltranps-lab.github.io` afegit.
- Cloud Firestore: base de dades `(default)`, edició Standard, ubicació `europe-west1 (Belgium)`, creada inicialment en mode producció.
- Regles publicades (captura verificada a la consola):
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;
      }
    }
  }
  ```
- El codi de sincronització escriu a `users/{uid}/state/lexora`, una ruta que **hauria** d'estar permesa per aquestes regles si l'usuari realment està autenticat amb el `uid` corresponent.

### Símptomes observats

1. A `Settings → Compte Lexora`, apareix el botó **Inicia sessió amb Google**. No hi ha confirmació d'una sessió activa.
2. Amb `signInWithPopup`, s'obre una finestra d'autenticació que queda **completament en blanc**; a la captura es veu l'adreça `https://lexora-2d1f4.firebaseapp.com/__/auth/handler`. La finestra es tanca o no permet escollir el compte.
3. L'opció alternativa amb `signInWithRedirect` tampoc ha permès completar l'accés en les proves explicades; s'ha descrit que s'obre i es tanca una pestanya.
4. Lexora ha mostrat repetidament `permission-denied` en la sincronització de Firestore. És un **error d'accés a dades**, i **no prova per si sol** que l'autenticació Google hagi funcionat o fallat.
5. En tornar a carregar, la interfície pot mostrar «Les targetes es desen en aquest dispositiu. Inicia sessió per sincronitzar», cosa coherent amb una sessió no establerta.
6. Els problemes s'han observat també en **Chrome normal al Mac**, no només a la finestra instal·lada de l'aplicació. Encara no hi ha prova concloent al navegador de l'iPhone per a Firebase.
7. Les flashcards i els repassos continuen disponibles localment. S'ha fet **una exportació JSON de seguretat** abans de començar la integració; no s'ha confirmat cap sincronització completa.

### Codi actual relacionat

- `firebase-sync.js`: inicialitza SDK Firebase v13, Google Authentication (`signInWithPopup` i `signInWithRedirect`), Firestore i sincronització per transacció amb fusió de dades.
- `index.html`: exposa els botons de connexió i el pont `window.lexoraSyncBridge` cap a les targetes locals.
- S'han afegit estats separats per **Google** i **Firestore** i errors d'autenticació visibles per poder diagnosticar el següent intent.
- `sw.js`: service worker amb memòria cau del shell; pot complicar la verificació de versions noves. No eliminar dades locals per forçar una actualització.

### Hipòtesis a comprovar (no verificades)

- El handler OAuth a `firebaseapp.com/__/auth/handler` podria no carregar-se correctament per restriccions del navegador, bloquejadors de contingut, cookies o polítiques d'emmagatzematge entre orígens.
- La configuració d'Authentication/OAuth o la implementació de la redirecció en GitHub Pages (origen diferent de `authDomain`) pot requerir un ajust.
- L'error `permission-denied` podria reflectir una sessió no vàlida o una discrepància de permisos/ruta. S'ha de confirmar amb el codi d'error i el `auth.currentUser?.uid`, sense publicar dades personals.
- Pot haver-hi fallades addicionals de sincronització després d'autenticar-se; encara no s'ha verificat el flux de fusió de dades de dos dispositius.

### Pla de represa

1. Obrir Lexora en una pestanya normal de Chrome actualitzat i comprovar la línia **Google:** per veure si diu «sessió no iniciada» o mostra un error `auth/...`; recollir el missatge complet de consola/red sense exposar tokens.
2. Comprovar si `https://lexora-2d1f4.firebaseapp.com/__/auth/handler` carrega en el flux d'OAuth i si hi ha errors de xarxa/JavaScript. Fer-ho abans de modificar les regles.
3. Verificar a la consola Firebase els dominis autoritzats, el proveïdor Google i la configuració del client OAuth. Si el problema és el domini d'auth en hosting extern, aplicar una solució compatible amb els requisits actuals de Firebase per a redireccions.
4. Quan hi hagi sessió real (`auth.currentUser`), comprovar la ruta `users/{uid}/state/lexora` amb el simulador de regles i diagnosticar el `permission-denied` sense obrir accés públic.
5. Provar la primera sincronització amb el Mac, després amb l'iPhone: conservar targetes locals, comparar recompte/contingut/repassos i provar reconnexió, recàrrega i exportació JSON.
6. Revisar conflictes entre dispositius i la política de fusió abans d'anunciar que la sincronització funciona.

**Precaucions:** conservar `lexora-backup.json`; no esborrar localStorage/IndexedDB/cau de Safari fins que les dades estiguin recuperables i s'hagi comprovat la sincronització. No relaxar Firestore a `allow read, write: if true` ni activar Blaze per resoldre aquest problema.

---

## Development documentation (October 2026)

- [Current feature inventory](docs/FEATURES.md) — implementation and testing status.
- [Change history](docs/CHANGELOG.md) — shipped changes and manual verification gaps.
- [Feature documentation agent](.github/agents/lexora-feature-documenter.agent.md) — instructions for compatible coding agents. Invoke it when developing; it is not an always-running daemon.
- **Temporary update button:** Settings → **Comprova i actualitza**. It refreshes app files and service worker cache, without deleting IndexedDB or locally saved vocabulary. Remove when automatic updates have been validated on installed iPhone PWAs.

## Narration controls — October 15, 2026

- In the immersive reader, **Read & Listen** does not automatically start speaking. Tap **Play** to begin and **Pause** to stop. Pause does not open an obstructing sentence dialog.
- A bottom audio bar offers **back 15s / forward 15s**. The native Web Speech API does **not** expose reliable audio timestamps or seeking, so these buttons skip an *estimated* 15 seconds across sentences, not precisely 15 seconds within the recording.
- Swiping to browse pages while audio is playing keeps speech going and suspends automatic page following. Choose **↗ Narration** to return to the spoken position. Paused page browsing changes the sentence where the next Play starts.
- Highlight the spoken sentence with eye-friendly warm cream (light/sepia) or muted blue-gray (dark). In formatted EPUB paragraphs, CSS Highlights ranges avoid altering the book text, but a browser without this API may highlight a whole paragraph.
- **Verification still needed:** actual iPhone PWA and Safari playback, desktop Chrome/Safari, book pages with nested markup, selection-and-drag gestures, ±15s jump feel, and transitions between chapters. No claim of live device verification.
