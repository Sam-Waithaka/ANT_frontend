# Memorial TODO

## Revisit Public Rich Text Rendering

Current public memorial sections render backend-provided `content_html` as the initial implementation for ordered section `blocks[]` and item-level `content`.

Revisit this once the backend-rendered HTML is guaranteed to match the visual and semantic output of the canonical Lexical JSON renderer.

### Review Goals

- Confirm backend `content_html` preserves the same structure, marks, headings, links, lists, blockquotes, media placement, and scripture references that the Lexical JSON renderer would produce.
- Compare representative memorial blocks rendered from `content_json` versus backend `content_html`.
- Decide whether the public frontend should continue using `content_html`, move to Lexical JSON rendering, or support both with a clear fallback rule.
- Keep the public memorial page read-only and free of editor/admin UI.

### Status

Open. Defer until backend HTML rendering has parity with Lexical JSON output.

## TODO: Remove temporary memorial block deduplication and implement proper content ownership

### Background

The memorial API currently exposes some item-owned rich-text blocks twice:

* Once in `section.blocks[]`, where the frontend renders them as editorial content.
* Again in `section.items[].content`, where the frontend renders them as cards, timeline entries, arrangements, tributes, or recording groups.

The frontend temporarily filters `section.blocks[]` by matching block IDs referenced by `items[].content`. This prevents the visible duplication but does not resolve the underlying backend ownership problem.

### Step 1: Remove the temporary frontend workaround

Before implementing the permanent fix, remove or disable the frontend block-deduplication filter in a development branch.

This is necessary to reproduce and confirm the original issue:

* Item-owned content should appear once as editorial content from `blocks[]`.
* The same content should then appear again through the appropriate `items[]` UI.
* Confirm the duplication in known repeatable sections:

  * `ministry_legacy`
  * `personal_tributes`
  * `leadership_timeline`
  * `arrangements`
  * `recordings`
* Confirm that simple editorial sections and `gallery` behave as expected.

Record representative API responses and screenshots before applying the backend fix.

### Step 2: Correct ownership in the backend

Establish the following contract:

```text
Memorial section
├── blocks[]       Standalone section-level editorial content
└── items[]        Repeatable structured records
    └── content    Rich-text content owned by the item
```

A rich-text block referenced by an item must be returned only through that item’s `content`. It must not also appear in the section’s `blocks[]`.

Preserve the existing public response structure:

```json
{
  "section_key": "...",
  "blocks": [],
  "items": []
}
```

Do not revert to returning only the first section block. Sections must continue supporting multiple legitimate standalone blocks.

Prefer deriving ownership from existing item-to-block relationships. Add a new ownership field only if the existing relationships cannot reliably distinguish standalone blocks from item-owned blocks.

### Step 3: Verify the corrected API without frontend filtering

With the temporary frontend filter still removed, verify that:

* Section introductions appear through `blocks[]`.
* Item content appears only through `items[].content`.
* No item-owned content appears in both arrays.
* Multiple legitimate standalone blocks remain supported.
* Ordering remains stable.
* Draft and invisible content is excluded.
* Gallery and recordings still behave correctly.

For example, `leadership_timeline` should return:

```text
blocks[]:
- Fourteen years of leadership

items[]:
- Began service as LCC Chairman
- Strengthened ministry coordination
- Encouraged intergenerational service
- Completed fourteen years of leadership
```

### Step 4: Permanently delete the temporary workaround

Once the corrected backend response has been verified:

* Permanently remove the frontend ID-based deduplication code.
* Remove its associated TODO comments and fallback logic.
* Keep the frontend renderer straightforward:

  * render every returned `block`;
  * render every returned `item`;
  * trust the backend ownership contract.
* Update frontend fixtures and tests to reflect the corrected API.

### Acceptance criteria

* No title-, body-, or position-based duplicate detection exists in the frontend.
* The frontend does not render only the first block for repeatable sections.
* The public API never exposes an item-owned block as a standalone section block.
* Multiple standalone section blocks render correctly.
* Repeatable content renders through its intended card, timeline, gallery, arrangement, tribute, or recording UI.
* The temporary frontend workaround has been completely removed.
* Backend and frontend tests document and enforce the ownership contract.

## TODO: Unify memorial public route, API slug, and environment link contract

### Background

During the Elder Geoffrey Kirungu Gicharu memorial rollout, we repeatedly confused three different identifiers:

```text
Frontend public route slug:
in-loving-memory-of-elder-geoffrey-kirungu-gicharu

Production backend memorial page slug:
elder-geoffrey-kirungu-gicharu

Old/local debugging slug used earlier:
elder-geoffrey-kirungu
```

The public frontend route is intentionally more human-readable and should remain:

```text
/in-loving-memory-of-elder-geoffrey-kirungu-gicharu
```

The public API endpoint that currently returns the production payload is:

```text
GET https://api.aicnjoro.org/v1/memorial/public/pages/elder-geoffrey-kirungu-gicharu/
```

The confirmed production response returned `200 application/json` for this slug and included:

```json
{
  "page": {
    "id": 1,
    "full_name": "Elder Geoffrey Kirungu Gicharu",
    "slug": "elder-geoffrey-kirungu-gicharu"
  }
}
```

### What went wrong

We changed the frontend API slug several times while trying to reconcile local and production behavior:

- `elder-geoffrey-kirungu`
- `in-loving-memory-of-elder-geoffrey-kirungu-gicharu`
- `elder-geoffrey-kirungu-gicharu`

The first two returned `404` on production. The correct production DB slug is:

```text
elder-geoffrey-kirungu-gicharu
```

This caused the public memorial page to show a frontend 404/error state even though the route itself was valid.

### Current frontend contract

The frontend now deliberately separates the public page route from the backend API slug:

```ts
export const ELDER_GEOFFREY_MEMORIAL_ROUTE_SLUG =
  "in-loving-memory-of-elder-geoffrey-kirungu-gicharu";

export const ELDER_GEOFFREY_MEMORIAL_API_SLUG =
  "elder-geoffrey-kirungu-gicharu";
```

The route slug is for browser navigation. The API slug is for the backend memorial record.

### Cleanup work

- Decide whether this hard-coded mapping should remain in the frontend or move into configuration/API discovery.
- Confirm local backend data uses the same DB slug as production, or document a safe local override.
- Avoid changing `ELDER_GEOFFREY_MEMORIAL_API_SLUG` without testing the exact target API URL first.
- Add a small regression test or documented smoke check that verifies the frontend constructs:

```text
/v1/memorial/public/pages/elder-geoffrey-kirungu-gicharu/
```

- Confirm the homepage memorial banner and public memorial page use the same API slug source.
- Confirm deployment environments set `VITE_API_BASE_URL` correctly:

```text
Production: https://api.aicnjoro.org
Local dev: empty base through Vite proxy, or local backend URL when explicitly configured
```

### Related backend/data issue

The public payload currently returns this under `sections.arrangements`:

```text
block_count = 4
item_count = 1
```

This is a separate but related contract issue. Some arrangement content appears as section-level rich-text blocks when it may belong to arrangement items. Reconcile this with the temporary frontend deduplication TODO above.

### Acceptance criteria

- The public memorial page route remains stable and user-facing.
- The frontend API slug matches the backend DB slug.
- Local, staging, and production behavior are documented and reproducible.
- Backend public endpoint tests confirm the live memorial slug returns `200`.
- Frontend smoke checks confirm the memorial page fetches the correct API endpoint before deployment.
- No future fix relies on guessing between route slug, DB slug, and display URL.
