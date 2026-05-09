# Scripture API Consumption Refactor Plan

This plan describes how the frontend should move from the current flexible API adapter toward a stricter, sustainable integration with the A.I.C Njoro Scripture API described in `ANT_backend/documents/usecase.md`.

The goal is not to rewrite everything at once. The goal is to first strengthen the API foundation, then migrate each feature area in small safe phases while keeping the existing UI working.

## Current Assessment

The frontend is in a good transitional state:

- Most backend calls are centralized in `src/services/scriptureApi.ts`.
- The app already uses `VITE_API_BASE_URL` and a Vite `/v1` proxy for development.
- Scripture reader, search, comparison, Bible tools, sharing, and Project 52 flows are covered by e2e tests.
- The current API adapter is intentionally defensive and accepts several possible payload shapes.

The main risk is that the adapter is too flexible. It can hide backend contract drift by silently rendering empty or partial results instead of exposing a clear integration problem.

The refactor should make the API contract explicit, preserve useful resilience, and avoid duplicating request/state logic across components.

## Phase 0: Foundation Fixes Before Endpoint Refactors

### 0.1 Introduce A Small API Client

Create a shared API client module, for example:

```text
src/services/apiClient.ts
```

Responsibilities:

- Build API URLs from `getApiBaseUrl()`.
- Attach default headers.
- Parse JSON safely.
- Preserve HTTP status codes.
- Surface backend `detail` messages.
- Support `AbortSignal`.
- Support request timeout.
- Deduplicate identical in-flight requests when appropriate.

Proposed exported shape:

```ts
type ApiRequestOptions = {
  cache?: 'none' | 'memory';
  signal?: AbortSignal;
  timeoutMs?: number;
};

class ApiError extends Error {
  endpoint: string;
  status?: number;
  detail?: string;
}

apiGet<T>(path: string, options?: ApiRequestOptions): Promise<T>;
```

Why first:

- Every later endpoint migration becomes safer.
- Components can distinguish `400`, `404`, `429`, and network failures.
- Search can truly cancel requests instead of only ignoring stale results.

### 0.2 Add Endpoint-Specific Cache Policy

Keep caching, but make it intentional.

Recommended cache behavior:

- Cache long-lived data:
  - versions
  - books for a version
  - chapters for a version/book
  - chapter text
- Do not permanently cache:
  - search
  - glossary
  - markers
  - notes
  - annotations
  - sources
  - tokens
  - resources if backend editors may update them

Implementation idea:

- Use in-flight deduplication for all GET requests.
- Use memory cache only when an endpoint opts in.
- Add a basic TTL later if needed.

### 0.3 Add Strict Normalizers Per Endpoint

Replace broad "maybe any shape" parsing with endpoint-specific normalizers.

Current helper methods such as `unwrapCollection`, `readString`, and `readNumber` are useful during migration, but final normalizers should mirror the backend use case document.

Example:

```text
normalizeVersionsResponse()
normalizeBooksResponse()
normalizeChaptersResponse()
normalizeChapterDetailResponse()
normalizeSearchResponse()
normalizeComparisonResponse()
```

Each normalizer should:

- Accept the documented backend shape.
- Return frontend domain types.
- Preserve important metadata.
- Throw or report a clear error when required fields are missing.

### 0.4 Add Paginated Response Support

Several backend endpoints are paginated:

- search
- glossary
- markers
- notes
- annotations
- sources
- tokens

Add a shared type:

```ts
type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
```

Frontend UI should preserve:

- `count`
- `next`
- `previous`
- `results`

This enables "Load more" and future pagination without changing endpoint functions again.

### 0.5 Improve Error Messaging

Map backend failures to useful UI messages.

Examples:

- `400`: show backend `detail` where safe.
- `404`: "This Bible version, book, or chapter is not available."
- `429`: "Too many requests. Please wait a moment and try again."
- network failure: "We could not reach the Scripture API."
- unexpected payload: "The Scripture API returned an unexpected response."

Do this in service helpers, then let hooks/components decide the final friendly copy.

### 0.6 Extract Shared Comparison State

Comparison logic currently exists in both the Scripture page and the Bible Tools panel.

Create a hook such as:

```text
src/hooks/useBibleComparison.ts
```

