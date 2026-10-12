/* eslint-disable react-refresh/only-export-components -- provider and hook belong together per project architecture */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Track } from '../../types/music'
import { MAX_HISTORY_ITEMS, STORAGE_KEYS } from '../../constants/app'
import { isTrackArray, readStoredJson, writeStoredJson } from '../../utils/storage'

interface RecentlyPlayedContextValue {
  history: Track[]
  recordPlay: (track: Track) => void
  clearHistory: () => void
}

const RecentlyPlayedContext = createContext<RecentlyPlayedContextValue | null>(null)

// Keep only the latest entries to prevent unbounded local storage growth.
export function limitHistory(tracks: Track[], maxItems = MAX_HISTORY_ITEMS): Track[] {
  return tracks.slice(0, maxItems)
}

export function RecentlyPlayedProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Track[]>(() =>
    readStoredJson(STORAGE_KEYS.recentlyPlayed, isTrackArray, []),
  )

  useEffect(() => {
    writeStoredJson(STORAGE_KEYS.recentlyPlayed, history)
  }, [history])

  const recordPlay = useCallback((track: Track) => {
    setHistory((current) => {
      const withoutDuplicate = current.filter((item) => item.trackId !== track.trackId)
      return limitHistory([track, ...withoutDuplicate])
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const value = useMemo(() => ({ history, recordPlay, clearHistory }), [history, recordPlay, clearHistory])

  return <RecentlyPlayedContext.Provider value={value}>{children}</RecentlyPlayedContext.Provider>
}

export function useRecentlyPlayed(): RecentlyPlayedContextValue {
  const context = useContext(RecentlyPlayedContext)
  if (!context) {
    throw new Error('useRecentlyPlayed must be used within RecentlyPlayedProvider')
  }
  return context
}
