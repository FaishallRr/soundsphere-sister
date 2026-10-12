import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchX, Search as SearchIcon } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import TrackCard from '../components/music/TrackCard'
import { TrackCardSkeleton } from '../components/music/Skeletons'
import { SEARCH_DEBOUNCE_MS, SEARCH_LIMIT } from '../constants/app'
import { isAbortError, searchTracks } from '../services/itunesApi'
import type { Track } from '../types/music'

type SortOption = 'relevance' | 'name' | 'artist' | 'duration'

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'name', label: 'Song title' },
  { value: 'artist', label: 'Artist' },
  { value: 'duration', label: 'Duration' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const [inputValue, setInputValue] = useState(query)
  const [tracks, setTracks] = useState<Track[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [retryToken, setRetryToken] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const [lastQuery, setLastQuery] = useState(query)

  // Adjust input during render when the URL changes externally (back/forward, header search).
  // Local typing is preserved because the debounce effect already mirrors it into the URL.
  if (lastQuery !== query) {
    setLastQuery(query)
    if (inputValue.trim() !== query) {
      setInputValue(query)
    }
  }

  // Debounce keystrokes into the URL so results stay shareable and back/forward works.
  useEffect(() => {
    const trimmed = inputValue.trim()
    if (trimmed === query) return

    const timer = setTimeout(() => {
      setSearchParams(trimmed === '' ? {} : { q: trimmed }, { replace: true })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [inputValue, query, setSearchParams])

  useEffect(() => {
    // An empty query renders the idle state in the component body; no request, no state churn.
    if (query === '') return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    async function loadResults() {
      setStatus('loading')
      try {
        const results = await searchTracks(query, {
          limit: SEARCH_LIMIT,
          offset: 0,
          signal: controller.signal,
        })
        setTracks(results)
        setLoadedCount(results.length)
        setStatus('ready')
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage(
          error instanceof Error ? error.message : 'Search failed. Please try again.',
        )
        setStatus('error')
      }
    }

    void loadResults()
    return () => controller.abort()
  }, [query, retryToken])

  const sortedTracks = useMemo(() => {
    if (sortBy === 'relevance') return tracks
    const sorted = [...tracks]
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.trackName.localeCompare(b.trackName))
      case 'artist':
        return sorted.sort((a, b) => a.artistName.localeCompare(b.artistName))
      case 'duration':
        return sorted.sort((a, b) => (a.durationMs ?? 0) - (b.durationMs ?? 0))
      default:
        return sorted
    }
  }, [tracks, sortBy])

  const hasMore = status === 'ready' && loadedCount >= SEARCH_LIMIT && tracks.length === loadedCount

  async function handleLoadMore() {
    if (isLoadingMore || query === '') return
    const controller = new AbortController()
    setIsLoadingMore(true)
    try {
      const more = await searchTracks(query, {
        limit: SEARCH_LIMIT,
        offset: loadedCount,
        signal: controller.signal,
      })
      setTracks((current) => [...current, ...more])
      setLoadedCount((count) => count + more.length)
    } catch (error) {
      if (!isAbortError(error)) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load more results.')
      }
    } finally {
      setIsLoadingMore(false)
    }
  }

  function handleRetry() {
    setRetryToken((token) => token + 1)
  }

  if (query === '') {
    return (
      <EmptyState
        icon={SearchIcon}
        title="Search SoundSphere"
        message="Look up a song, artist, or genre — for example “Radiohead”, “jazz”, or a title you love."
      />
    )
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={handleRetry} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Results for “{query}”</h1>
          <p className="text-sm text-muted">
            {status === 'ready'
              ? `${tracks.length} song${tracks.length === 1 ? '' : 's'} found`
              : 'Searching the catalog…'}
          </p>
        </div>

        {status === 'ready' && tracks.length > 1 ? (
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-lg border border-line bg-card px-2 py-1.5 text-sm text-ink"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          <TrackCardSkeleton count={8} />
        </div>
      ) : sortedTracks.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No results"
          message={`Nothing in the catalog matched “${query}”. Try a different spelling, an artist name, or a genre.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {sortedTracks.map((track, index) => (
              <TrackCard key={track.trackId} track={track} contextTracks={sortedTracks} index={index} />
            ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-card-hover disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
