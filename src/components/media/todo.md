# Media TODO

These items are intentionally parked until the `audio_visual` backend API is enhanced.

## Backend-Driven Filters

- Replace hardcoded media filter assumptions with values from:
  - `/v1/audio-visual/media-types/`
  - `/v1/audio-visual/languages/`
  - `/v1/audio-visual/categories/`
  - `/v1/audio-visual/series/`
  - `/v1/audio-visual/collections/`
- Rework the old `MediaSidebar` idea into a floating filter/search control:
  - Desktop/tablet: premium glass filter panel near the media tabs.
  - Mobile: add a `Filters` button beside the bottom-docked `Collections` control.
- Filters should query the main list endpoint with supported params:
  - `type`
  - `language`
  - `category`
  - `series`
  - `collection`
  - `live_status`
  - `search`
  - `ordering`

## Music

- Music is currently hardcoded on the frontend because the backend does not yet expose the desired structure.
- Church context distinction:
  - `worship` / PnW should represent praise and worship content.
  - `choir` should be represented separately.
  - The public UI should group both under `Music`.
- After the backend is updated, remove frontend hardcoding and resolve Music from backend data.
- Expected backend direction:
  - A `Music` media type or collection/category that can include subcategories.
  - Subcategories should include at least:
    - `Praise and Worship`
    - `Choir`
- The Music tab should then query backend-driven values instead of assuming `type=worship`.

## Collections And Browse

- Expose collection browsing using:
  - `/v1/audio-visual/collections/`
  - `/v1/audio-visual/collections/<slug>/`
- Consider collection-first shelves where backend curation should control the media page more than frontend assumptions.
- Keep the page cinematic and content-first; avoid reintroducing a heavy fixed sidebar.

## Cleanup

- `MediaIntro.tsx` is safe to delete once we do a cleanup pass.
- `MediaSidebar.tsx` should either be deleted or replaced by the future filter dock/panel described above.


Fix the sitting of collections in the media page, maybe when you hit the footer the buttons can dissappear?