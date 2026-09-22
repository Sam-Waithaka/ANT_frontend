# Memorial Feature Notes

## Homepage Memorial Banners

The homepage banner system lives in `src/features/memorial/public/components/HomeMemorialBanner.tsx` and is inserted once in `src/pages/LandingPage.tsx` above the existing homepage hero.

It fetches active public memorial banners from:

```http
GET /v1/memorial/public/banners/
```

The backend decides which memorials are active for the banner using publication, visibility, `show_banner`, and the configured banner date window. The frontend renders only records returned by that endpoint and builds public links as `/in-loving-memory-of-{slug}` using the memorial page slug from the API.

To disable the homepage banner placement entirely, set `HOME_MEMORIAL_BANNER_ENABLED` in `src/features/memorial/public/homeMemorialBannerConfig.ts` to `false`, or remove the `HomeMemorialBanner` import/render call from `src/pages/LandingPage.tsx`.

The banner fails quietly on API errors so the ordinary homepage remains usable.
