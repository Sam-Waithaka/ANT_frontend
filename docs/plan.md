# Backend API Consumption Plan

This plan defines how the A.I.C Njoro Town frontend will consume the expanded Scripture API and turn it into a complete Bible reading, search, comparison, and study experience.

The backend is now the source of truth for versions, books, chapters, verses, comparison data, search results, missing verses, annotations, footnotes, metadata, licensing, and future study features. The frontend should stop hardcoding Bible structure wherever the API can provide it.

## Goals

- Consume the full stable Scripture API through one frontend service layer.
- Keep `openScripture()` as the single frontend authority for scripture navigation and rendering.
- Use backend-supported identifiers consistently:
  - version routes and requests use `abbreviation` / `code`
  - book routes and requests use `osis_id`
  - visible labels use localized `name`
- Restore and improve Bible Tools search with backend filters.
- Render footnotes, annotations, omitted verses, and source/license data accurately.
- Upgrade comparison to use the backend comparison endpoint as the single comparison authority.
- Prepare the frontend for Cloudflare/API production deployment.
- Leave performance optimization as a later pass, while avoiding obvious duplicate calls now.

## Core Frontend Rule

Route and request with stable identifiers, display localized names.

Example:

```json
{
  "name": "Mathayo",
  "canonical_name": "Matthew",
  "abbreviation": "Mt",
  "canonical_abbreviation": "Matt",
  "osis_id": "Matt"
}
```

The frontend should display `Mathayo`, but API calls and route state should use `Matt`.

## Phase 1: API Client Foundation

### 1.1 Tighten Environment Configuration

Use these environment values:

```env
VITE_SCRIPTURE_API_BASE_URL=http://localhost:9000
VITE_SCRIPTURE_API_PROXY_TARGET=http://localhost:9000
```

Production should point to the secured API domain after Cloudflare is finalized.

### 1.2 Refactor `scriptureApi.ts`

The current service layer already has request caching and flexible normalization. Refactor it from defensive guessing into exact API adapters.

Required client functions:

```ts
getBibleVersions()
getBibleVersionDetail(versionId)
getBibleBooks(versionId)
getBibleChapters(versionId, bookOsisId)
getBibleChapter(versionId, bookOsisId, chapterNumber, options?)
getBibleVerse(versionId, bookOsisId, chapterNumber, verseNumber, options?)
getBibleComparison({ versions, bookOsisId, chapterNumber })
searchBible(params)
getBibleAnnotations(versionId, params)
getBibleSources(versionId, params)
getBibleTokens(versionId, params)
getBibleResources(versionId, params)
getBibleGlossary(versionId, params)
getBibleMarkers(versionId, params)
```

Keep the existing in-memory request cache for identical requests. This matters because React StrictMode may run effects twice in development, and the backend has throttling.

### 1.3 Add Shared API Types

Update `src/types/scripture.ts` to reflect backend shapes:

- `BibleVersion`
- `BibleVersionDetail`
- `BibleBook`
- `BibleChapter`
- `BibleVerse`
- `BibleAnnotation`
- `BibleFootnote`
- `BibleMarker`
- `BibleCredit`
- `BibleComparisonChapter`
- `BibleSearchResult`
- `PaginatedResponse<T>`
- `BibleToken`
- `BibleResource`
- `BibleGlossaryEntry`
- `BibleSourceRecord`

Do not overfit the UI components to raw API responses. Normalize once in the service layer, then render stable frontend models.

## Phase 2: Scripture Reader Integration

### 2.1 Versions

Use:

```http
GET /v1/bible/versions/?public=true
```

Frontend impact:

- Populate all version selectors from the backend.
- Show language, publication year, and license metadata where appropriate.
- Keep `BSB` as the preferred default when available.

### 2.2 Books

Use:

```http
GET /v1/bible/versions/{version}/books/
```

Frontend impact:

- Book selectors must use version-specific availability.
- `SWNT` should only show New Testament books.
- Group books by testament.
- Display localized `name`.
- Store/select by `osis_id`.

### 2.3 Chapters

Use:

```http
GET /v1/bible/versions/{version}/books/{book}/chapters/
```

Frontend impact:

- Chapter selectors should use API-provided `chapter_numbers`.
- Previous/next chapter navigation should use API chapter availability, not hardcoded counts.
- Missing chapters should not be shown as available.

### 2.4 Chapter Detail

Use:

```http
GET /v1/bible/versions/{version}/books/{book}/chapters/{chapter}/
```

Frontend impact:

- Render verses from `verses`.
- Use `is_present` and `display` to avoid inventing missing verse text.
- Add a chapter footer with:
  - `credit.source`
  - `credit.source_url`
  - `credit.license_type`
  - `credit.license_notes`
