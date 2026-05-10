# System Design

## Overview

This project is a static React SPA for A.I.C Njoro Town Church. It combines three user-facing experiences:

- a church landing page
- the Project 52 Bible reading plan
- an interactive Scripture reader with search, sharing, comparison, and Bible tools

The frontend owns UI state, reading-plan schedule logic, routing, and presentation. Scripture text and metadata are loaded from the Scripture API through a single service module.

## Goals

- Make Project 52 readings open directly in the Scripture reader.
- Keep one authority for Scripture rendering: `openScripture(request)`.
- Avoid conflicting render paths between Project 52, URL query params, sidebar controls, and floating controls.
- Keep Bible reference controls and Bible version controls modular.
- Support phase-one church deployment as a static app.
- Preserve room for backend expansion into more Bible versions and languages.

## Non-Goals

- User accounts.
- Server-side rendering.
- Persisted reading completion state.
- Offline Scripture storage.
- Backend administration UI.

## Runtime Architecture

```text
Browser
  |
  | React Router
  v
Routes
  /             -> LandingPage
  /project52    -> Project52Page
  /scripture    -> ScripturePage
  |
  v
Providers
  Project52Provider
  ScriptureReaderProvider
  |
  v
Services
  scriptureApi.ts -> Scripture API
```

## Routing

| Route | Responsibility |
|---|---|
| `/` | Branded church landing page |
| `/project52` | Full Project 52 plan, PDF export, search/filtering |
| `/scripture` | Scripture reader, Project 52 widget, Bible tools, search, comparison |

The app is deployed as a static SPA. Refresh fallback is handled by `public/_redirects`.

## State Ownership

### Project 52

`Project52Provider` owns:

- current reading target
- current reading week
- built reading weeks
- active rotating catchphrase

`project52Schedule.ts` owns the date rules:

- Week 1 starts on the first Monday of the year.
- Monday-Friday map to reading days.
- Saturday/Sunday use weekend catch-up for the current week.
- The Scripture widget uses `Previous / Today / Next` reading sequence tabs.
- Week 1 and Week 52 edges are clamped.

### Scripture Reader

`ScriptureReaderProvider` owns durable reader selection state:

- selected version
- selected book
- selected chapter
- selected verse
- pending external reference

`useScriptureReader()` owns loaded API collections:

- versions
- books
- chapters
- verses
- loading flags
- errors

The public render authority is:

```ts
openScripture(request)
```

All opening paths should pass a JavaScript object to this function:

- Project 52 tile clicks
- Project 52 widget clicks
- floating chapter controls
- sidebar book/chapter controls
- URL query param references

## Scripture Rendering Flow

### Direct Selection

```text
User chooses version/book/chapter
  -> openScripture({ versionId/bookId/chapterId })
  -> useScriptureReader loads dependent data
  -> ScriptureDisplay renders verses
```

### Project 52 Reading

```text
User clicks Project 52 reading
  -> useOpenProject52Reading()
  -> openScripture({ book, chapter })
  -> navigate('/scripture') when needed
  -> pendingReference resolves against loaded books/chapters
  -> verses load by reference
  -> pendingReference clears
```

### URL Reference

```text
/scripture?book=John&chapter=20&verses=1-2&version=BSB
  -> useScriptureReader reads search params
  -> openScripture({ book, chapter, verses, versionId })
  -> pendingReference resolves
  -> selected verses are highlighted/actionable
```

## API Service

All Scripture API calls are centralized in:

```text
src/services/scriptureApi.ts
```

The service provides:

- request URL construction
- response unwrapping
- tolerant field mapping
- query string building
- book reference normalization
- in-memory request caching for duplicate identical requests

The request cache exists because React `StrictMode` in development intentionally double-runs mount effects. Duplicate same-URL requests reuse the same promise. Failed requests are removed from the cache to allow retries.

## Scripture API Endpoints Consumed

