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
- The Music tab now uses `type=music`; the next pass should add backend-driven subcategory filters for `choir` and `praise-and-worship`.

## Collections And Browse

- Expose collection browsing using:
  - `/v1/audio-visual/collections/`
  - `/v1/audio-visual/collections/<slug>/`
- Consider collection-first shelves where backend curation should control the media page more than frontend assumptions.
- Keep the page cinematic and content-first; avoid reintroducing a heavy fixed sidebar.

## Cleanup

- `MediaIntro.tsx` is safe to delete once we do a cleanup pass.
- `MediaSidebar.tsx` should either be deleted or replaced by the future filter dock/panel described above.



Add share CTA button in the media player, that shares the video link, when clicked, and calls the default behavior of the device

Add a 3rd CTA in the landing page, with watch live there is a Sunday live service in EAT, and watch latest sermon, which will always point to the latest sermon

Changing the theme from lightmode to darkmode and vice versa should not pause the video player