Responsibilities:

- selected comparison versions
- selected comparison book/chapter
- loading/error state
- load comparison
- change comparison versions
- change comparison reference

This keeps comparison behavior consistent between:

- verse action sheet
- chapter comparison
- Bible Tools compare tab
- future comparison pages

## Phase 1: Version, Book, Chapter, And Reader Contract

### 1.1 Versions

Endpoint:

```http
GET /v1/bible/versions/?public=true
```

Frontend rules:

- Use `abbreviation` or `code` as stable version identifier.
- Preserve:
  - `publication_year`
  - `language`
  - `language_code`
  - `source`
  - `license_type`
  - `license_url`
  - `license_notes`
  - `is_public`

Frontend type should expand beyond the current minimal `BibleVersion`.

Suggested additions:

```ts
publicationYear?: number;
language?: string;
languageCode?: string;
source?: string;
licenseType?: string;
licenseUrl?: string;
licenseNotes?: string;
isPublic?: boolean;
```

UI impact:

- Version picker can later show language, year, and license badges.
- Reader can show source/license details properly.

### 1.2 Books

Endpoint:

```http
GET /v1/bible/versions/{version}/books/
```

Frontend rules:

- Use `osis_id` for API routes and internal selected book id.
- Use `name` for display.
- Preserve `canonical_name` and `canonical_abbreviation`.
- Do not hardcode book names.
- Do not assume all versions have all 66 books.

Important SWNT rule:

- SWNT may display `Mathayo`, but API routing should use `Matt`.

This should remove much of the need for manual book mapping in `scriptureIntent.ts`.

### 1.3 Chapters

Endpoint:

```http
GET /v1/bible/versions/{version}/books/{book}/chapters/
```

Expected backend shape:

```json
{
  "chapter_numbers": [1, 2, 3],
  "chapters": []
}
```

Frontend rules:

- Use API chapter list instead of hardcoded counts.
- Preserve chapter number and label.
- Disable or omit missing chapters.

### 1.4 Chapter Detail

Endpoint:

```http
GET /v1/bible/versions/{version}/books/{book}/chapters/{chapter}/
```

Frontend rules:

- Render `verses`.
- Use `is_present` and `display`.
- Preserve:
  - `markers`
  - `notes`
  - `footnotes`
  - `cross_references`
  - `textual_variants`
  - `annotations`
  - `credit`

Current reader should be updated to use the documented chapter shape directly.

UI behavior:

- If `is_present=true`, render verse text.
- If `is_present=false`, do not invent text.
- If `display=footnote_only`, render a compact notice or marker note.
- Show chapter source/license footer from `credit`.

### 1.5 URL And Share Behavior

Frontend route/share links should preserve:

```text
version
book
chapter
verse / verses
```

Use `book.osis_id` for route state where possible, while still displaying localized book names.

The share URL should continue using `VITE_SITE_BASE_URL`.

## Phase 2: Search Refactor

### 2.1 Search Endpoint Contract

Endpoint:

```http
GET /v1/bible/search/?q=love&version=ASV&page_size=25
```

Supported filters:

- `q`
- `version`
- `versions`
- `language_code`
- `lang`
- `language`
- `book`
- `testament`
- `fuzzy`
- `page`
- `page_size`

Frontend defaults:

- Do not search below 2 characters.
- Debounce by `300-500ms`.
- Default to selected Bible version.
- Use `page_size=25`.
- Do not default to broad all-version search.

### 2.2 Search Response Type

Preserve:

- `count`
- `next`
- `previous`
- `results`
- `suggestions`
- `search_config`

Each result should preserve:

- `version`
- `book.name`
- `book.osis_id`
- `chapter`
- `verse_number`
- `reference`
- `text`
- `headline`
- `rank`
- `similarity`
- `search_type`
- `exact_match`
- `all_terms_match`
- `credit`

### 2.3 Search UI Behavior

When rendering:

- Use `reference` as the clickable title.
- Use `headline` for highlighted snippets, sanitized to allow only safe `<mark>` tags.
- Use `book.osis_id`, `chapter`, and `verse_number` for navigation.
- Show result count.
- Add "Load more" using `next`.
- Show "Showing close matches" for fuzzy results.
- Show suggestions when backend returns them.