| Function | Endpoint |
|---|---|
| `getBibleVersions()` | `GET /v1/bible/versions/` |
| `getBibleBooks(version)` | `GET /v1/bible/versions/:version/books/` |
| `getBibleChapters(version, book)` | `GET /v1/bible/versions/:version/books/:book/chapters/` |
| `getBibleVerses(version, book, chapter)` | `GET /v1/bible/versions/:version/books/:book/chapters/:chapter/` |
| `getBibleVersesByReference(version, book, chapter)` | same chapter endpoint, with frontend book-name normalization |
| `lookupBibleVerse(version, book, chapter, verse)` | `GET /v1/bible/versions/:version/verses/:book/:chapter/:verse/` |
| `compareBibleChapter(versions, book, chapter)` | `GET /v1/bible/compare/?versions=BSB,ASV&book=John&chapter=20` |
| `searchBible(params)` | `GET /v1/bible/search/?q=...` |
| `getBibleResources(version, type)` | `GET /v1/bible/versions/:version/resources/?type=...` |
| `getBibleGlossary(version, q)` | `GET /v1/bible/versions/:version/glossary/?q=...` |
| `getBibleMarkers(version, status)` | `GET /v1/bible/versions/:version/markers/?status=...` |
| `getBibleNotes(version, type)` | `GET /v1/bible/versions/:version/notes/?type=...` |

## Response Tolerance

The frontend accepts several response shapes while the API stabilizes:

- top-level arrays
- `{ data: [...] }`
- `{ items: [...] }`
- `{ results: [...] }`
- `{ versions: [...] }`
- `{ books: [...] }`
- `{ chapters: [...] }`
- `{ verses: [...] }`

For chapter text, it looks for verse collections and common text fields such as:

- `text`
- `content`
- `verseText`
- `body`

For version/book/chapter metadata, it accepts common alternatives such as:

- `abbreviation`, `abbr`, `code`
- `osis_id`, `osisId`, `bookId`, `id`
- `number`, `chapter`, `chapterNumber`, `order`

This tolerance is useful during backend iteration, but the backend team should still converge on stable contracts.

## Comparison Design

The comparison modal is shared by:

- Scripture action sheet compare verse/selection/chapter
- Bible Tools compare tool

The modal receives:

- comparison data
- selected comparison versions
- optional highlighted verse numbers
- optional book/chapter navigation data

It supports:

- selectable comparison versions
- one-or-more selected verses highlighted
- scroll to first highlighted verse
- book/chapter changes inside the modal
- outside-click close
- close-on-Escape

The modal does not fetch directly. Its parent owns comparison loading and passes the result back into the modal.

## Shared UI Modules

| Module | Purpose |
|---|---|
| `ScriptureReferencePickers.tsx` | book picker and chapter picker primitives |
| `ScriptureReferencePickerGroup.tsx` | shared book/chapter picker group |
| `BibleVersionPickerList.tsx` | shared single/multi Bible version list and availability note |
| `ScriptureVersionSelect.tsx` | mobile/compact single-version selector |
| `ScriptureComparisonModal.tsx` | shared chapter comparison modal |
| `ScriptureActionSheet.tsx` | selected verse/selection actions |
| `BibleToolsPanel.tsx` | container for Bible tools |

## Project 52 Design

Project 52 data is static frontend data:

```text
src/data/project52Readings.ts
src/data/project52Catchphrases.ts
```

Important behavior:

- Full plan route displays all weeks.
- Current week opens and scrolls into view.
- Current day is highlighted.
- Weekend mode uses the current week as catch-up.
- The Scripture widget provides quick access to Previous/Today/Next readings.
- Week 52 Friday disables Next.

## Sharing

`src/utils/scriptureShare.ts` builds:

- verse share payloads
- selection share payloads
- chapter share payloads
- canonical `/scripture` URLs

Copied text appends:

```text
Continue reading on A.I.C Njoro Town Church:
```

## Testing

Unit tests use Vitest.

End-to-end tests use Playwright. The focused phase-one suite is:

```bash
npm run test:e2e -- tests/e2e/project52-scripture.spec.ts
```

This suite covers:

- Project 52 widget direct opens
- Project 52 full-route tile opens
- Previous/Today/Next widget behavior
- Week 52 edge behavior
- mobile panel close behavior
- Scripture action sheet
- comparison modal behavior
- multi-verse comparison highlights
- shared verse links
- cross-book previous chapter navigation

## Known Engineering Notes

- React `StrictMode` may make dev-only render/effect behavior appear doubled.
- Scripture API requests are cached by URL to avoid duplicate identical network work.
- Full `npm run lint` may reveal legacy warnings outside recently touched areas; focused lint has been used for changed files.
- Bible version availability is currently surfaced as: "We are working toward adding more Bible versions and more languages."

## Future Work

- Persist user reading progress.
- Add reminders or daily notification hooks.
- Add more Bible versions and languages.
- Stabilize Scripture API response contracts.
- Add backend-backed progress/account features if required.
- Add analytics around Project 52 reading opens.
