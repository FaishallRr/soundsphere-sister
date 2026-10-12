import { useCallback, useEffect, useMemo, useState } from 'react'
import { Compass, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_SECTION_LIMIT, ROUTES } from '../constants/app'
import GenreSection from '../components/music/GenreSection'
import TrackCard from '../components/music/TrackCard'
import { TrackCardSkeleton } from '../components/music/Skeletons'
import ErrorState from '../components/feedback/ErrorState'
import {
  DISCOVERY_SECTIONS,
  FEATURED_SECTION,
  MORE_GENRE_CHIPS,
  describeRecommendation,
} from '../features/discovery/discoveryConfig'
import { useFavorites } from '../features/favorites/useFavorites'
import { useRecentlyPlayed } from '../features/history/useRecentlyPlayed'
import { isAbortError, searchTracks } from '../services/itunesApi'
import type { Track } from '../types/music'

function useSearchSection(term: string, limit: number) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    // Empty term means "no section data needed"; callers already hide the UI.
    if (term === '') return

    const controller = new AbortController()

    async function loadTracks() {
      setStatus('loading')
      try {
        const results = await searchTracks(term, { limit, signal: controller.signal })
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
  }, [term, limit, retryToken])

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])
  return { tracks, status, errorMessage, retry }
}

function FeaturedBanner() {
  const { tracks, status, errorMessage, retry } = useSearchSection(FEATURED_SECTION.searchTerm, 4)

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent/25 via-card to-accent-2/15 p-6 sm:p-8"
    >
      {/* Floating ambient orbs — decorative only, disabled with reduced motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-14 h-44 w-44 animate-float rounded-full bg-accent/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 animate-float rounded-full bg-accent-2/25 blur-3xl"
        style={{ animationDelay: '1.4s' }}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            {FEATURED_SECTION.label}
          </p>
          <h1 id="featured-heading" className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {FEATURED_SECTION.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">{FEATURED_SECTION.subtitle}</p>
        </div>
        <Link
          to={`${ROUTES.search}?q=${encodeURIComponent(FEATURED_SECTION.searchTerm)}`}
          className="gradient-cta rounded-full px-5 py-2.5 text-sm font-medium text-app shadow-[0_0_24px_rgba(167,139,250,0.45)] transition-transform hover:scale-105"
        >
          Start exploring
        </Link>
      </div>

      <div className="relative mt-5">
        {status === 'loading' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TrackCardSkeleton count={4} />
          </div>
        ) : status === 'error' ? (
          <ErrorState message={errorMessage} onRetry={retry} />
        ) : tracks.length === 0 ? (
          <p className="rounded-xl bg-card/60 px-4 py-6 text-center text-sm text-muted">
            Featured picks are unavailable right now — try search instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tracks.map((track, index) => (
              <TrackCard key={track.trackId} track={track} contextTracks={tracks} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RecentlyPlayedSection() {
  const { history } = useRecentlyPlayed()
  if (history.length === 0) return null

  const tracks = history.slice(0, 10)

  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="mb-1.5 block h-0.5 w-9 rounded-full gradient-cta" aria-hidden="true" />
          <h2 id="recent-heading" className="text-lg font-semibold text-ink">
            Recently played
          </h2>
        </div>
        <Link to={`${ROUTES.library}?tab=history`} className="text-sm text-accent hover:underline">
          View history
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tracks.map((track, index) => (
          <TrackCard key={track.trackId} track={track} contextTracks={tracks} index={index} />
        ))}
      </div>
    </section>
  )
}

function RecommendationsSection() {
  const { favorites } = useFavorites()
  const { history } = useRecentlyPlayed()

  const profile = useMemo(() => {
    const activity = [...favorites, ...history]
    if (activity.length === 0) return { genreTerm: null, artistTerm: null }

    const genreCounts = new Map<string, number>()
    const artistCounts = new Map<string, number>()
    for (const track of activity) {
      if (track.genre) {
        genreCounts.set(track.genre, (genreCounts.get(track.genre) ?? 0) + 1)
      }
      artistCounts.set(track.artistName, (artistCounts.get(track.artistName) ?? 0) + 1)
    }

    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    const topArtist = [...artistCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    return { genreTerm: topGenre, artistTerm: topArtist }
  }, [favorites, history])

  const searchTerm = profile.artistTerm ?? profile.genreTerm
  const description = describeRecommendation(profile)
  const { tracks, status, errorMessage, retry } = useSearchSection(
    searchTerm ? `${searchTerm}` : '',
    HOME_SECTION_LIMIT,
  )

  if (!description || !searchTerm) return null

  return (
    <section aria-labelledby="recommended-heading">
      <div className="mb-3">
        <span className="mb-1.5 block h-0.5 w-9 rounded-full gradient-cta" aria-hidden="true" />
        <h2 id="recommended-heading" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-accent-2" aria-hidden="true" />
          Based on your activity
        </h2>
        <p className="text-xs text-muted">{description}</p>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <TrackCardSkeleton count={5} />
        </div>
      ) : status === 'error' ? (
        <ErrorState message={errorMessage} onRetry={retry} />
      ) : tracks.length === 0 ? (
        <p className="rounded-xl border border-line bg-card px-4 py-6 text-center text-sm text-muted">
          No recommendations available for this profile yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tracks.map((track, index) => (
            <TrackCard key={track.trackId} track={track} contextTracks={tracks} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

function GenreChips() {
  return (
    <section aria-labelledby="explore-heading">
      <span className="mb-1.5 block h-0.5 w-9 rounded-full gradient-cta" aria-hidden="true" />
      <h2 id="explore-heading" className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
        <TrendingUp className="h-5 w-5 text-accent" aria-hidden="true" />
        Explore more genres
      </h2>
      <div className="flex flex-wrap gap-2">
        {MORE_GENRE_CHIPS.map((chip) => (
          <Link
            key={chip.id}
            to={`${ROUTES.search}?q=${encodeURIComponent(chip.searchTerm)}`}
            className="glass rounded-full px-4 py-2 text-sm text-ink transition-all hover:border-accent/40 hover:text-accent hover:shadow-[0_0_18px_rgba(167,139,250,0.28)]"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <FeaturedBanner />
      <RecentlyPlayedSection />
      <RecommendationsSection />
      {DISCOVERY_SECTIONS.map((section) => (
        <GenreSection key={section.id} section={section} />
      ))}
      <GenreChips />
    </div>
  )
}
