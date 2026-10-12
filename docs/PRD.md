# Product Requirements — SoundSphere v2

## 1. Product summary

SoundSphere is a music-discovery web app. Users can search music catalog metadata, explore available tracks/artists/albums, preview audio when supplied by the API, and maintain a personal library in the browser.

## 2. Target users

- People who want to discover music by title, artist, or genre.
- Users who want a lightweight personal list of favorites and playlists.
- Developers evaluating a real-world React + public API portfolio project.

## 3. Product principles

1. **Real functionality over decorative UI.** Every visible control must work or be clearly disabled.
2. **Honest data labels.** Do not call curated search results “global trending” or claim full streaming.
3. **Graceful failure.** Missing artwork, preview URLs, empty responses, and network errors must not break the page.
4. **Simple by default.** No backend, login, or complex state library in Version 2.
5. **Accessible and responsive.** Usable on mobile, keyboard, and screen readers where practical.

## 4. Feature requirements

### P0 — Required

- Responsive application shell: sidebar, header/search, main content, right discovery panel, bottom player.
- Home page with curated discovery sections.
- Search page with query string support (`/search?q=...`).
- Track details using a track ID (`/track/:trackId`).
- Artist and album exploration when supported by API results.
- Shared audio player for available preview URLs.
- Queue with next/previous, shuffle, repeat, seek, and volume.
- Favorites stored in localStorage.
- Local playlists: create, rename, add/remove tracks, delete playlist.
- Recently played history stored locally.
- Genre/category exploration through curated search terms and API metadata.
- Loading, empty, error, and retry states.
- Responsive design and a basic accessibility pass.

### P1 — Important

- Search debounce and cancellation of stale requests.
- Lightweight recommendations based on favorite genres/artists and recent activity.
- Sorting/filtering results where the returned fields support it.
- Persist player preferences such as volume and repeat mode.
- Keyboard focus states, semantic buttons, alt text, and reduced-motion support.
- Unit tests for pure helpers and storage utilities.

### P2 — Optional after v2 is stable

- Installable PWA.
- Additional public data provider, after checking its access terms and reliability.
- Backend/database for cross-device sync.
- Authentication and account profiles.
- More advanced recommendation logic.

## 5. User stories and acceptance criteria

### Search
As a user, I can search for a song or artist and see relevant results.
- Submitting a non-empty query calls the API.
- Search query is reflected in the URL.
- Loading, empty, and error states are visible.
- A newer query cannot be overwritten by a slower older response.

### Track detail
As a user, I can open a track and inspect its available metadata.
- The route uses `trackId`.
- Missing fields are hidden or shown with safe fallbacks.
- An unavailable track displays a not-found/error state.

### Player
As a user, I can play available previews and control playback from one persistent player.
- Only one audio element is active.
- Play is disabled or explains why when no preview URL exists.
- Next/previous use the current queue.
- Audio errors are communicated without crashing the app.
- Track changes update player metadata.

### Favorites
As a user, I can save and remove favorite tracks.
- Changes persist after refresh.
- Duplicate favorites are prevented using `trackId`.
- Empty library state provides a route back to discovery.

### Playlists
As a user, I can manage personal playlists locally.
- Playlist names are validated and trimmed.
- Track membership is unique per playlist.
- Deleting a playlist updates the UI and storage.
- Invalid or corrupted storage data falls back safely.

### Recently played
As a user, I can see tracks I have recently started playing.
- History updates on actual playback start, not merely on card click.
- Duplicate tracks are moved to the top.
- History has a defined maximum size (suggested: 30 items).

## 6. Out of scope

- Full-length music streaming or bypassing provider restrictions.
- Downloading audio.
- Global social features, public user profiles, comments, or collaborative playlists.
- Guaranteed real-time global charts.
- Authentication or cloud sync in Version 2.

## 7. Success criteria

- Core routes work without runtime errors.
- Search results come from the API rather than hard-coded production data.
- Player, favorites, playlists, and history have real behavior.
- All API and storage failure states are handled.
- The app is usable at mobile and desktop widths.
- Code follows the standards in `CODE_STANDARDS.md`.
