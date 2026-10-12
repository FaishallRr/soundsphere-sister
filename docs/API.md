# API Integration — iTunes Search API

## 1. Official reference

Apple documentation:
https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html

Review current terms, rate limits, attribution, and permitted use before public deployment. The API is a music catalog/search service, not a full streaming API.

## 2. Endpoints

### Search tracks

```text
GET https://itunes.apple.com/search
  ?term=radiohead
  &media=music
  &entity=song
  &limit=20
  &country=id
```

Useful parameters:
- `term`: search phrase.
- `media=music`: limit search to music media.
- `entity=song`: search for songs.
- `limit`: result count.
- `country`: storefront context.

### Lookup a track

```text
GET https://itunes.apple.com/lookup?id=TRACK_ID&country=id
```

### Lookup an artist and albums

```text
GET https://itunes.apple.com/lookup?id=ARTIST_ID&entity=album&country=id
```

### Search albums

```text
GET https://itunes.apple.com/search?term=radiohead&entity=album&limit=20&country=id
```

Validate the actual response shape for each query type. Do not assume every result has every field.

## 3. Fields to use

Track results may include:
- `trackId`
- `trackName`
- `artistId`
- `artistName`
- `collectionId`
- `collectionName`
- `artworkUrl100`
- `previewUrl`
- `trackTimeMillis`
- `primaryGenreName`
- `trackViewUrl`

Fields can be absent or null. Render defensively.

## 4. URL construction

Use `URL` and `URLSearchParams`, not manual string concatenation.

```js
const ITUNES_URL = "https://itunes.apple.com";

export async function searchTracks(query, { signal } = {}) {
  const url = new URL("/search", ITUNES_URL);
  url.search = new URLSearchParams({
    term: query.trim(),
    media: "music",
    entity: "song",
    limit: "20",
    country: "id",
  });

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Music search failed (${response.status})`);
  }

  const data = await response.json();

  if (!Array.isArray(data.results)) {
    throw new Error("Unexpected music API response");
  }

  return data.results;
}
```

This is a reference example, not a complete service module. Add normalization, request cancellation, and tests as needed.

## 5. Request behavior

- Trim the query and skip requests for empty input.
- Debounce interactive search to avoid a request on every keystroke.
- Abort stale requests with `AbortController`.
- Show loading, empty, and error states separately.
- Keep result limits reasonable.
- Do not assume the API guarantees real-time rankings.
- Do not assume every track has a preview URL.
- Avoid unnecessary repeated requests; cache only if the implementation benefits from it and the cache is bounded.

## 6. Preview audio

Use `previewUrl` only when present and in line with Apple's current terms. Treat it as optional:
- disable play if absent,
- handle media errors,
- reset progress when the source changes,
- clean up listeners,
- prevent multiple audio instances,
- do not download, proxy, or modify content to bypass provider restrictions.

Preview length and availability can vary. Do not market the app as providing full-length streaming.

## 7. Curated discovery vs trending

The API does not provide a dependable global real-time trending endpoint. For Home:
- use curated searches such as Pop, Indie, Rock, and Electronic;
- label them as “Explore” or “Editor's picks” rather than live rankings;
- optionally derive “Popular in your library” from local play history, clearly identifying it as local activity.

## 8. CORS and security

The iTunes Search API is commonly called directly from browser applications, but browser/network behavior should be tested in the target environment. Never place private API secrets in Vite variables: `VITE_*` values are exposed to the browser bundle. If a future provider requires a secret key, move that request behind a backend/serverless function.
