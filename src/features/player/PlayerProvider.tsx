/* eslint-disable react-refresh/only-export-components -- provider and hook belong together per project architecture */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { PlayerPreferences, RepeatMode, Track } from '../../types/music'
import { STORAGE_KEYS } from '../../constants/app'
import { isPlayerPreferences, readStoredJson, writeStoredJson } from '../../utils/storage'
import { useRecentlyPlayed } from '../history/useRecentlyPlayed'

const DEFAULT_PREFERENCES: PlayerPreferences = {
  volume: 0.8,
  repeatMode: 'off',
  shuffle: false,
}

interface PlayerContextValue {
  queue: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeatMode: RepeatMode
  isShuffling: boolean
  errorMessage: string | null
  hasUpcoming: boolean
  playFromQueue: (tracks: Track[], startIndex?: number) => void
  playTrackInQueue: (trackId: number) => void
  togglePlay: () => void
  playNext: () => void
  playPrevious: () => void
  seek: (timeSeconds: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  cycleRepeatMode: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

function loadPreferences(): PlayerPreferences {
  return readStoredJson(STORAGE_KEYS.playerPreferences, isPlayerPreferences, DEFAULT_PREFERENCES)
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { recordPlay } = useRecentlyPlayed()

  const [preferences, setPreferences] = useState<PlayerPreferences>(loadPreferences)
  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Track[]>(queue)
  const indexRef = useRef(currentIndex)
  const currentTrackRef = useRef<Track | null>(null)
  const repeatModeRef = useRef<RepeatMode>(preferences.repeatMode)
  const isShufflingRef = useRef(false)
  const shouldResumeRef = useRef(false)

  const currentTrack = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null

  // Mirror state into refs for event handlers and long-lived closures.
  useEffect(() => {
    queueRef.current = queue
    indexRef.current = currentIndex
    currentTrackRef.current = currentTrack
    repeatModeRef.current = preferences.repeatMode
    isShufflingRef.current = preferences.shuffle
  })

  useEffect(() => {
    writeStoredJson(STORAGE_KEYS.playerPreferences, preferences)
  }, [preferences])

  const advanceTrack = useCallback((direction: 1 | -1, forceContinue = false): boolean => {
    const currentQueue = queueRef.current
    const index = indexRef.current
    if (currentQueue.length === 0 || index < 0) return false

    let nextIndex: number
    if (isShufflingRef.current && currentQueue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * currentQueue.length)
      } while (nextIndex === index)
    } else {
      nextIndex = index + direction
    }

    if (nextIndex >= currentQueue.length) {
      if (repeatModeRef.current === 'all' || forceContinue) {
        nextIndex = 0
      } else {
        return false
      }
    }
    if (nextIndex < 0) {
      nextIndex = repeatModeRef.current === 'all' ? currentQueue.length - 1 : 0
    }

    shouldResumeRef.current = true
    setCurrentIndex(nextIndex)
    return true
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handlePlaying = () => {
      setIsPlaying(true)
      setErrorMessage(null)
      // The 'playing' event fires only when audio actually starts — the honest
      // moment to record history, not merely on card click.
      const track = currentTrackRef.current
      if (track) recordPlay(track)
    }
    const handlePause = () => {
      setIsPlaying(false)
    }
    const handleEnded = () => {
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0
        void audio.play().catch(() => {
          setIsPlaying(false)
          setErrorMessage('This preview could not be played.')
        })
        return
      }
      const advanced = advanceTrack(1, true)
      if (!advanced) setIsPlaying(false)
    }
    const handleError = () => {
      if (!audio.getAttribute('src')) return
      setIsPlaying(false)
      setErrorMessage('This preview could not be played.')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [advanceTrack, recordPlay])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const track = queue[currentIndex]
    setCurrentTime(0)
    setDuration(0)

    if (!track?.previewUrl) {
      // Pause fires the audio 'pause' event, which keeps isPlaying in sync
      // without setting state directly in this effect.
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return
    }

    audio.src = track.previewUrl
    audio.volume = preferences.volume

    if (shouldResumeRef.current) {
      shouldResumeRef.current = false
      void audio.play().catch(() => {
        setIsPlaying(false)
        setErrorMessage('This preview could not be played.')
      })
    }
  }, [queue, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const playFromQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return
    const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1)
    shouldResumeRef.current = true
    setErrorMessage(tracks[safeIndex]?.previewUrl ? null : 'No preview is available for this track.')
    setQueue(tracks)
    setCurrentIndex(safeIndex)
  }, [])

  const playTrackInQueue = useCallback((trackId: number) => {
    const index = queueRef.current.findIndex((track) => track.trackId === trackId)
    if (index < 0) return
    shouldResumeRef.current = true
    setErrorMessage(null)
    setCurrentIndex(index)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    const track = currentTrackRef.current
    if (!audio || !track) return

    if (!track.previewUrl) {
      setErrorMessage('No preview is available for this track.')
      return
    }

    if (!audio.getAttribute('src')) {
      // Track was selected earlier but its source was cleared; restore it.
      audio.src = track.previewUrl
      audio.volume = preferences.volume
    }

    if (audio.paused) {
      void audio.play().catch(() => {
        setIsPlaying(false)
        setErrorMessage('This preview could not be played.')
      })
    } else {
      audio.pause()
    }
  }, [preferences.volume])

  const playNext = useCallback(() => {
    advanceTrack(1)
  }, [advanceTrack])

  const playPrevious = useCallback(() => {
    const audio = audioRef.current
    // Standard player behavior: restart the track when more than a few seconds in.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    advanceTrack(-1)
  }, [advanceTrack])

  const seek = useCallback((timeSeconds: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(timeSeconds)) return
    const clamped = Math.min(Math.max(timeSeconds, 0), audio.duration || timeSeconds)
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.min(Math.max(volume, 0), 1)
    setPreferences((current) => ({ ...current, volume: clamped }))
    const audio = audioRef.current
    if (audio) audio.volume = clamped
  }, [])

  const toggleShuffle = useCallback(() => {
    setPreferences((current) => ({ ...current, shuffle: !current.shuffle }))
  }, [])

  const cycleRepeatMode = useCallback(() => {
    setPreferences((current) => {
      const order: RepeatMode[] = ['off', 'all', 'one']
      const next = order[(order.indexOf(current.repeatMode) + 1) % order.length]
      return { ...current, repeatMode: next }
    })
  }, [])

  const value = useMemo(
    () => ({
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume: preferences.volume,
      repeatMode: preferences.repeatMode,
      isShuffling: preferences.shuffle,
      errorMessage,
      hasUpcoming: queue.length > 1,
      playFromQueue,
      playTrackInQueue,
      togglePlay,
      playNext,
      playPrevious,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeatMode,
    }),
    [
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      preferences,
      errorMessage,
      playFromQueue,
      playTrackInQueue,
      togglePlay,
      playNext,
      playPrevious,
      seek,
      setVolume,
      toggleShuffle,
      cycleRepeatMode,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider')
  }
  return context
}
