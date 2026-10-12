# Architecture — SoundSphere v2

## 1. Architecture overview

Version 2 is a client-side React application. The browser calls the iTunes Search API directly, and local user data is persisted in localStorage.

```text
User
  |
  v
React pages and components
  |
  +--> custom hooks (player, favorites, playlists, history)
  |
  +--> services/itunesApi.js --> iTunes Search API
  |
  +--> utils/storage.js ------> localStorage
  |
  v
UI states: loading / success / empty / error
```

Do not introduce a backend just to proxy a public endpoint unless a concrete need appears. If another provider requires a secret key, do not expose that key in frontend code; use a backend or serverless function.

## 2. Suggested folder structure

```text
soundsphere/
├── public/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   └── router.jsx
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── RightPanel.jsx
│   │   ├── music/
│   │   │   ├── TrackCard.jsx
│   │   │   ├── TrackList.jsx
│   │   │   ├── AlbumCard.jsx
│   │   │   └── ArtistCard.jsx
│   │   ├── player/
│   │   │   ├── MusicPlayer.jsx
│   │   │   └── PlayerControls.jsx
│   │   └── feedback/
│   │       ├── LoadingState.jsx
│   │       ├── EmptyState.jsx
│   │       └── ErrorState.jsx
│   ├── features/
│   │   ├── discovery/
│   │   │   └── discoveryConfig.js
│   │   ├── favorites/
│   │   │   └── useFavorites.js
│   │   ├── playlists/
│   │   │   └── usePlaylists.js
│   │   ├── history/
│   │   │   └── useRecentlyPlayed.js
│   │   └── player/
│   │       ├── PlayerProvider.jsx
│   │       └── usePlayer.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── TrackPage.jsx
│   │   ├── ArtistPage.jsx
│   │   ├── AlbumPage.jsx
│   │   └── LibraryPage.jsx
│   ├── services/
│   │   └── itunesApi.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── formatDuration.js
│   │   └── normalizeTrack.js
│   ├── constants/
│   │   └── app.js
│   ├── index.css
│   └── main.jsx
├── docs/
├── index.html
├── package.json
└── vite.config.js
```

Keep this as a target structure, not a reason to create empty files on day one. Add a file when the feature needs it.

## 3. Responsibility boundaries

- **Pages:** compose feature components and coordinate route-level loading.
- **Components:** render UI and emit user actions; avoid embedding fetch logic.
- **Services:** own URL construction, `fetch`, HTTP checks, and response parsing.
- **Hooks/providers:** own reusable state and behavior.
- **Utils:** pure transformations and formatting.
- **Constants/config:** shared fixed values such as route paths and curated search terms.

## 4. Data flow rules

1. User action updates local UI state or calls a service.
2. Service returns normalized data or throws a meaningful error.
3. Page/hook owns loading and error state.
4. Components render state; they do not silently initiate duplicate requests.
5. User-owned data is persisted through a single storage helper.
6. Player audio is controlled by one shared player provider; do not create an audio element per card.

## 5. State ownership

- Search input/query: Search page and URL.
- Search results/loading/error: Search page or a dedicated hook.
- Current track/queue/playback controls: Player provider.
- Favorites: favorites hook/provider backed by localStorage.
- Playlists: playlists hook/provider backed by localStorage.
- Recently played: history hook/provider backed by localStorage.
- Temporary modal/menu state: nearest component that uses it.

Avoid a global state library until there is a demonstrated need.

## 6. Routing

Suggested routes:
- `/` — discovery home
- `/search?q=...` — search results
- `/track/:trackId` — track details
- `/artist/:artistId` — artist exploration
- `/album/:collectionId` — album details
- `/library` — favorites and playlists

Unknown routes should show a not-found page. Route IDs must be validated before making requests.

## 7. Error model

Services should throw errors with useful messages. UI should distinguish:
- network failure,
- non-success HTTP status,
- invalid/unexpected response,
- no matching results,
- missing preview or artwork.

Do not return an empty array for every error; that makes a failed request look like a successful search with no results.
