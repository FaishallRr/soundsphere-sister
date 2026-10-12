import { useEffect, useState } from 'react'
import { Compass, Sparkles, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { EDITORS_PICKS_TERM } from '../../features/discovery/discoveryConfig'
import type { Track } from '../../types/music'
import { useFavorites } from '../../features/favorites/useFavorites'
import { useRecentlyPlayed } from '../../features/history/useRecentlyPlayed'
import { isAbortError, searchTracks } from '../../services/itunesApi'
import { TrackRowSkeleton } from '../music/Skeletons'
import { formatDuration } from '../../utils/formatDuration'

export default function RightPanel() {
  const [picks, setPicks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { favorites } = useFavorites()
  const { history } = useRecentlyPlayed()

  useEffect(() => {
    const controller = new AbortController()

    async function loadPicks() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const tracks = await searchTracks(EDITORS_PICKS_TERM, { limit: 5, signal: controller.signal })
        setPicks(tracks)
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage('Could not load picks right now.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadPicks()
    return () => controller.abort()
  }, [])

  // Local activity only — never presented as a global ranking.
  const activeArtists = [...favorites, ...history]
    .filter((track) => track.artistId !== null)
    .reduce<Array<{ artistId: number; artistName: string; count: number }>>((accumulator, track) => {
      const existing = accumulator.find((item) => item.artistId === track.artistId)
      if (existing) {
        existing.count += 1
      } else if (track.artistId !== null) {
        accumulator.push({ artistId: track.artistId, artistName: track.artistName, count: 1 })
      }
      return accumulator
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <aside
      className="w-full shrink-0 space-y-6 xl:sticky xl:top-24 xl:w-80"
      aria-label="Discovery panel"
    >
      <section className="glass rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          Editor's picks
        </h2>
        <p className="mt-1 text-xs text-muted">Curated discovery picks, not a live chart.</p>

        {isLoading ? (
          <div className="mt-3">
            <TrackRowSkeleton count={3} />
          </div>
        ) : errorMessage ? (
          <p className="mt-3 text-xs text-danger" role="alert">
            {errorMessage}
          </p>
        ) : picks.length === 0 ? (
          <p className="mt-3 text-xs text-muted">No picks available right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {picks.map((track) => (
              <li key={track.trackId}>
                <Link
                  to={ROUTES.track(track.trackId)}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-card-hover"
                >
                  {track.artworkUrl ? (
                    <img src={track.artworkUrl} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-card-hover text-muted" aria-hidden="true">
                      <Compass className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{track.trackName}</p>
                    <p className="truncate text-xs text-muted">{track.artistName}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {formatDuration(track.durationMs)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeArtists.length > 0 ? (
        <section className="glass rounded-2xl p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <User className="h-4 w-4 text-accent-2" aria-hidden="true" />
            In your orbit
          </h2>
          <p className="mt-1 text-xs text-muted">Artists from your favorites and recent plays.</p>
          <ul className="mt-3 space-y-1">
            {activeArtists.map((artist) => (
              <li key={artist.artistId}>
                <Link
                  to={ROUTES.artist(artist.artistId)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-ink transition-colors hover:bg-card-hover"
                >
                  <span className="truncate">{artist.artistName}</span>
                  <span className="shrink-0 text-xs text-muted">{artist.count} saved</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  )
}
