# SoundSphere

> A dark, modern music-discovery web app built with React, Vite, Tailwind CSS, and the iTunes Search API.

SoundSphere helps users discover songs, explore artists and albums, preview available audio, and manage a personal music library. It is a **music discovery experience**, not a full music-streaming service.

## Product goals

- Build a polished UI inspired by the supplied Soundly reference: left navigation, central discovery feed, right-side trending panel, and a persistent bottom player.
- Integrate a real public API with clear loading, empty, and error states.
- Keep code readable, small, and predictable.
- Make Version 2 useful without introducing a backend prematurely.

## Version 2 scope

- Home discovery feed with curated genre searches.
- Search songs and artists.
- Track, artist, and album exploration where API data supports it.
- One shared preview player with queue, previous/next, shuffle, repeat, seek, and volume controls.
- Favorites, local playlists, recently played, and user preferences persisted in `localStorage`.
- Genre-based exploration and lightweight recommendations based on local preferences/history.
- Responsive layout, keyboard/accessibility basics, and robust request handling.

## Tech stack

- React
- Vite
- JavaScript with ES modules
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Router
- iTunes Search API
- Native `fetch`, `HTMLAudioElement`, and `localStorage`
- Lucide React icons (optional)

## Quick start

Use a current Node.js LTS release.

```bash
npm create vite@latest soundsphere -- --template react
cd soundsphere
npm install
npm install react-router-dom lucide-react
npm install tailwindcss @tailwindcss/vite
```

Configure the Vite Tailwind plugin by following the current official guide:
https://tailwindcss.com/docs/installation/using-vite

Then start development:

```bash
npm run dev
```

## Project documentation

- [Product requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API integration](docs/API.md)
- [Code standards](docs/CODE_STANDARDS.md)
- [UI and design system](docs/UI_DESIGN.md)
- [Roadmap](docs/ROADMAP.md)
- [Testing checklist](docs/TESTING.md)
- [AI-assisted development guide](docs/AI_GUIDE.md)

## Important limitations

The iTunes Search API is a catalog/search API, not a full streaming API. Preview URLs may be missing, preview duration/content may vary, and the API does not provide a reliable global real-time trending chart. Trending sections must be labelled as curated/discovery picks unless a suitable licensed chart source is added.

Favorites, playlists, history, and preferences are local to the current browser in Version 2. Clearing browser storage removes them. Cross-device sync requires a backend and database, which are outside this version.

Review Apple's current API documentation and applicable usage terms before deployment:
https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
