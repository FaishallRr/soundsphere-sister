# Code Standards — SoundSphere

The goal is code that is concise, explicit, testable, and easy for another developer to maintain. “Senior-level” code is not code with the fewest characters; it is code with clear responsibilities and predictable behavior.

## 1. General rules

- Use JavaScript ES modules and functional React components.
- Use descriptive names; avoid unexplained abbreviations.
- Prefer `const`; use `let` only when reassignment is required.
- Keep functions focused on one job.
- Extract logic when it is reused or makes a component hard to read.
- Avoid premature abstraction and unnecessary dependencies.
- Do not use `any` (this project is JavaScript; avoid untyped escape hatches if TypeScript is adopted later).
- Never swallow errors silently.
- Do not use array indexes as keys when a stable ID exists.
- Avoid giant components and giant “utils” files.
- Do not put fetch logic inside reusable display cards.
- Do not create a custom hook for a single trivial expression.

## 2. Naming

- Components: `PascalCase` — `TrackCard.jsx`.
- Hooks: `useCamelCase` — `useFavorites.js`.
- Functions/variables: `camelCase` — `searchTracks`, `currentTrack`.
- Constants: `UPPER_SNAKE_CASE` for true fixed constants — `MAX_HISTORY_ITEMS`.
- Booleans: name as a question/state — `isLoading`, `hasPreview`, `isFavorite`.
- Event handlers: `handle` prefix — `handlePlay`, `handleSearch`.
- API methods: action + resource — `searchTracks`, `getTrackById`.

Avoid vague names such as `data`, `item`, `obj`, `temp`, `stuff`, or `res` when a domain name is clearer. Short names are acceptable for very small scopes, e.g. `event` or `id`.

## 3. Component design

- Keep components focused on one visual or behavioral responsibility.
- Pass only the props a component needs.
- Keep conditional rendering readable.
- Use early returns for distinct loading/error/empty states.
- Do not use nested ternaries for complex UI.
- Avoid prop drilling through many unrelated layers; use context only when state is genuinely shared.
- Every visible button/control must perform its labelled action or be disabled with a reason.

## 4. API code

- Keep endpoint construction in `services/`.
- Check `response.ok`.
- Validate expected response structure.
- Normalize data once at the API boundary where useful.
- Pass `AbortSignal` through service functions.
- Do not treat API failure as an empty successful response.
- Keep provider-specific field names out of most UI components when a normalized model is practical.

## 5. State and effects

- Store only state needed to render or control behavior.
- Derive values instead of duplicating them in state.
- Keep effect dependencies correct; do not suppress warnings without a documented reason.
- Clean up event listeners, timers, and media resources.
- Prevent stale async responses from overwriting newer state.
- Keep the audio element centralized.
- Persist data through shared storage utilities rather than duplicating parsing code.

## 6. Storage

- Use versioned keys, e.g. `soundsphere:v1:favorites`.
- Wrap JSON parsing in `try/catch`.
- Validate parsed data before using it.
- Handle unavailable storage gracefully.
- Store only fields needed for the local feature.
- Set a maximum size for history.
- Do not store secrets or sensitive personal data in localStorage.

## 7. Styling

- Use Tailwind utilities consistently.
- Extract a component when repeated markup becomes meaningful.
- Avoid arbitrary values everywhere; define a small design system.
- Use semantic HTML and visible focus styles.
- Avoid hard-coded fixed widths that break mobile layouts.
- Keep motion subtle and respect reduced-motion preferences.

## 8. Comments

Write comments to explain **why**, not narrate obvious code.

Good:
```js
// Keep only the latest 30 entries to prevent unbounded local storage growth.
```

Not useful:
```js
// Set the title variable to the title.
```

## 9. Definition of done

Before a feature is complete:
- it works on success, empty, and failure paths;
- loading and interaction states are clear;
- mobile layout is usable;
- no console errors or avoidable warnings remain;
- names and responsibilities are clear;
- manual test steps are recorded;
- documentation is updated if behavior or setup changed.
