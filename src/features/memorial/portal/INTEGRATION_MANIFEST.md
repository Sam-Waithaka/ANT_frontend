# Integration manifest

Files outside `src/features/memorial/` intentionally changed by this feature:

| File | Reason |
| --- | --- |
| `src/App.tsx` | One lazy protected wildcard route for the known memorial. |
| `src/components/navigation/portalNavigationModel.ts` | One removable Memorial navigation item visible to authenticated portal users. |
| `src/pages/PortalPage.tsx` | One removable Memorial module/quick-action entry. |
| `tests/unit/portalNavigationModel.test.ts` | Covers visibility and active matching of the removable navigation item. |
| `tests/unit/memorialPortalApi.test.ts` | Focused contract tests; removable with the feature. |
| `tests/e2e/memorial-portal.spec.ts` | Authenticated desktop/mobile route smoke coverage with contract fixtures. |
| `playwright.memorial.config.ts` | Isolated memorial browser-test configuration on the available local QA port. |

There are no memorial additions to global state, shared service types, global CSS, authentication, media or Writing Studio modules.
