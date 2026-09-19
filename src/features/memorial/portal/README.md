# Memorial portal

This removable feature discovers and manages memorial pages inside the authenticated A.I.C portal. Memorial IDs, slugs, display names, statuses, update timestamps and public paths come from `GET /v1/memorials/portal/`.

## Routes

- `/portal/memorials` — authenticated discovery hub and zero-data state
- `/portal/memorials/:slug/overview`
- `/portal/memorials/:slug/page`
- `/portal/memorials/:slug/writing`
- `/portal/memorials/:slug/tributes`
- `/portal/memorials/:slug/timeline`
- `/portal/memorials/:slug/media`
- `/portal/memorials/:slug/arrangements`
- `/portal/memorials/:slug/review`

The backend supplies each memorial's `public_path`. The public memorial page renders at `/in-memory/:slug` and reads the anonymous aggregate from `GET /v1/memorials/{slug}/`.

## Backend setup

The parent `MemorialPage` must first be created in Django admin because the backend provides discovery but no create-page operation. The discovery endpoint returns an empty list until that happens. Portal requests use the existing JWT client; selected workspace operations remain slug-based below `/v1/memorials/portal/{slug}/`.

Every active authenticated user can open Writing and submit an unapproved contribution. Moderation is requested independently. A 403 from moderation leaves Writing usable. The returned capability object controls page, child, approval, media and publication actions; server authorization remains authoritative.

Portal data is held in component memory only. It is never written to browser storage. Published memorials are read-only. All mutations send the latest contract timestamp and stale 400 responses preserve local editor content instead of retrying automatically.

Image uploads require `public_availability_confirmed=true`. The Media workspace works only with memorial links and safe previews; it never requests shared-asset deletion, originals, storage paths, uploader identities or worker errors.

## Verification

```powershell
pnpm test -- memorialPortalApi portalNavigationModel
pnpm exec eslint src/features/memorial/portal tests/unit/memorialPortalApi.test.ts
pnpm exec playwright test --config playwright.memorial.config.ts
pnpm build
```

Repository-wide lint currently reports pre-existing failures outside this feature. Run it to monitor that baseline, but use the focused lint command above to gate memorial changes.

## Teardown

1. Remove the memorial route blocks and lazy imports from `src/App.tsx`.
2. Remove the `portal-memorial` item from `src/components/navigation/portalNavigationModel.ts`.
3. Remove the two Memorial dashboard entries and `HeartHandshake` import from `src/pages/PortalPage.tsx`.
4. Revert the memorial expectations in `tests/unit/portalNavigationModel.test.ts`.
5. Delete `tests/unit/memorialPortalApi.test.ts`.
6. Delete `tests/e2e/memorial-portal.spec.ts` and `playwright.memorial.config.ts`.
7. Delete `src/features/memorial/`.

No global store, global CSS, shared type, authentication, Writing Studio or media-service module imports this feature.
