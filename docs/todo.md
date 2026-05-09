# Todo

## Scripture Chapter Navigation Performance

Random or first-time chapter clicks can feel slightly slow because chapter rendering is currently request-driven:

1. User clicks a chapter.
2. `selectedChapterId` updates.
3. `useScriptureReader` derives the selected chapter.
4. An effect calls the chapter-detail endpoint.
5. `ScriptureDisplay` replaces the current content with a loading skeleton.
6. New verses render after the API response returns.

This is expected for uncached chapters, but the experience can be improved.

### Improvements To Consider

- Prefetch adjacent chapters after the current chapter loads.
- Prefetch a chapter when the user hovers or focuses a chapter button in the picker.
- Keep current verses visible while the next chapter is loading, with a subtle loading indicator.
- Add development timing logs to separate backend/network latency from render latency.
- Pass `AbortSignal` into verse and chapter loads so rapid chapter switching cancels stale requests.

### Current Behavior

- First visit to a chapter depends on the backend request.
- Returning to an already-loaded chapter should be faster because chapter text now uses intentional memory cache.
- The most noticeable delay comes from replacing the reader content with skeletons during loading.

## Scripture Page Effect Cleanup

Target file:

```text
src/pages/ScripturePage.tsx
```

ESLint currently flags older `setState`-inside-effect patterns in the Scripture page. These existed before the Phase 0 API/comparison refactor and are not blocking Phase 1, but they should be cleaned up.

### Cleanup Goals

- Review effects that synchronize selected verses, focused verse, and shared verse links.
- Avoid unnecessary synchronous state updates inside effect bodies where possible.
- Move derivable state into `useMemo` or event handlers when practical.
- Keep deep-link behavior intact for shared scripture URLs.
- Preserve verse selection, focus, and comparison action behavior.

### Verification Needed

- Unit tests should still pass.
- Full e2e suite should still pass, especially:
  - shared verses link opens and selects requested verses
  - clicking a verse opens the action sheet
  - compare verse opens the modal focused on the selected verse
  - compare selection highlights selected verses