### 2.4 Search Request Cancellation

After `apiClient` supports `AbortSignal`, update `useScriptureSearch` so stale requests are actually cancelled.

This matters because search has stricter throttling.

## Phase 3: Comparison Refactor

### 3.1 Comparison Endpoint Contract

Endpoint:

```http
GET /v1/bible/compare/?versions=ASV,WEBP&book=John&chapter=3
```

Expected shape:

```json
{
  "book": {
    "osis_id": "John",
    "name": "John"
  },
  "chapter": 3,
  "results": []
}
```

Each reading may include:

- `version`
- `text`
- `is_present`
- `display`
- markers or notes in future

### 3.2 Comparison UI Rules

- Support 2-5 versions.
- Use version columns/cards.
- Preserve selected verse highlighting.
- If `is_present=false`, show a muted "Not present in this source" cell.
- On mobile, prefer horizontal scroll or version tabs.

### 3.3 Shared Hook

Move duplicated comparison state into `useBibleComparison`.

Then wire:

- action sheet comparison
- chapter comparison
- Bible Tools comparison tab

to the same behavior.

## Phase 4: Bible Tools Refactor

### 4.1 Resources

Endpoint:

```http
GET /v1/bible/versions/{version}/resources/
```

Support filters:

```text
type=preface|copyright|study_help|translation_review|glossary|front_matter|other
```

Frontend should preserve pagination if returned.

### 4.2 Glossary

Endpoint:

```http
GET /v1/bible/versions/{version}/glossary/?q=altar
```

Frontend should:

- Render `count`.
- Support `Load more`.
- Search within selected version.
- Avoid permanent cache.

### 4.3 Markers

Endpoint:

```http
GET /v1/bible/versions/{version}/markers/?status=omitted
```

Known statuses:

- `omitted`
- `empty_marker`
- `source_unavailable`

Frontend should:

- Explain missing verses.
- Reuse marker handling in reader and comparison.
- Avoid blank unexplained verse rows.

### 4.4 Notes

Endpoint:

```http
GET /v1/bible/versions/{version}/notes/?type=footnote
```

Notes are legacy/simple lists.

Frontend should prefer annotations when available, but keep notes as fallback.

## Phase 5: Annotations, Footnotes, And Rich Reader Rendering

### 5.1 Prefer Annotations

Endpoint:

```http
GET /v1/bible/versions/{version}/annotations/?book=Gen&chapter=1
```

Known annotation types:

- `footnote`
- `cross_reference`
- `textual_variant`
- `section_heading`
- `paragraph`
- `poetry`
- `speaker_label`
- `translator_addition`
- `word_study`
- `other`

### 5.2 Offset-Based Footnote Rendering

Rules:

- Use offsets against the plain `text` field.
- Insert superscript markers after the offset.
- Group notes that share an offset.
- If offsets are missing, attach the note to the verse number.
- Do not render `raw_content` to normal users.

This should be implemented behind a focused utility with tests:

```text
src/utils/verseAnnotations.ts
tests/unit/verseAnnotations.test.ts
```

### 5.3 Study Mode

Do not make the normal reader visually noisy.

Add richer annotation rendering behind a future "Study mode" or "Notes" toggle.

## Phase 6: Tokens, Sources, And Debug/Study Features

### 6.1 Tokens

Endpoint:

```http
GET /v1/bible/versions/{version}/tokens/?book=John&chapter=3&verse=16
```

Rules:

- Do not request tokens by default.
- Use tokens for future word study and precise search highlighting.
- Show Strong/lemma/morphology only when present.

### 6.2 Sources

Endpoint:

```http
GET /v1/bible/versions/{version}/sources/?book=Gen&chapter=1&verse=2
```

Rules:

- Do not request raw source by default.
- Use this in admin/debug/source-verification views.
- Keep `raw_text` out of normal public reading UI.

### 6.3 Include Raw Or Tokens On Chapter Detail

Optional query params:

```http
?include_raw=true
?include_tokens=true
```

Rules:

- Only request when the active UI mode needs it.
- Never request both by default.

## Phase 7: Environment And Deployment Safety

### 7.1 Keep API Base URL In `.env`

Required frontend values:

