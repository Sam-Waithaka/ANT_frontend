# A.I.C Njoro Town Scripture + Project 52

A client-side React app for **A.I.C Njoro Town Church**. The current phase delivers a branded church web presence, a Project 52 reading plan, and a Scripture reader that can open readings directly from Project 52.

## Current Scope

- `/` - church landing/home page.
- `/project52` - full 52-week Bible reading plan.
- `/scripture` - Scripture reader, Project 52 widget, Bible tools, search, sharing, and comparison flows.

The app is built with React, TypeScript, Vite, Tailwind CSS, and lucide-react. It consumes a Scripture API through `src/services/scriptureApi.ts`.

## Key Features

### Scripture Reader

- Bible version, book, and chapter navigation.
- Previous/next chapter controls, including cross-book navigation.
- Shared scripture-render authority through `ScriptureReaderProvider` and `openScripture(request)`.
- URL-driven references such as `/scripture?book=John&chapter=20&verses=1-2&version=BSB`.
- Verse selection action sheet with:
  - copy verse/selection/chapter
  - compare verse/selection/chapter
- Share links with canonical query params.
- Search panel for Scripture lookup.
- Bible tools panel for comparison, resources, glossary, markers, and notes.
- Shared comparison modal with selectable versions, book/chapter navigation, highlighted selected verses, and outside-click close.

### Project 52

- Full 52-week reading plan.
- Monday-Friday readings with Old Testament and New Testament tracks.
- Current week detection based on the first Monday of the year.
- Weekend catch-up mode for the current week.
- `Previous / Today / Next` reading tabs in the Scripture-route widget.
- Edge handling for Week 1 Monday and Week 52 Friday.
- Direct opening from Project 52 readings into the Scripture reader.
- Branded PDF export of the full plan.

### Site Experience

- A.I.C Njoro Town branding and assets.
- Light/dark theme with persisted preference.
- Responsive desktop and mobile layouts.
- Modular shared controls for reference pickers and Bible version pickers.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI rendering |
| TypeScript | Type safety |
| Vite | Dev server and production build |
| Tailwind CSS v4 | Styling |
| React Router | Client-side routing |
| lucide-react | Icons |
| Vitest | Unit tests |
| Playwright | End-to-end tests |

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
npm run test:e2e
```

Default dev URL:

```text
http://localhost:5173
```

## Scripture API Configuration

The API base URL is controlled by:

```text
VITE_SCRIPTURE_API_BASE_URL
```

In development, an empty base URL is allowed so Vite can proxy or mock same-origin endpoints. In production, the fallback is:

```text
https://api.aicnjoro.org
```

Scripture API access is centralized in:

```text
src/services/scriptureApi.ts
```

That service includes tolerant response parsing and an in-memory request cache so duplicate requests reuse the same promise.

## Important Source Paths

```text
src/
  contexts/
    Project52Context.tsx
    ScriptureReaderContext.tsx
    ScriptureReaderStore.ts
  components/
    project52/
    scripture/
      bibleTools/
      BibleVersionPickerList.tsx
      ScriptureComparisonModal.tsx
      ScriptureFloatingControls.tsx
      ScriptureProject52Card.tsx
      ScriptureReferencePickerGroup.tsx
      ScriptureReferencePickers.tsx
      ScriptureVersionSelect.tsx
  data/
    project52Catchphrases.ts
    project52Readings.ts
  hooks/
    useOpenProject52Reading.ts
    useScriptureReader.ts
    useScriptureSearch.ts
  pages/
    LandingPage.tsx
    Project52Page.tsx
    ScripturePage.tsx
  services/
    scriptureApi.ts
  utils/
    project52Pdf.ts
    project52Schedule.ts
    scriptureShare.ts
```

## Documentation

- [Design language](docs/design-language.md)
- [System design](docs/system-design.md)

## Testing Notes

The focused Playwright suite for Scripture and Project 52 is:

```bash
npm run test:e2e -- tests/e2e/project52-scripture.spec.ts
```

The app uses React `StrictMode` in development. Dev mode may mount effects twice, but Scripture API calls are cached to avoid duplicate identical network work.

## Deployment Notes

The app is a static SPA. Refresh support depends on:

```text
public/_redirects
```

with:

```text
/* /index.html 200
```

## Credits

Built for **A.I.C Njoro Town Church**.

Footer credit belongs to **AIC Njoro Town Media Crew**.
