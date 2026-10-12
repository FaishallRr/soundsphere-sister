import type { Album, Artist, Track } from '../types/music'

function asNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function asString(value: unknown, fallback: string): string {
  return asStringOrNull(value) ?? fallback
}

// Request larger artwork than the 100px default the API returns.
function upgradeArtworkUrl(url: string | null): string | null {
  if (!url) return null
  return url.replace(/\/\d+x\d+bb\.jpg/, '/400x400bb.jpg')
}

export function normalizeTrack(raw: unknown): Track | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>

  const trackId = asNumberOrNull(record.trackId)
  if (trackId === null) return null

  return {
    trackId,
    trackName: asString(record.trackName, 'Unknown track'),
    artistId: asNumberOrNull(record.artistId),
    artistName: asString(record.artistName, 'Unknown artist'),
    collectionId: asNumberOrNull(record.collectionId),
    collectionName: asStringOrNull(record.collectionName),
    artworkUrl: upgradeArtworkUrl(asStringOrNull(record.artworkUrl100)),
    previewUrl: asStringOrNull(record.previewUrl),
    durationMs: asNumberOrNull(record.trackTimeMillis),
    genre: asStringOrNull(record.primaryGenreName),
    trackViewUrl: asStringOrNull(record.trackViewUrl),
  }
}

export function normalizeAlbum(raw: unknown): Album | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>

  const collectionId = asNumberOrNull(record.collectionId)
  if (collectionId === null) return null

  return {
    collectionId,
    collectionName: asString(record.collectionName, 'Unknown album'),
    artistId: asNumberOrNull(record.artistId),
    artistName: asString(record.artistName, 'Unknown artist'),
    artworkUrl: upgradeArtworkUrl(asStringOrNull(record.artworkUrl100)),
    trackCount: asNumberOrNull(record.trackCount),
    releaseDate: asStringOrNull(record.releaseDate),
    genre: asStringOrNull(record.primaryGenreName),
  }
}

// Song and collection rows also carry an artistId, so only accept artist-shaped rows.
export function normalizeArtist(raw: unknown): Artist | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>

  const artistId = asNumberOrNull(record.artistId)
  if (artistId === null) return null
  if (record.trackId !== undefined || record.collectionId !== undefined) return null
  if (record.wrapperType !== undefined && record.wrapperType !== 'artist') return null

  return {
    artistId,
    artistName: asString(record.artistName, 'Unknown artist'),
    genre: asStringOrNull(record.primaryGenreName),
  }
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null
}