```env
VITE_SITE_BASE_URL=https://staging-or-final-domain
VITE_API_BASE_URL=https://api.aicnjoro.org
```

Development behavior:

- Frontend calls `/v1/...`.
- Vite proxy forwards `/v1` to `VITE_API_BASE_URL`.

Production behavior:

- Vite bakes `VITE_API_BASE_URL` into the built bundle.
- `.env` must be correct before `npm run build`.

### 7.2 Keep Main Church Logo Link Separate

Navigation logo currently points to:

```text
https://aicnjoro.org
```

This is correct because staging deployments should still link to the top-level main church site.

Do not reuse `VITE_SITE_BASE_URL` for that logo unless the product decision changes.

## Phase 8: Testing Strategy

### 8.1 Unit Tests

Add tests for:

- API URL building.
- API error parsing.
- timeout and abort behavior.
- paginated response normalization.
- versions response normalization.
- books response normalization, especially SWNT localized names with canonical OSIS ids.
- chapter detail normalization, including:
  - present verse
  - omitted verse
  - marker-only verse
  - chapter credit
  - annotations
- search response normalization.
- comparison response normalization.
- annotation offset insertion.

### 8.2 E2E Tests

Keep existing e2e tests and expand mocks to match the backend use case document.

Add flows for:

- SWNT book display uses `Mathayo`, routing uses `Matt`.
- version with NT-only books does not show unavailable OT books as selectable.
- omitted verse renders a notice.
- search count and load-more behavior.
- fuzzy search suggestions.
- comparison missing verse cell.
- 429 throttling message.
- backend `detail` message for validation errors.

### 8.3 Manual API QA Before Frontend Release

Run the backend team's priority calls in Postman or terminal before a release:

```http
GET /v1/bible/versions/
GET /v1/bible/versions/?language_code=sw
GET /v1/bible/versions/SWNT/books/
GET /v1/bible/versions/ASV/books/John/chapters/3/
GET /v1/bible/versions/SWNT/books/Matt/chapters/1/
GET /v1/bible/versions/ASV/verses/John/3/16/
GET /v1/bible/versions/ASV/verses/Matt/17/21/
GET /v1/bible/versions/LEB/annotations/?book=Gen&chapter=1
GET /v1/bible/versions/LEB/sources/?book=Gen&chapter=1&verse=2
GET /v1/bible/versions/ASV/tokens/?book=John&chapter=3&verse=16
GET /v1/bible/compare/?versions=ASV,WEBP,KJV,BSB,LEB&book=Rom&chapter=8
GET /v1/bible/search/?q=love&version=ASV
GET /v1/bible/search/?q=begoten&version=ASV
GET /v1/bible/versions/WEBP/resources/
GET /v1/bible/versions/WEBP/glossary/?q=altar
```

## Recommended Implementation Order

1. Add `apiClient.ts` with `ApiError`, timeout, abort support, and intentional cache policy.
2. Add paginated response types and helpers.
3. Add strict normalizers and unit tests for versions/books/chapters/chapter detail.
4. Refactor `scriptureApi.ts` to use the new client and normalizers.
5. Update `useScriptureReader` to consume the stricter domain types.
6. Add source/license credit rendering from chapter detail.
7. Refactor search to use pagination, abort signals, backend highlights, suggestions, and result count.
8. Extract `useBibleComparison`.
9. Refactor comparison endpoint normalization and missing-verse UI.
10. Refactor Bible Tools around paginated resources/glossary/markers/notes.
11. Add annotations rendering utilities and tests.
12. Add future study/debug support for tokens and sources.

## Definition Of Done

This refactor is complete when:

- The frontend uses documented backend shapes instead of broad guesswork.
- API errors preserve status and backend `detail`.
- Search supports pagination, count, suggestions, fuzzy labels, and request cancellation.
- Chapter reader uses `osis_id` for routing and localized names for display.
- SWNT and partial-version behavior is accurate.
- Missing/omitted verses are explained, not blank.
- Chapter source/license credit is shown.
- Comparison behavior is shared, tested, and handles missing readings.
- Tests cover normal, empty, paginated, error, and omitted-verse API responses.
- Production build still only requires the correct `.env` values before `npm run build`.
