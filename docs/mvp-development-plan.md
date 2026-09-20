# MVP development plan

Date: 20 September 2026. Status: proposed implementation baseline; application development has not started.

This plan turns the [program and implementation plan](program-and-implementation-plan.md) into a development backlog. The source document defines the educational requirements; the stack details, delivery boundaries, and engineering estimates below are implementation proposals. Its embedded LLM prompts are reference material, not instructions to execute as part of this planning task.

## 1. Release objective and scope

Build a Russian-language, installable web app for a child aged 4–6, initially used by Lida with a parent on an iPad. A child can explore every letter, hear reviewed recordings, play a short activity, and trace or copy a capital letter. A parent can inspect separate skill observations and back up progress.

The MVP is the source document's **compact alphabet release**, not the entire educational package. All 33 letters must be available at launch. The six-letter slice is an internal development milestone, not a public MVP.

| Area | MVP delivery | Deferred expansion |
|---|---|---|
| Alphabet | All 33 uppercase/lowercase pairs; one word and illustration each; separate name and contextual sound/explanation | Second words, larger vocabulary and alternate illustrations |
| Guided learning | Eight adapted introductory sessions covering А, У, М, О, С, Н, drawing from source blocks 1–3; repeat mode afterward | Complete source block activities, remaining letters in guided lessons and full 18-block progression |
| Games | Listen and choose a picture; choose a letter from a reviewed sound/context prompt; match uppercase/lowercase | First-sound analysis, independent reading/word assembly, story games |
| Writing | 33 reviewed capital-letter models; demonstration, tracing, copying; optional skip | Memory writing, printable sheets, sophisticated scoring |
| Sessions | Approximately 5–8 minutes, adjustable shorter; at most one new letter per session; pause/exit/skip | More advanced personalization |
| Progress | One local profile; separate evidence per skill; parent observations; review scheduling | Multiple profiles, cloud sync, cross-device accounts |
| Delivery | Safari and Home Screen app on the target iPad; both orientations; complete offline package; export/import | Native App Store app, Android-specific optimization |
| Content | 33 illustrations, 33 trace models, approximately 115 reviewed audio clips | Full 72-word vocabulary, reading bank, 293-clip package, stories and character |

The eight initial sessions adapt the source concepts to the three MVP game templates; author their exact activities during milestone M0. Source block 1 introduces А У М, block 2 О С, and block 3 Н Ы. The MVP borrows Н from block 3 and defers Ы in guided sessions, while keeping its card available. It does not claim to implement these complete blocks or their reading tasks. Activities for letters outside the guided slice remain available through their cards when reviewed, but the app does not imply that it teaches all 18 blocks. Label guided content clearly for parents. Introduce vocabulary before evaluating comprehension; never infer independent reading from a correct picture choice.

No runtime LLM, microphone recording, speech grading, payment, ads, login, or backend is needed for this release. A web app fits the existing source architecture and allows static deployment with local progress.

## 2. Technical stack

| Layer | Decision | Purpose and boundary |
|---|---|---|
| UI | React + TypeScript with strict checking | Typed content-driven screens and reusable activities; same foundation as source §12 |
| Build | Vite; npm with committed lockfile | Small static application; pin a compatible supported Node LTS in `.nvmrc` and CI during scaffolding |
| Navigation | React Router with hash routing | Refreshable routes on static project hosting without server rewrite rules |
| Styling | CSS Modules, CSS custom properties, responsive Grid/Flexbox | Consistent spacing, typography and large touch targets without a component framework |
| State | React state/context and a reducer for session transitions | Explicit session states; keep persistent data outside components; no global store initially |
| Content | Versioned JSON, Zod schemas, build-time validation | Runtime-checked imports and content files; stable IDs and referential integrity |
| Progress | IndexedDB through Dexie | Transactions, indexed event records and explicit schema migrations |
| Writing | SVG reference paths + Canvas ink + Pointer Events | Separate letter geometry from child strokes; finger and pen input |
| Audio | One controller wrapping HTMLAudioElement | Reviewed MP3 files; stop previous playback and handle rejected playback requests |
| Offline | `vite-plugin-pwa`, Workbox, custom service worker using `injectManifest` | Precache app shell; explicitly stage and validate the versioned learning package |
| Checks | Vitest, React Testing Library, Playwright Chromium/WebKit, ESLint, TypeScript | Domain logic, key UI behavior, browser flows and static checks |
| CI | GitHub Actions | Reproducible installation, content validation, tests and production build |
| Hosting | Proposed GitHub Pages via Actions, over HTTPS | Matches the existing repository and static output; confirm repository/plan eligibility before enabling |
| Asset preparation | Development-only scripts and chosen image/TTS tools | Generate files before release; human review is mandatory; credentials stay outside client code |