- Preserve existing highlighting and scripture action sheet behavior.

## Phase 3: Footnotes, Annotations, And Missing Verses

### 3.1 Footnote Rendering

The backend provides `annotations`, `notes`, and `footnotes`. Prefer `annotations` when available.

Rendering rule:

- If an annotation has `start_offset` / `end_offset`, inject a superscript marker into the verse text at that offset.
- If offsets are missing, attach the note to the verse number or show it in a verse-level note list.
- If multiple notes share the same offset, group them behind one marker.
- Do not render `raw_content` to normal users.

UI behavior:

- Tapping/clicking a superscript marker opens a compact footnote popover or bottom sheet.
- The current Scripture Action Sheet can be extended or a dedicated `VerseFootnoteSheet` can be added.
- Desktop can use popovers; mobile should use bottom sheets.

### 3.2 Annotation Types

Support these first:

- `footnote`
- `cross_reference`
- `textual_variant`
- `section_heading`
- `translator_addition`

Rendering priorities:

- `section_heading`: render as a small heading before the verse.
- `footnote`: render as superscript markers.
- `cross_reference`: show in a references section or expandable panel.
- `translator_addition`: use subtle styling or footnote explanation.
- `textual_variant`: show in study mode, not necessarily default reader mode.

### 3.3 Missing And Omitted Verses

Use:

```http
GET /v1/bible/versions/{version}/markers/
```

And verse/chapter payload fields:

```json
{
  "is_present": false,
  "display": "footnote_only"
}
```

Frontend rule:

- Do not show blank verses without explanation.
- Render a muted notice such as:

```text
Verse not present in this source.
```

- Prefer backend marker text when supplied.
- In comparison, missing verse cells should be visibly muted.

## Phase 4: Bible Tools Search

### 4.1 Restore Search Button

The Bible Tools panel should include a visible Search action again.

Search should be a first-class tool alongside:

- compare
- copy/share
- glossary/resources later

### 4.2 Backend-Supported Filters

Use:

```http
GET /v1/bible/search/
```

Supported filters:

- `q`
- `version`
- `versions`
- `language_code`
- `book`
- `testament`
- `fuzzy`
- `page`
- `page_size`

Initial UI filters:

- Version selector
- Testament segmented control:
  - All
  - Old Testament
  - New Testament
- Book selector
- Optional language selector:
  - All
  - English
  - Swahili

### 4.3 Search Behavior

Rules:

- Do not search until the query has at least 2 characters.
- Debounce by `300-500ms`.
- Ignore stale responses when the user keeps typing.
- Show `count`.
- Use `next` and `previous` for pagination or "Load more".
- If `search_type=fuzzy`, show "Showing close matches".
- If backend returns `400`, display `detail`.
- If backend returns `429`, show a friendly throttling message.

### 4.4 Search Result Navigation

Clicking a result should call the single scripture authority:

```ts
openScripture({
  versionId: result.version,
  book: result.book.osis_id,
  chapter: result.chapter,
  verse: result.verse_number,
});
```

The scripture route should load the chapter and scroll/highlight the selected verse.

## Phase 5: Comparison Modal Upgrade

### 5.1 Use Backend Comparison Endpoint

Use:

```http
GET /v1/bible/compare/?versions=ASV,WEBP,KJV&book=John&chapter=3
```

Frontend impact:

- The comparison modal should not load each version separately.
- The backend comparison endpoint becomes the single comparison authority.
- Keep our current version selector and book/chapter navigator.

### 5.2 Selection Highlighting

Support:

- single highlighted verse
- multiple highlighted verses
- scroll to first highlighted verse
- highlight all selected verses

This already exists conceptually; wire it to backend comparison results.

### 5.3 Missing Verse Cells

If a reading has:

```json
{
  "is_present": false
}
```

Render:

```text
Not present in this source.
```

Use marker/footnote copy when available.

## Phase 6: Version Details, Resources, And Glossary

### 6.1 About This Bible

Use:

```http
GET /v1/bible/versions/{version}/
GET /v1/bible/versions/{version}/resources/
```

UI:

- Add an "About this Bible" drawer or modal.
- Show:
  - name
  - abbreviation
  - language
  - publication year
  - source
  - source URL
  - license type
  - license URL
  - license notes

### 6.2 Glossary

Use:

```http
GET /v1/bible/versions/{version}/glossary/
GET /v1/bible/versions/{version}/glossary/?q=altar
```

UI:

- Add a searchable glossary panel in Bible Tools.
- Keep it version-specific.
- Paginate or load more with `next`.

### 6.3 Resources

Use:

```http
GET /v1/bible/versions/{version}/resources/
```

