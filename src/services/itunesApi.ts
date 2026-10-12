import { ITUNES_BASE_URL, SEARCH_LIMIT } from '../constants/app'
import type { Album, Artist, Track } from '../types/music'
import {
  isNotNull,
  normalizeAlbum,
  normalizeArtist,
  normalizeTrack,
} from '../utils/normalizeTrack'

export class ItunesRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ItunesRequestError'
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

interface FetchOptions {
  signal?: AbortSignal
}

interface PagedOptions extends FetchOptions {
  limit?: number
  offset?: number
}

async function requestJson(url: URL, signal?: AbortSignal): Promise<unknown[]> {
  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ItunesRequestError('Could not reach the music service. Check your connection.')
  }

  if (!response.ok) {
    throw new ItunesRequestError(`Music request failed (${response.status})`)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new ItunesRequestError('The music service returned an unexpected response.')
  }

  if (!data || typeof data !== 'object' || !Array.isArray((data as { results?: unknown }).results)) {
    throw new ItunesRequestError('The music service returned an unexpected response.')
  }

  return (data as { results: unknown[] }).results
}

function buildUrl(path: string, params: Record<string, string>): URL {
  const url = new URL(path, ITUNES_BASE_URL)
  url.search = new URLSearchParams(params).toString()
  return url
}

export async function searchTracks(term: string, options: PagedOptions = {}): Promise<Track[]> {
  const query = term.trim()
  if (query === '') return []

  const url = buildUrl('/search', {
    term: query,
    media: 'music',
    entity: 'song',
    limit: String(options.limit ?? SEARCH_LIMIT),
    offset: String(options.offset ?? 0),
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return results.map(normalizeTrack).filter(isNotNull)
}

export async function searchAlbums(term: string, options: PagedOptions = {}): Promise<Album[]> {
  const query = term.trim()
  if (query === '') return []

  const url = buildUrl('/search', {
    term: query,
    media: 'music',
    entity: 'album',
    limit: String(options.limit ?? SEARCH_LIMIT),
    offset: String(options.offset ?? 0),
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return results.map(normalizeAlbum).filter(isNotNull)
}

export async function getTrackById(trackId: number, options: FetchOptions = {}): Promise<Track | null> {
  if (!Number.isInteger(trackId) || trackId <= 0) {
    throw new ItunesRequestError('Invalid track id')
  }

  const url = buildUrl('/lookup', {
    id: String(trackId),
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return results.map(normalizeTrack).find(isNotNull) ?? null
}

export async function lookupArtistWithAlbums(
  artistId: number,
  options: FetchOptions = {},
): Promise<{ artist: Artist | null; albums: Album[] }> {
  if (!Number.isInteger(artistId) || artistId <= 0) {
    throw new ItunesRequestError('Invalid artist id')
  }

  const url = buildUrl('/lookup', {
    id: String(artistId),
    entity: 'album',
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return {
    artist: results.map(normalizeArtist).find(isNotNull) ?? null,
    albums: results.map(normalizeAlbum).filter(isNotNull),
  }
}

export async function lookupSongsByArtist(
  artistId: number,
  options: PagedOptions = {},
): Promise<Track[]> {
  if (!Number.isInteger(artistId) || artistId <= 0) {
    throw new ItunesRequestError('Invalid artist id')
  }

  const url = buildUrl('/lookup', {
    id: String(artistId),
    entity: 'song',
    limit: String(options.limit ?? SEARCH_LIMIT),
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return results.map(normalizeTrack).filter(isNotNull)
}

export async function getAlbumWithTracks(
  collectionId: number,
  options: FetchOptions = {},
): Promise<{ album: Album | null; tracks: Track[] }> {
  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    throw new ItunesRequestError('Invalid album id')
  }

  const url = buildUrl('/lookup', {
    id: String(collectionId),
    entity: 'song',
    country: 'id',
  })

  const results = await requestJson(url, options.signal)
  return {
    album: results.map(normalizeAlbum).find(isNotNull) ?? null,
    tracks: results.map(normalizeTrack).filter(isNotNull),
  }
}
