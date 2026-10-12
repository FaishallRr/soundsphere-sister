# Testing and Manual QA — SoundSphere

## 1. Search and API

- [ ] Search by song title returns relevant results.
- [ ] Search by artist returns relevant results.
- [ ] Empty query does not send a request.
- [ ] Whitespace-only query is handled as empty.
- [ ] No-results response shows an empty state.
- [ ] Network failure shows an error and Retry action.
- [ ] Rapid typing does not allow stale results to replace current results.
- [ ] Missing optional fields do not crash cards.
- [ ] API response shape is validated.
- [ ] Repeated navigation does not trigger avoidable duplicate requests.

## 2. Player

- [ ] Play works when `previewUrl` exists.
- [ ] Missing preview displays a clear explanation.
- [ ] Pause works.
- [ ] Next/previous use the queue.
- [ ] Seek and volume controls work.
- [ ] Shuffle changes queue order.
- [ ] Repeat mode behaves as labelled.
- [ ] Audio error is communicated.
- [ ] Only one preview plays at a time.
- [ ] Changing routes does not unexpectedly create another player.
- [ ] History updates only when playback actually starts.

## 3. Favorites and playlists

- [ ] Add favorite.
- [ ] Remove favorite.
- [ ] No duplicate favorites.
- [ ] Refresh preserves favorites.
- [ ] Create, rename, and delete playlist.
- [ ] Add/remove a track from playlist.
- [ ] Duplicate playlist tracks are prevented.
- [ ] Empty library/playlist states are helpful.
- [ ] Corrupted localStorage values do not crash the app.
- [ ] Storage unavailable/quota errors are handled gracefully.

## 4. Navigation and responsive UI

- [ ] Home, Search, Track, Artist, Album, and Library routes work.
- [ ] Direct navigation and page refresh work.
- [ ] Unknown route shows not-found state.
- [ ] Desktop layout resembles intended structure.
- [ ] Tablet layout remains usable.
- [ ] Mobile navigation and player are usable.
- [ ] No horizontal overflow at narrow widths.
- [ ] Icon-only controls have accessible names.
- [ ] Keyboard focus is visible.

## 5. Release checks

- [ ] `npm run build` succeeds.
- [ ] No unexpected console errors.
- [ ] No broken artwork images.
- [ ] API terms and usage are reviewed.
- [ ] Production hosting supports SPA route fallback.
- [ ] README documents setup and limitations.
