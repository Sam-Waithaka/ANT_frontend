# Memorial Feature Notes

## Temporary Homepage Memorial Banner

The homepage banner for Elder Geoffrey Kirungu lives in `src/features/memorial/public/components/HomeMemorialBanner.tsx` and is inserted once in `src/pages/LandingPage.tsx` above the existing homepage hero.

Removal later should require only:

1. Set or remove `HOME_MEMORIAL_BANNER_ENABLED` in `src/features/memorial/public/homeMemorialBannerConfig.ts`.
2. Remove the `HomeMemorialBanner` import/render call from `src/pages/LandingPage.tsx`.
3. Delete this memorial feature folder during the wider memorial teardown.

The banner fetches public memorial data through the existing public memorial page adapter. It fails quietly on 404 or API errors so the ordinary homepage remains usable.