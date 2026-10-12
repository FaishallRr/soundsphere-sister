/* eslint-disable react-refresh/only-export-components -- provider and hook belong together per project architecture */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Track } from '../../types/music'
import { STORAGE_KEYS } from '../../constants/app'
import { isTrackArray, readStoredJson, writeStoredJson } from '../../utils/storage'

interface FavoritesContextValue {
  favorites: Track[]
  isFavorite: (trackId: number) => boolean
  toggleFavorite: (track: Track) => void
  removeFavorite: (trackId: number) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Track[]>(() =>
    readStoredJson(STORAGE_KEYS.favorites, isTrackArray, []),
  )

  useEffect(() => {
    writeStoredJson(STORAGE_KEYS.favorites, favorites)
  }, [favorites])

  const isFavorite = useCallback(
    (trackId: number) => favorites.some((track) => track.trackId === trackId),
    [favorites],
  )

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.trackId === track.trackId)
      if (exists) {
        return current.filter((item) => item.trackId !== track.trackId)
      }
      // Newest favorites first.
      return [track, ...current]
    })
  }, [])

  const removeFavorite = useCallback((trackId: number) => {
    setFavorites((current) => current.filter((item) => item.trackId !== trackId))
  }, [])

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, isFavorite, toggleFavorite, removeFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}
