import { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_SECTION_LIMIT, ROUTES } from '../../constants/app'
import { isAbortError, searchTracks } from '../../services/itunesApi'
import type { Track } from '../../types/music'
import ErrorState from '../feedback/ErrorState'
import TrackCard from './TrackCard'
import { TrackCardSkeleton } from './Skeletons'
import type { GenreSection as GenreSectionConfig } from '../../features/discovery/discoveryConfig'

interface GenreSectionProps {
  section: GenreSectionConfig
  limit?: number
}

export default function GenreSection({ section, limit = HOME_SECTION_LIMIT }: GenreSectionProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const sectionTitleId = `genre-section-${section.id}`

  useEffect(() => {
    const controller = new AbortController()

    async function loadTracks() {
      setStatus('loading')
      try {
        const results = await searchTracks(section.searchTerm, {
          limit,
          signal: controller.signal,
        })
        setTracks(results)
        setStatus('ready')
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage('Could not load this section.')
        setStatus('error')
      }
    }

    void loadTracks()
    return () => controller.abort()
  }, [section.searchTerm, limit, retryToken])

  const handleRetry = useCallback(() => {
    setRetryToken((token) => token + 1)
  }, [])

  return (
    <section aria-labelledby={sectionTitleId}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <span className="mb-1.5 block h-0.5 w-9 rounded-full gradient-cta" aria-hidden="true" />
          <h2 id={sectionTitleId} className="text-lg font-semibold text-ink">
            {section.label}
          </h2>
          <p className="text-xs text-muted">Explore — curated search, not a live ranking.</p>
        </div>
        <Link
          to={`${ROUTES.search}?q=${encodeURIComponent(section.searchTerm)}`}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm text-accent transition-transform hover:translate-x-0.5 hover:underline"
        >
          Explore
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          <TrackCardSkeleton count={limit > 4 ? 4 : limit} />
        </div>
      ) : status === 'error' ? (
        <ErrorState message={errorMessage} onRetry={handleRetry} />
      ) : tracks.length === 0 ? (
        <p className="rounded-xl border border-line bg-card px-4 py-8 text-center text-sm text-muted">
          Nothing found for “{section.label}” right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {tracks.slice(0, limit).map((track, index) => (
            <TrackCard key={track.trackId} track={track} contextTracks={tracks} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}
