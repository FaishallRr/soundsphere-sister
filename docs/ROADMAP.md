# Development Roadmap — SoundSphere v2

Build in vertical slices: each stage should leave the app runnable.

## Phase 0 — Project foundation

- [x] Create Vite React project.
- [x] Install React Router, Tailwind CSS v4 Vite plugin, and icons if needed.
- [x] Confirm the dev server works.
- [x] Create route skeleton and base CSS tokens.
- [x] Add app shell with responsive sidebar, main area, right panel, and player placeholder.

**Done when:** all routes render and the layout responds to desktop/mobile widths.

## Phase 1 — API foundation

- [x] Implement `searchTracks`.
- [x] Implement `getTrackById`.
- [x] Implement artist/album lookup as supported by returned IDs.
- [x] Add normalization helpers for optional fields.
- [x] Test requests manually in browser.
- [x] Add loading, empty, error, and retry states.

**Done when:** real API data is rendered without hard-coded production results.

## Phase 2 — Discovery and search

- [x] Create curated discovery config.
- [x] Render track cards and lists.
- [x] Add search input and query-string routing.
- [x] Add debounce and cancellation for stale requests.
- [x] Add genre/artist exploration.
- [x] Add Load More or paging behavior if supported by the API approach.

**Done when:** search and discovery remain stable across rapid query changes and failed requests.

## Phase 3 — Shared preview player

- [x] Create one player provider and one audio instance.
- [x] Implement play/pause and source changes.
- [x] Track duration/current time.
- [x] Add seek and volume.
- [x] Add queue, next/previous, shuffle, repeat.
- [x] Handle missing preview and audio errors.
- [x] Clean up listeners on unmount.

**Done when:** audio never duplicates across cards/routes and controls stay in sync.

## Phase 4 — Local library

- [x] Add safe storage helper and versioned keys.
- [x] Implement favorites.
- [x] Implement create/rename/delete playlist.
- [x] Implement add/remove track from playlist.
- [x] Implement recently played history.
- [x] Add empty states and storage validation.

**Done when:** local data survives refresh and malformed storage does not crash the app.

## Phase 5 — Recommendations and polish

- [x] Derive lightweight suggestions from favorite genres/artists.
- [x] Add filters/sorting where data supports them.
- [x] Add keyboard and accessibility pass.
- [x] Test responsive layouts.
- [x] Improve loading skeletons and transitions.
- [x] Run production build and resolve warnings.
- [x] Add unit tests for pure helpers and storage utilities (Vitest).

**Done when:** core user flows pass the testing checklist.

## Phase 6 — Release

- [ ] Verify current API terms and attribution/usage rules.
- [ ] Test production build locally.
- [ ] Deploy to a static hosting provider.
- [ ] Verify routes on refresh and direct navigation.
- [ ] Write final README screenshots and known limitations.

## Scope guard

Do not add authentication, database, social features, or full streaming until Version 2 works end-to-end. New features must not destabilize search, player, and local library.
