# AIC Njoro Town Holding Page + Project 52

A premium temporary website for **AIC Njoro Town** while the full church website is being prepared.

The app currently serves two main experiences:

- `/` - a branded holding page for AIC Njoro Town.
- `/project52` - Project 52, a 52-week Bible reading plan for the church community.

The project is fully client-side, deployable on Netlify, and built with React, TypeScript, Vite, and Tailwind CSS.

## Current Features

### Holding Page

- Branded AIC Njoro Town landing/holding page.
- Light and dark mode.
- Theme preference saved in `localStorage`.
- Shared header and footer.
- AIC circle logo and generated favicons.
- Media Crew footer credit and link.

### Project 52

- 52-week Bible reading plan.
- Old Testament and New Testament readings shown distinctly.
- Automatic current reading week detection.
- Week 1 starts on the first Monday of each year.
- Monday-Friday highlight the current reading day.
- Saturday/Sunday highlight Friday from the previous reading week.
- Current week opens and scrolls into view automatically.
- Tabs for:
  - Both
  - Old Testament
  - New Testament
- Smart search by book name.
- Search can switch tabs automatically when a query clearly belongs to OT or NT.
- Scrollable full-year reading container.
- Rotating Project 52 catchphrase badge with optional scripture references.
- Downloadable branded PDF reading plan.

### PDF Export

The Project 52 page generates a branded PDF in the browser.

The PDF includes:

- `ANT_letter_head.png` as the PDF header.
- Full 52-week reading plan.
- Monday-Friday reading rows.
- Old Testament and New Testament columns.
- Page footer with:
  - Project 52 page text
  - `ANT_logo_black.png`
  - `media_crew_black.png`
  - the catchphrase visible at the time the user clicked download

No server is required for PDF generation.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | UI rendering |
| TypeScript | Type safety |
| Vite | Development and production builds |
| Tailwind CSS v4 | Styling |
| lucide-react | Icons |
| Browser Blob / PDF commands | Client-side PDF download |

## Routes

| Route | Purpose |
|---|---|
| `/` | AIC Njoro Town holding page |
| `/project52` | Project 52 reading plan |

Netlify refresh support is handled by:

```text
public/_redirects
```

with:

```text
/* /index.html 200
```

## Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    SiteHeader.tsx
    SiteFooter.tsx
    project52/
      Project52Hero.tsx
      Project52ProgressCard.tsx
      ReadingPlanSection.tsx
      RotatingCatchphrase.tsx
  constants/
    assets.ts
  data/
    project52Catchphrases.ts
    project52Readings.ts
  hooks/
    useTheme.ts
  pages/
    LandingPage.tsx
    Project52Page.tsx
  types/
    project52.ts
  utils/
    project52Pdf.ts
    project52Schedule.ts
```

## Public Assets

Brand and app assets live in `public/`.

Important assets:

```text
public/aic_circle.png
public/ANT_logo.png
public/ANT_logo_black.png
public/ANT_letter_head.png
public/media_crew_black.png
public/favicon/
```

Asset paths are centralized in:

```text
src/constants/assets.ts
```

## Design Documentation

The project design language is documented in:

```text
docs/design-language.md
```

That document captures:

- Brand colors
- Theme colors
- Typography
- Spacing
- Button patterns
- Card patterns
- Header/footer rules
- Project 52 UX rules
- PDF design rules
- Future page guidance

## Getting Started

### Prerequisites

- Node.js
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

Project 52:

```text
http://localhost:5173/project52
```

### Build For Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Development Notes

- Keep shared UI in `src/components`.
- Keep feature-specific UI in `src/components/{feature}`.
- Keep route-level views in `src/pages`.
- Keep long static lists in `src/data`.
- Keep reusable business logic in `src/utils`.
- Keep common types in `src/types`.
- Keep public asset paths in `src/constants/assets.ts`.

Avoid putting data, PDF logic, and UI all in the same component.

## Future Plans

Planned or possible future enhancements:

- Add license-free Scripture text directly into the site.
- Add user reading progress tracking.
- Add weekly completion state.
- Add user interactivity for marking readings complete.
- Add optional reminders.
- Expand from holding page into the full AIC Njoro Town website.
- Add more ministry pages while following the documented design language.

## Credits

Built for **AIC Njoro Town**.

Footer credit belongs to:

```text
AIC Njoro Town Media Crew
```

Media Crew link:

```text
https://media-crew.aicnjorotown.org
```
