# Chirp 3 HD narration (pending cloud and iPhone validation)

The web app prefers `en-US-Chirp3-HD-Charon`; readers can choose Charon, Orus,
Aoede, Kore, Leda or Achernar. Existing Kokoro preferences migrate once to Chirp;
Kokoro remains an explicit opt-in. No configured endpoint, no sign-in, quota
exhaustion, offline synthesis, or API failure falls back to device speech for the
current session. The reason appears in narration status. Single-word/card audio
continues to use the device voice rather than generating additional paid calls.

## Owner setup — do not put secrets in GitHub or send a service-account key

1. Use the existing Firebase project (`lexora-2d1f4`) or a dedicated project with
   matching Firebase Authentication. Enable Cloud Text-to-Speech, Firestore and
   Cloud Functions. Deployment requires billing/Blaze; Functions, Firestore reads,
   writes, storage and networking can also cost money. Review pricing first.
2. Give the function's runtime service account only the permissions required to
   synthesize speech and access Firestore. Use runtime Application Default
   Credentials, never a downloaded JSON key or a TTS API key in GitHub Pages.
3. Copy `functions/.env.example` to `functions/.env.<project-id>` locally and set
   the exact production origin (origin only, no `/lexora` path), allowed Firebase
   UID(s), and deliberate daily/monthly character limits. All limits cover the
   entire proxy, not each user. Missing/zero limits fail closed. Keep
   `TTS_ENABLED=false` until ready for the first paid test.
4. Ensure Firestore rules deny all client access to `ttsPrivate/{document}` and
   `ttsClips/{document}`. Admin SDK access bypasses rules. Existing rules must not
   include a broad authenticated-user allow that also matches these paths; a
   separate deny cannot override an existing allow. Do not replace existing
   flashcard/book rules. Set Firestore TTL on `ttsClips.expiresAt` to remove cached
   audio after 30 days (TTL deletion is asynchronous and may incur charges).
5. Install dependencies in `functions` using `npm ci`. With an authenticated
   Firebase CLI, review then run `firebase deploy --only functions:lexora-tts
   --project lexora-2d1f4`. The HTTP invocation layer must accept browser requests;
   the handler verifies Firebase ID tokens, revocation, UID allowlist and origin.
   Do not deploy hosting or change Pages as part of this step.
6. In Lexora Settings, save the HTTPS function URL ending in `/chirp`. Sign in
   with the allowed account. Enable the function only after agreeing the limits
   and billing settings, then redeploy that function. Tap Read & Listen.

No cloud setup/deployment or paid synthesis has been performed by this PR.
Ask the owner to configure the project, approved UID and usage caps before a live
synthesis test. Credentials stay in Google Cloud; do not paste them into chat.

## Cost controls and privacy

- Every cache miss reserves Unicode characters in a single Firestore transaction
  before calling Google. Daily/monthly windows use UTC. Requests that fail or
  time out keep the reservation because Google may have billed them. A request
  spanning a boundary belongs to the window when it was reserved.
- There are no automatic synthesis retries, chapter prefetches, or background
  paid calls. Each request is at most 1,000 UTF-8 bytes. Long sentences are split
  into Unicode-safe chunks and retain the same sentence highlight.
- Identical text/voice chunks are cached per user on the server for 30 days,
  with a small 20-chunk browser memory cache. Playback rate changes reuse audio.
  Simultaneous cache misses can generate twice, but both reserve quota first.
- Choose low starting caps, e.g. 5,000/day and 20,000/month. Check current Google
  pricing rather than assuming free usage. This is a character cap, not a dollar
  cap. Set Google API request quotas low and configure billing alerts; alerts
  alone do not stop spending. Disable `TTS_ENABLED` to stop synthesis. Infrastructure
  costs and malicious traffic are not bounded by the character cap.
- Cloud narration sends book text to Google and stores synthesized chunks in
  private Firestore documents. Text is not logged by this code. Device voice is
  available for readers who do not want cloud narration.

## Validation before merge/deployment

Run `node --test test/*.test.mjs` and syntax checks. These cover policy limits,
UTC rollover, Unicode chunking, memory reuse, cancelled work and gesture unlock
requirements with mocked audio/network; they do not certify Safari or Google API.

After approved cloud setup, test on real iPhone Safari and installed PWA, plus
Chrome: guide and formatted EPUB, every voice, long sentences, speed, replay,
pause during synthesis/playback, rapid play/pause, page/chapter changes, screen
lock/foreground recovery, offline, signed-out/wrong account, disabled proxy,
quota exhaustion, API errors, audible fallback and repeated cached playback.
Confirm budget reservations and cache hits in Firestore. Interrupted Web Audio
requires a fresh Play tap when Safari suspends the context.

Existing EPUB markup with nested elements still highlights its containing
paragraph; plain paragraphs and the guide highlight sentences. `audio-focus.js`
is on `feature/audio-reading-focus-20261015`, not main. It delegates to the same
controls/status/highlight classes, which this change preserves; combined device
QA is required when that UI branch is integrated.

References: [Chirp formats and voices](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd),
[Google quotas](https://docs.cloud.google.com/text-to-speech/quotas),
[Google pricing](https://cloud.google.com/text-to-speech/pricing).
