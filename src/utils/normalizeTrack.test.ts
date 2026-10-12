import { describe, expect, it } from 'vitest'
import { normalizeAlbum, normalizeArtist, normalizeTrack } from './normalizeTrack'

describe('normalizeTrack', () => {
  it('returns null for non-object input', () => {
    expect(normalizeTrack(null)).toBeNull()
    expect(normalizeTrack('track')).toBeNull()
    expect(normalizeTrack(undefined)).toBeNull()
  })

  it('returns null when trackId is missing', () => {
    expect(normalizeTrack({ trackName: 'Song', artistName: 'Artist' })).toBeNull()
    expect(normalizeTrack({ trackId: 'not-a-number' })).toBeNull()
  })

  it('normalizes a full API row and upgrades artwork size', () => {
    const track = normalizeTrack({
      trackId: 123,
      trackName: 'Test Song',
      artistId: 456,
      artistName: 'Test Artist',
      collectionId: 789,
      collectionName: 'Test Album',
      artworkUrl100: 'https://example.com/art/100x100bb.jpg',
      previewUrl: 'https://example.com/preview.m4a',
      trackTimeMillis: 200_000,
      primaryGenreName: 'Indie',
      trackViewUrl: 'https://example.com/track',
    })

    expect(track).not.toBeNull()
    expect(track?.trackId).toBe(123)
    expect(track?.artworkUrl).toBe('https://example.com/art/400x400bb.jpg')
    expect(track?.previewUrl).toBe('https://example.com/preview.m4a')
    expect(track?.durationMs).toBe(200_000)
    expect(track?.genre).toBe('Indie')
  })

  it('fills optional fields with safe fallbacks', () => {
    const track = normalizeTrack({ trackId: 1 })

    expect(track).not.toBeNull()
    expect(track?.trackName).toBe('Unknown track')
    expect(track?.artistName).toBe('Unknown artist')
    expect(track?.previewUrl).toBeNull()
    expect(track?.artworkUrl).toBeNull()
    expect(track?.durationMs).toBeNull()
  })
})

describe('normalizeAlbum', () => {
  it('returns null without a collectionId', () => {
    expect(normalizeAlbum({ collectionName: 'Album' })).toBeNull()
  })

  it('normalizes album fields defensively', () => {
    const album = normalizeAlbum({
      wrapperType: 'collection',
      collectionId: 42,
      collectionName: 'Album',
      artistId: 7,
      artistName: 'Artist',
      artworkUrl100: 'https://example.com/50x50bb.jpg',
      trackCount: 12,
      releaseDate: '2020-01-01T08:00:00Z',
      primaryGenreName: 'Pop',
    })

    expect(album?.collectionId).toBe(42)
    expect(album?.artworkUrl).toBe('https://example.com/400x400bb.jpg')
    expect(album?.trackCount).toBe(12)
  })
})

describe('normalizeArtist', () => {
  it('rejects song rows that only carry an artistId', () => {
    expect(normalizeArtist({ artistId: 9, trackId: 1, artistName: 'Artist' })).toBeNull()
    expect(normalizeArtist({ artistId: 9, collectionId: 2, artistName: 'Artist' })).toBeNull()
  })

  it('accepts artist-shaped rows', () => {
    const artist = normalizeArtist({
      wrapperType: 'artist',
      artistId: 9,
      artistName: 'Artist',
      primaryGenreName: 'Rock',
    })

    expect(artist).toEqual({ artistId: 9, artistName: 'Artist', genre: 'Rock' })
  })
})
