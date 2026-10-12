/* eslint-disable react-refresh/only-export-components -- provider and hook belong together per project architecture */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Playlist, Track } from '../../types/music'
import { PLAYLIST_NAME_MAX_LENGTH, STORAGE_KEYS } from '../../constants/app'
import { isStoredTrack, readStoredJson, writeStoredJson } from '../../utils/storage'

interface PlaylistsContextValue {
  playlists: Playlist[]
  getPlaylist: (playlistId: string) => Playlist | undefined
  createPlaylist: (name: string) => Playlist | null
  renamePlaylist: (playlistId: string, name: string) => boolean
  deletePlaylist: (playlistId: string) => void
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: number) => void
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null)

export function sanitizePlaylistName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, PLAYLIST_NAME_MAX_LENGTH)
}

function isStoredPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    Array.isArray(record.tracks) &&
    record.tracks.every(isStoredTrack)
  )
}

function isPlaylistArray(value: unknown): value is Playlist[] {
  return Array.isArray(value) && value.every(isStoredPlaylist)
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() =>
    readStoredJson(STORAGE_KEYS.playlists, isPlaylistArray, []),
  )

  useEffect(() => {
    writeStoredJson(STORAGE_KEYS.playlists, playlists)
  }, [playlists])

  const getPlaylist = useCallback(
    (playlistId: string) => playlists.find((playlist) => playlist.id === playlistId),
    [playlists],
  )

  const createPlaylist = useCallback((name: string): Playlist | null => {
    const sanitizedName = sanitizePlaylistName(name)
    if (sanitizedName === '') return null

    const now = Date.now()
    const playlist: Playlist = {
      id: createId(),
      name: sanitizedName,
      tracks: [],
      createdAt: now,
      updatedAt: now,
    }
    setPlaylists((current) => [playlist, ...current])
    return playlist
  }, [])

  const renamePlaylist = useCallback((playlistId: string, name: string): boolean => {
    const sanitizedName = sanitizePlaylistName(name)
    if (sanitizedName === '') return false

    let renamed = false
    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist
        renamed = true
        return { ...playlist, name: sanitizedName, updatedAt: Date.now() }
      }),
    )
    return renamed
  }, [])

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId))
  }, [])

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist
        if (playlist.tracks.some((item) => item.trackId === track.trackId)) return playlist
        return { ...playlist, tracks: [...playlist.tracks, track], updatedAt: Date.now() }
      }),
    )
  }, [])

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: number) => {
    setPlaylists((current) =>
      current.map((playlist) => {
        if (playlist.id !== playlistId) return playlist
        return {
          ...playlist,
          tracks: playlist.tracks.filter((track) => track.trackId !== trackId),
          updatedAt: Date.now(),
        }
      }),
    )
  }, [])

  const value = useMemo(
    () => ({
      playlists,
      getPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
    }),
    [
      playlists,
      getPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
    ],
  )

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>
}

export function usePlaylists(): PlaylistsContextValue {
  const context = useContext(PlaylistsContext)
  if (!context) {
    throw new Error('usePlaylists must be used within PlaylistsProvider')
  }
  return context
}
