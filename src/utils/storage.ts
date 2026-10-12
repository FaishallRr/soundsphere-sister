import type { PlayerPreferences, RepeatMode, Track } from '../types/music'

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage ?? null
  } catch {
    return null
  }
}

export function readStoredJson<T>(key: string, validate: (value: unknown) => boolean, fallback: T): T {
  const storage = getLocalStorage()
  if (!storage) return fallback

  try {
    const raw = storage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!validate(parsed)) return fallback
    return parsed as T
  } catch {
    // Corrupted or unreadable storage must never break the app.
    return fallback
  }
}

export function writeStoredJson(key: string, value: unknown): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Quota exceeded or storage disabled: feature keeps working in memory.
    return false
  }
}

export function isStoredTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.trackId === 'number' &&
    typeof record.trackName === 'string' &&
    typeof record.artistName === 'string'
  )
}

export function isTrackArray(value: unknown): value is Track[] {
  return Array.isArray(value) && value.every(isStoredTrack)
}

export function isRepeatMode(value: unknown): value is RepeatMode {
  return value === 'off' || value === 'all' || value === 'one'
}

export function isPlayerPreferences(value: unknown): value is PlayerPreferences {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.volume === 'number' &&
    record.volume >= 0 &&
    record.volume <= 1 &&
    isRepeatMode(record.repeatMode) &&
    typeof record.shuffle === 'boolean'
  )
}
