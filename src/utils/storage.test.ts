import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Track } from '../types/music'
import {
  isPlayerPreferences,
  isTrackArray,
  readStoredJson,
  writeStoredJson,
} from './storage'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

const originalWindow = globalThis.window

beforeEach(() => {
  ;(globalThis as { window?: unknown }).window = { localStorage: createMemoryStorage() }
})

afterEach(() => {
  ;(globalThis as { window?: unknown }).window = originalWindow
})

describe('readStoredJson', () => {
  it('returns the fallback when the key is missing', () => {
    expect(readStoredJson('missing', () => true, [])).toEqual([])
  })

  it('returns the fallback for corrupted JSON', () => {
    window.localStorage.setItem('broken', '{not json')
    expect(readStoredJson('broken', () => true, ['fallback'])).toEqual(['fallback'])
  })

  it('returns the fallback when validation fails', () => {
    window.localStorage.setItem('invalid', JSON.stringify({ nope: true }))
    expect(readStoredJson('invalid', (value) => Array.isArray(value), [])).toEqual([])
  })

  it('round-trips valid data', () => {
    writeStoredJson('ok', [1, 2, 3])
    expect(readStoredJson('ok', (value) => Array.isArray(value), [])).toEqual([1, 2, 3])
  })
})

describe('writeStoredJson', () => {
  it('reports failure when storage is unavailable', () => {
    ;(globalThis as { window?: unknown }).window = {}
    expect(writeStoredJson('key', { a: 1 })).toBe(false)
  })

  it('returns true on success', () => {
    expect(writeStoredJson('key', { a: 1 })).toBe(true)
  })
})

describe('validators', () => {
  const sampleTrack = {
    trackId: 1,
    trackName: 'Song',
    artistName: 'Artist',
  } as Track

  it('accepts arrays of stored tracks', () => {
    expect(isTrackArray([sampleTrack])).toBe(true)
  })

  it('rejects malformed track arrays', () => {
    expect(isTrackArray([{ trackName: 'Song' }])).toBe(false)
    expect(isTrackArray('nope')).toBe(false)
  })

  it('validates player preferences shape', () => {
    expect(isPlayerPreferences({ volume: 0.5, repeatMode: 'all', shuffle: true })).toBe(true)
    expect(isPlayerPreferences({ volume: 2, repeatMode: 'all', shuffle: true })).toBe(false)
    expect(isPlayerPreferences({ volume: 0.5, repeatMode: 'forever', shuffle: true })).toBe(false)
    expect(isPlayerPreferences(null)).toBe(false)
  })
})
