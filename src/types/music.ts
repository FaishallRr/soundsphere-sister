export interface Track {
  trackId: number
  trackName: string
  artistId: number | null
  artistName: string
  collectionId: number | null
  collectionName: string | null
  artworkUrl: string | null
  previewUrl: string | null
  durationMs: number | null
  genre: string | null
  trackViewUrl: string | null
}

export interface Album {
  collectionId: number
  collectionName: string
  artistId: number | null
  artistName: string
  artworkUrl: string | null
  trackCount: number | null
  releaseDate: string | null
  genre: string | null
}

export interface Artist {
  artistId: number
  artistName: string
  genre: string | null
}

export interface Playlist {
  id: string
  name: string
  tracks: Track[]
  createdAt: number
  updatedAt: number
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerPreferences {
  volume: number
  repeatMode: RepeatMode
  shuffle: boolean
}
