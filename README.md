# A.I.C Njoro Town Scripture + Project 52

A client-side React Router app for **A.I.C Njoro Town Church**. The current phase delivers a lightweight church landing page, the Project 52 reading plan, and a Scripture reader with sharing, search, comparison, and Bible tools.

## Current Scope

- `/` - church landing/home page for the current phase.
- `/project52` - full 52-week Bible reading plan.
- `/scripture` - Scripture reader, Project 52 widget, Bible tools, search, sharing, and comparison flows.
- `*` - unmatched client routes render the landing page.

The app is built with React, React Router, TypeScript, Vite, Tailwind CSS, and lucide-react. Scripture API access is centralized in `src/services/scriptureApi.ts`.

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

## Environment Variables

Use these variables for deployment-specific URLs:

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_SITE_BASE_URL` | Browser links and Scripture share/copy text | Canonical public site origin used anywhere the app builds a site URL. If omitted, browser code uses the current origin, then falls back to `https://aicnjoro.org`. |
| `VITE_API_BASE_URL` | Browser Scripture API requests | Base URL for Scripture API requests. Leave this empty in development so requests use `/v1` and the Vite proxy handles the upstream host. Set it to `https://api.aicnjoro.org` before a production build. |
| `VITE_API_PROXY_TARGET` | Vite dev server only | Local dev proxy target for `/v1` requests. If omitted, Vite uses `VITE_API_BASE_URL`, then `http://localhost:9000`. This value is not used by the built static app. |

The project uses one local `.env` file. Keep exactly one environment block active before running the app or building `dist`.

Development block:

```text
VITE_SITE_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=https://api.aicnjoro.org
```

Example preview deployment:

```text
VITE_SITE_BASE_URL=https://preview.example.org
VITE_API_BASE_URL=https://api-preview.example.org
VITE_API_PROXY_TARGET=
```

Production/cPanel block:

```text
VITE_SITE_BASE_URL=https://staging.aicnjoro.org
VITE_API_BASE_URL=https://api.aicnjoro.org
VITE_API_PROXY_TARGET=
```

Vite reads these values at build time. If you upload a prebuilt `dist` folder to cPanel, set the values before running `npm run build`; cPanel runtime environment variables will not change an already-built static bundle.

### URL Behavior

Scripture copy/share links and church-site links use `VITE_SITE_BASE_URL` when it is set. Otherwise, they use the current browser origin, so local development produces links such as:

```text
http://localhost:5173/scripture?book=John&chapter=20&version=BSB
```

`src/services/scriptureApi.ts` includes tolerant response parsing and an in-memory request cache so duplicate requests reuse the same promise.

## Important Source Paths

```text
src/
  App.tsx
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
tests/
  e2e/
    fixtures/
    project52-scripture.spec.ts
    ui-comprehensive.spec.ts
  unit/
```

## Documentation

- [Design language](docs/design-language.md)
- [System design](docs/system-design.md)

## Testing Notes

Unit tests live under `tests/unit`. Playwright tests live under `tests/e2e`, with shared E2E mocks in `tests/e2e/fixtures`.

Useful commands:

```bash
npm test
npm run test:e2e
npm run test:e2e -- tests/e2e/project52-scripture.spec.ts
npm run test:e2e -- tests/e2e/ui-comprehensive.spec.ts
```

The app uses React `StrictMode` in development. Dev mode may mount effects twice, but Scripture API calls are cached to avoid duplicate identical network work.

## Deployment Notes

Routing is handled in the browser by React Router. Because this is still a static SPA, the hosting platform must serve `index.html` for deep links such as `/project52` and `/scripture?book=John&chapter=20`.

For Netlify-style hosting, this fallback is provided by:

```text
public/_redirects
```

with:

```text
/* /index.html 200
```

On other hosts, configure the equivalent SPA fallback/rewrite to `index.html`. This is hosting fallback behavior, not application routing; the actual routes are declared in `src/App.tsx`.

For cPanel/Apache hosting, `public/.htaccess` is copied into `dist/.htaccess` during the Vite build. Upload the contents of `dist` into the target web root, such as `public_html`, and keep `.htaccess` included so direct visits to `/project52` and `/scripture?...` resolve to the React Router app.

## Credits

Built for **A.I.C Njoro Town Church**.

Footer credit belongs to **AIC Njoro Town Media Crew**.
