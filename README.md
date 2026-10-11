# Lexora

**Read. Discover. Remember.**

Lexora is a planned web application for learning natural American English through reading, exploration, and long-term vocabulary practice. It brings an EPUB reader, contextual language explanations, pronunciation support, and a unified flashcard collection into one learning environment.

> **Project status:** Early planning. The features below describe the intended product, not a completed implementation.

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