Select mutually compatible stable dependency versions at M0 and commit exact resolutions. Do not freeze guessed versions in this plan. No SSR, server database, API service, Redux, or general-purpose game engine is required by the MVP scope.

React documents Vite as a supported build-tool route for an application built from scratch, while noting that routing and data concerns then belong to the application ([React documentation](https://react.dev/learn/build-a-react-app-from-scratch), [Vite guide](https://vite.dev/guide/)). Dexie wraps IndexedDB ([Dexie documentation](https://dexie.org/docs/)). These are engineering choices, not educational requirements.

## 3. Screens and user journeys

1. **Home:** one prominent “Поиграем” action, alphabet access, and separate parent entry. The first tap also provides the audio activation opportunity. Offline preparation is visible to the parent.
2. **Alphabet:** all 33 letter pairs, always unlocked, in alphabetic order. Letter cards are available independently of guided lesson progress.
3. **Letter card:** uppercase/lowercase, illustration and word; separate buttons for letter name, word, contextual example, and writing. Ь and Ъ have explanations, not phoneme buttons.
4. **Session:** one activity at a time, two or three large choices, replay, skip and exit. Alternate familiar vocabulary, review, one new letter, application and optional writing. End with a short parent-led offline activity.
5. **Writing:** play demonstration, trace or copy, undo stroke, clear explicitly, switch hand layout, finish. Preserve the child's marks after mistakes.
6. **Parent area:** guided coverage, separate skill observations, manual speech/paper notes, duration settings, offline package status, export/import and confirmed reset. A hold plus adult action reduces accidental entry; it is not an authentication mechanism.

Use Russian child-facing copy, voice instructions, roughly 64–80 CSS px touch targets, and a writing surface of at least about 320 × 320 CSS px where available. Support reduced motion, visible focus, labels for assistive technology, and non-color feedback. Keep browser zoom available outside the drawing area.

## 4. Architecture and repository layout

Keep lesson selection and progress calculations as pure TypeScript functions. UI calls services through small interfaces; components do not write directly to IndexedDB or manage independent audio players.

```text
src/
  app/                 routes, layout, providers
  features/
    alphabet/          catalogue and letter cards
    session/           reducer, session runner, activity renderers
    writing/           SVG demonstration, Canvas input, stroke handling
    parent/            observations, settings, backup and package status
  domain/              curriculum eligibility, review selection, evidence rules
  content/             schemas and content loading
  services/            audio, progress repository, backup, package manager
  styles/              tokens and shared styles
  sw.ts                app-shell and learning-package caching
content/
  letters.json         33 records
  words.json           MVP vocabulary records
  lessons.json         eight adapted introductory session definitions
  traces/              33 normalized stroke models
  assets.json          asset inventory, review metadata and hashes
public/content/<version>/
  images/              approved optimized illustrations
  audio/               approved playback files
scripts/               validation and package build tools
tests/                 domain, component and end-to-end coverage
docs/                  plans, content review log, device QA and pilot notes
.github/workflows/     checks and deployment
```

The layout is proposed, not scaffolded yet. Keep large generation masters out of the deployed bundle. Retain their source location and provenance in the review manifest. Commit small approved runtime assets; decide whether masters need Git LFS or external storage after measuring them.

### Data contracts

| Entity | Minimum fields and invariants |
|---|---|
| Letter | `id`, `alphabetIndex`, `uppercase`, `lowercase`, `lessonBlock`, `nameAudioId`, `contextExamples`, `wordIds`, `traceModelId`, `specialRule`; exactly 33 unique alphabet entries |
| Word | `id`, `displayForm`, `stressPosition`, `meaning`, `imageId`, `audioId`, `targetLetterSpan`, `decodingPrerequisites`; NFC text, preserve Ё; define indices consistently as Unicode code points |
| Context example | `id`, `kind`, `audioId`, `wordId`, `prerequisiteSkills`; distinguish phoneme, contextual reading and sign explanation; no standalone phoneme for Ь/Ъ |
| Lesson | `id`, `blockId`, `prerequisiteSkills`, `targetSkills`, `orderedActivities`, `reviewItems`, `parentPrompt`; each choice task has valid distractors and one defined answer |
| Trace | `id`, normalized view box, ordered centerline strokes, start points, direction and allowed variants; explicit dots for Ё/Й as appropriate to the approved model |
| Attempt event | `id`, `sessionId`, `activityId`, `itemId`, `skill`, `attemptIndex`, `firstAttempt`, `hintUsed`, `responseMode`, `result`, timestamp, local date, `contentVersion`; distinguish skip, assisted and independent evidence |
| Session checkpoint | `id`, lesson, fixed activity/choice order, active step, start/update times, elapsed active time, content version; resumable without duplicating events |
| Asset | Stable ID, path, media type, bytes, SHA-256, content version, review state, reviewer/date and source/license or generation provenance |
| Backup | `schemaVersion`, export date, profile/settings, events, checkpoints and compatible content references; validate fully before any write |

The progress database contains settings, events, checkpoints and bounded optional drawing samples. Derived summaries can be rebuilt from events. Store content files and media in Cache Storage rather than duplicating audio blobs in IndexedDB. Keep database schema version, content version and app version separate.

### Session and review rules

- Persist a checkpoint after each completed activity; saving an attempt and advancing its checkpoint occur in one database transaction. Stable attempt IDs make resume/import idempotent.
- Select due review first, cap activities to the session budget, and introduce at most one eligible new letter. When the guided slice is finished, offer mixed review and free exploration.
- Use 1/3/7-day review intervals as initial configurable heuristics. Count evidence by skill and context; four independent successes out of the last five eligible attempts over at least two days may reduce frequency, following source §8.
- Hints, repeats after a demonstrated answer and skips do not become independent successes. Skips do not mean lack of knowledge. After two difficulties, demonstrate or reduce choices and allow continuing.
- Speech and paper-writing observations are parent-entered. Tracing completion never upgrades copying, speech or independent reading. Letter introductions do not depend on motor accuracy.
- Keep prerequisite evaluation explicit even though reading activities are deferred. Free catalogue access does not mark a letter or reading rule as learned.

## 5. iPad implementation risks and decisions

### Audio

Route every playback action through one service with current clip identity and cancellation. A new tap cancels previous playback; rapid taps cannot create an unbounded queue. Handle `play()` failure with an accessible retry action. Stop or pause appropriately when leaving a screen, and retry from a user action after returning from sleep/background. Never automatically substitute a letter name for a failed phoneme recording.

Run the source's 12-example audio trial before producing the full set: [м], [с], [п], [б], [ы], [й’], [ч’], [щ’], ёлка, мёд, съел, конь. Choose the voice/provider from this trial. If an isolated sound is unreliable, use a reviewed contextual example and adjust the activity; do not ship incorrect audio. Browser TTS is acceptable only for explicitly temporary prototype words.

### Writing

Use normalized coordinates and scale rendering by devicePixelRatio. Capture the active pointer; finish or cancel safely on `pointerup`, `pointercancel` and lost capture. Redraw saved strokes on resize/rotation. Apply `touch-action: none` only to the drawing area. Finger mode accepts one active touch; pen mode ignores touch strokes while drawing with the pen. Actual palm behavior must be checked on the target hardware.

The MVP provides demonstrations, trace coverage feedback and copying without an automatic correctness verdict. No OCR or strict stroke-order grading. Keep undo and explicit clear separate; cap stored points and retained samples to avoid unbounded growth.

### Offline packages and updates

1. Precache the app shell. Download the compact learning package into a staging cache with a versioned manifest.
2. Verify every required file against the manifest before marking that package ready. Record installation status; interrupted downloads can retry without replacing the active package.
3. Pin each session to its content version. Promote a complete compatible package only between sessions, then retire unused caches after verifying no active session needs them.
4. Defer app/service-worker activation while a lesson is active. Show the parent an update action between sessions; the PWA plugin supports update prompts, but package integrity and session coordination remain application logic ([PWA update documentation](https://vite-pwa-org.netlify.app/guide/prompt-for-update)).
5. Handle quota failures and missing/evicted files. Clear any stale “ready offline” status, offer repair when online, and preserve accessible progress. Request persistent storage where available, but rely on export for recovery: Safari storage has limits and may be evicted ([WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)).

Use immutable versioned content URLs. Ship the active and previous compatible content package during an update window so an interrupted client can finish updating. Do not promise first-visit offline operation. Initial engineering target: compact runtime content at or below 25 MB; measure approved files and revise the budget if needed without compromising intelligibility. This is a proposed budget, not a measured size.

### Backup and recovery

Export portable JSON from the parent area. Import validates schema, size, IDs and references before a transactional write; unsupported future schemas fail with a clear message and no mutation. Default to deduplicated event merging; replacing the local profile requires an explicit parent confirmation and a backup opportunity. Do not import media paths as executable or arbitrary external content. Test a real round trip on the iPad.

## 6. Content production and review

The source's compact estimate is 33 images + 33 trace models + about 115 audio files: 33 names, 33 words, 33 contextual examples/explanations and 16 instructions. Additional session-specific clips may be needed; reconcile counts against the authored sessions before production. Asset quantity is a planning estimate, not a reason to omit a required prompt.

For every asset, track `planned → generated → needs-review → approved` or `rejected`. Only approved assets can enter a release manifest. Record the exact word meaning, stress and relevant sound context. Generated letter pictures must not contain text; glyphs and trace paths are controlled vector/UI assets.

Use the first listed suitable word from the source matrix for each compact card, subject to review. Ь/Ъ use words containing the sign. First choose a consistent illustration style and audio voice on the four-letter spike, then produce the remaining items in small batches. A fluent Russian-speaking adult reviews pronunciation, stress, image meaning and trace shape; automate completeness and file checks, not linguistic approval.

Complete the basic content first. Extra characters, stories, printouts and live generative features must not delay this MVP.

## 7. Development milestones and backlog

Estimates are provisional active engineering/content-integration hours for one developer with AI assistance. They include review integration and fixes, but substantial asset regeneration or specialist review can add time. Calendar pilot time is separate. Re-estimate after M1; these figures are not a delivery commitment.

| Milestone | Work packages | Dependency | Exit criteria | Estimate |
|---|---|---|---|---|
| M0 — Foundation and contracts | Scaffold React/TS/Vite; scripts/CI; schemas and asset manifest; map all 33 source records; author eight initial sessions; document target iPad/iPadOS | None | Clean install/build/checks; content validator rejects invalid references and sign phonemes; scope mapped to source | 6–10 h |
| M1 — Four-letter feasibility | M, О, Ё, Ь cards; audio controller and 12-clip trial; SVG/Canvas prototype; a minimal offline/relaunch test | M0 | Real iPad evidence for finger, available pen, rotation, sound after sleep and cached playback; voice/style chosen; risks recorded | 8–14 h |
| M2 — Six-letter complete flow | А У М О С Н content; three game templates; eight sessions; checkpointing; observations and review rules; trace/copy | M1 | Child/parent can complete, skip, exit and resume; no duplicate progress; hints separated; deterministic session tests pass | 14–22 h |
| M3 — Compact alphabet completion | Remaining cards/assets/models; parent area; backup import/export; staged offline package; update compatibility | M2 | All 33 letters work; full approved manifest; offline cold launch; interrupted download and backup round trip pass | 16–28 h |
| M4 — Release candidate and family pilot | Device matrix; upgrade/rollback drill; two-week pilot; fix observed blockers; deployment notes | M3 | Release checklist below complete and parent confirms usability of short sessions | 10–18 h |

Total: **54–92 active hours plus at least two calendar weeks of family observation**. This is the source's stages 1–4 plus its full testing allowance, excluding the full curriculum expansion. At 8–10 hours per week, active work is roughly 6–12 weeks; pilot observation and rework can extend that. Content production is on the critical path alongside engineering.

Suggested commit/PR boundaries within these milestones:

1. `foundation`: build scripts, CI, routes, styles and schema validators.
2. `ipad-spike`: four-letter audio/writing/offline proof and device notes.
3. `learning-core`: pure session/review logic, repository and migrations.
4. `six-letter-slice`: three activity templates and eight guided sessions.
5. `alphabet-content`: 33 approved cards, trace models and asset inventory.
6. `offline-and-parent-tools`: download/update flow, observations, backups and reset.
7. `release-validation`: device issues, pilot fixes and deployment/runbook.

Do not begin bulk asset generation until M1 resolves the voice and visual direction. Do not extend the curriculum until the compact release is usable.

## 8. Validation and definition of done

### Automated checks

CI runs `npm ci`, lint, TypeScript checking, content validation, unit/component tests, production build and critical browser scenarios. Add these scripts during M0; they do not exist yet.

- Content: exactly 33 letters, stable unique IDs, required media and trace models, approved review states, hashes/byte counts, NFC/Ё preservation, valid answers and prerequisite references.
- Domain: new-letter limit, due reviews, two-difficulty fallback, assisted versus independent evidence, multi-day thresholds, interrupted-session resume and event deduplication.
- Persistence: supported migrations, rejected future backup schemas, malformed import leaves existing data unchanged, export/import round trip and recoverable storage errors.
- Browser: home → letter → audio request → activity → writing → finish; parent entry; reload/resume; catalogue access to every letter; installed package offline; partial package failure; update between sessions without losing progress.

Use Playwright WebKit for automated coverage, with Chromium as a second engine. Its WebKit build does not replace testing the actual iPad Safari environment ([Playwright browser documentation](https://playwright.dev/docs/browsers)).

### Real-device release gate

Record the exact iPad model, iPadOS/Safari version and pencil/stylus availability during M0. Minimum support is the tested family device configuration; broader compatibility is not implied.

- [ ] Safari tab and Home Screen launch; portrait and landscape; layout/tap targets remain usable.
- [ ] Finger writing; Apple Pencil when available; palm contact; cancellation, rotation, undo and clear preserve expected work.
- [ ] First-tap sound, rapid replay, sleep/background return and failure recovery; no overlapping voices.
- [ ] All 33 cards have approved names, words, contextual clips and trace models; special letters reviewed explicitly.
- [ ] Complete download followed by airplane-mode cold launch; all MVP lessons and media work.
- [ ] Interrupted download retains usable old content; missing storage is detected; repair is understandable.
- [ ] App/content upgrade preserves progress and does not interrupt a session; compatible previous build can be restored.
- [ ] Export/import works on the real iPad; reset requires the parent confirmation.
- [ ] Guided scope is clearly eight adapted introductory sessions; vocabulary, speech, letter recognition and writing evidence stay separate.
- [ ] Two-week family pilot logs confusion, accidental taps, fatigue, audio issues and willingness to stop; no required mastery quota.

If an actual device check cannot be completed, mark it pending; browser automation cannot be recorded as its substitute.

## 9. Deployment, operations and boundaries

Proposed delivery uses GitHub Pages and GitHub Actions. Pages serves static assets and supports publishing a build artifact ([GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Check availability for the repository's visibility and account plan before enabling it; choose another static HTTPS host if unavailable.

For a project Pages URL, configure Vite base, manifest `start_url`/scope, service-worker scope and asset resolution consistently under `/russian-alphabet/`. Use hash routes to avoid deep-link 404s. Test the built app at this subpath before deployment. Deployment setup is future implementation work, not completed by this document.

Tag release candidates and retain build artifacts/manifests. Rollback restores a known compatible artifact; avoid destructive database migrations during MVP and test previous-build compatibility before calling rollback supported. Content updates must retain immutable paths needed by the previous release.

No analytics SDK or child data upload is required. Progress remains on the device; exports are parent-controlled. Do not put a child's identifying details into public runtime assets or logs. API credentials for asset generation remain in local/CI secrets and must never use client-exposed environment variables. Hosting, generation costs and storage are measured after the spike; no zero-cost guarantee is assumed.

## 10. First implementation task

Start M0, then build the M/О/Ё/Ь feasibility slice. Deliver the app scaffold, schemas, a 33-letter draft data inventory, the four interactive cards, audio trial manifest, initial writing surface, automated structural checks, and a device checklist. Keep unreviewed assets labeled as prototypes and prevent release validation from accepting them.

Inputs to resolve during implementation: exact target device/OS, available stylus, reviewed voice/provider, image style, and measured package size. Use the source's 5–8 minute profile and the six-letter development slice as defaults. These open items do not block scaffolding or content modeling, but device and linguistic review do block release acceptance.
