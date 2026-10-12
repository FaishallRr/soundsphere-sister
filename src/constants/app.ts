export const ITUNES_BASE_URL = 'https://itunes.apple.com'

export const SEARCH_LIMIT = 20

export const HOME_SECTION_LIMIT = 10

export const MAX_HISTORY_ITEMS = 30

export const SEARCH_DEBOUNCE_MS = 300

export const PLAYLIST_NAME_MAX_LENGTH = 60

export const STORAGE_KEYS = {
  favorites: 'soundsphere:v1:favorites',
  playlists: 'soundsphere:v1:playlists',
  recentlyPlayed: 'soundsphere:v1:recently-played',
  playerPreferences: 'soundsphere:v1:player-preferences',
} as const

export const ROUTES = {
  home: '/',
  search: '/search',
  track: (trackId: number | string) => `/track/${trackId}`,
  artist: (artistId: number | string) => `/artist/${artistId}`,
  album: (collectionId: number | string) => `/album/${collectionId}`,
  library: '/library',
} as const