UI:

- Add a resources tab or drawer.
- Resource types can include:
  - preface
  - copyright
  - study help
  - translation review
  - glossary
  - front matter

## Phase 7: Tokens And Word Study

This is a later feature, but the API is ready.

Use:

```http
GET /v1/bible/versions/{version}/tokens/?book=John&chapter=3&verse=16
GET /v1/bible/versions/{version}/books/{book}/chapters/{chapter}/?include_tokens=true
```

Frontend rule:

- Do not request tokens by default.
- Add a study mode toggle.
- Only load tokens for the active chapter or active verse when study mode is enabled.
- Make words clickable only when token metadata is useful.

UI:

- Tap/click a word.
- Show:
  - token
  - normalized form
  - Strong number when present
  - lemma when present
  - morphology when present

Most sources currently do not include Strong/lemma/morphology, so the UI should degrade gracefully.

## Phase 8: Raw Source And Admin/Debug Views

Use:

```http
GET /v1/bible/versions/{version}/sources/
GET /v1/bible/versions/{version}/books/{book}/chapters/{chapter}/?include_raw=true
```

Frontend rule:

- Do not load raw source in normal reader.
- Use this only for admin/debug/source inspection.

Possible UI:

- "View source data" panel behind a development/admin flag.
- Show `source_format`, `source_file`, `source_id`, `clean_text`, and `raw_text`.

## Phase 9: Security, Cloudflare, And Production Readiness

The backend is secured, with Cloudflare still remaining.

Frontend production tasks:

- Confirm production API domain.
- Set production `VITE_SCRIPTURE_API_BASE_URL`.
- Verify CORS with final Cloudflare domain.
- Confirm HTTPS-only API calls.
- Confirm rate-limit behavior through Cloudflare.
- Add user-friendly handling for:
  - `400`
  - `401`
  - `403`
  - `404`
  - `429`
  - `500`
- Avoid exposing secret tokens in frontend code.

If the public scripture API requires authentication later, the frontend should use a safe public token strategy or backend-for-frontend pattern. Do not embed private credentials.

## Phase 10: Frontend Optimization Pass

Optimization should happen after correctness.

Targets:

- Reduce duplicate effect calls.
- Cache stable data:
  - versions
  - version detail
  - books per version
  - chapters per version/book
- Cache recent chapter payloads.
- Debounce search.
- Avoid requesting tokens/raw source unless enabled.
- Consider route-level code splitting for heavy scripture tools.
- Add loading skeletons for reader/search/comparison.
- Add request cancellation or stale-response guards for search and navigation.

## Testing Plan

### Unit Tests

Add tests for:

- API response normalization.
- OSIS book identity handling.
- localized display name handling.
- footnote marker injection by character offset.
- missing verse rendering models.
- search parameter building.
- comparison parameter building.

### Integration Tests

Add tests for:

- selecting a version loads version-specific books.
- selecting `SWNT` only shows NT books.
- changing book loads chapters from API.
- opening scripture from Project 52 calls the single `openScripture()` path.
- search result click opens scripture and highlights verse.
- comparison modal uses the backend comparison endpoint.

### Manual QA

Verify:

- `BSB John 3`
- `SWNT Matt 1`
- omitted verse such as `ASV Matt 17:21`
- comparison with `ASV, WEBP, KJV, BSB, LEB`
- search `love`
- fuzzy search `begoten`
- glossary search `altar`
- version detail/license display
- dark and light themes
- mobile, tablet, desktop

## Execution Order

Recommended order:

1. Refactor API types and `scriptureApi.ts`.
2. Wire reader versions/books/chapters/chapter detail to exact backend endpoints.
3. Add source/license footer.
4. Add missing verse handling.
5. Implement annotation/footnote rendering.
6. Restore Bible Tools search with backend filters.
7. Move comparison fully to `/v1/bible/compare/`.
8. Add version detail/about drawer.
9. Add glossary/resources panels.
10. Add optional study mode for tokens.
11. Add optional admin/source inspection.
12. Run production Cloudflare/API hardening.
13. Optimize frontend request and rendering behavior.

## Acceptance Criteria

The backend API consumption work is complete when:

- The frontend does not hardcode versions, books, chapters, or verse presence.
- All scripture navigation uses one `openScripture()` authority.
- The reader displays localized book names but routes/requests by `osis_id`.
- Bible Tools search is restored and supports backend filters.
- Footnotes and annotations are visible and anchored where offsets exist.
- Missing verses are explained instead of rendered as blank text.
- Comparison uses the backend comparison endpoint.
- Chapter source/license information is visible.
- API errors and throttling are handled gracefully.
- The app works against the secured backend API in production configuration.
