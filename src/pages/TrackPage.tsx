import { useCallback, useEffect, useState } from 'react'
import { Clock, Disc3, ExternalLink, Heart, Pause, Play, User } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import AddToPlaylistButton from '../components/music/AddToPlaylistButton'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import LoadingState from '../components/feedback/LoadingState'
import { ROUTES } from '../constants/app'
import { useFavorites } from '../features/favorites/useFavorites'
import { usePlayer } from '../features/player/PlayerProvider'
import { getTrackById, isAbortError } from '../services/itunesApi'
import type { Track } from '../types/music'
import { formatDuration } from '../utils/formatDuration'

export default function TrackPage() {
  const { trackId: trackIdParam } = useParams()
  const trackId = Number(trackIdParam)
  const isValidId = Number.isInteger(trackId) && trackId > 0

  const [track, setTrack] = useState<Track | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { currentTrack, isPlaying, playFromQueue, togglePlay } = usePlayer()

  useEffect(() => {
    // Invalid IDs render the not-found state directly in the component body.
    if (!isValidId) return

    const controller = new AbortController()

    async function loadTrack() {
      setStatus('loading')
      try {
        const result = await getTrackById(trackId, { signal: controller.signal })
        if (result === null) {
          setStatus('not-found')
          return
        }
        setTrack(result)
        setStatus('ready')
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage(error instanceof Error ? error.message : 'Could not load this track.')
        setStatus('error')
      }
    }

    void loadTrack()
    return () => controller.abort()
  }, [trackId, isValidId, retryToken])

  const handleRetry = useCallback(() => setRetryToken((token) => token + 1), [])

  const notFoundState = (
    <EmptyState
      title="Track not found"
      message="This track ID does not match anything in the catalog, or it is unavailable in this storefront."
      action={
        <Link
          to={ROUTES.home}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-app hover:scale-105 inline-block"
        >
          Back to discovery
        </Link>
      }
    />
  )

  if (!isValidId) {
    return notFoundState
  }

  if (status === 'loading') {
    return <LoadingState label="Loading track…" />
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={handleRetry} />
  }

  if (status === 'not-found' || !track) {
    return notFoundState
  }

  const isFavoriteTrack = isFavorite(track.trackId)
  const isCurrentTrack = currentTrack?.trackId === track.trackId
  const hasPreview = Boolean(track.previewUrl)

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay()
      return
    }
    playFromQueue([track], 0)
  }

  return (
    <article className="space-y-8">
      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-gradient-to-br from-accent/15 via-card to-transparent p-6 backdrop-blur-sm sm:flex-row sm:p-8">
        <div className="mx-auto w-full max-w-60 shrink-0 sm:mx-0">
          {track.artworkUrl ? (
            <img
              src={track.artworkUrl}
              alt={`Album artwork for ${track.trackName} by ${track.artistName}`}
              className={`aspect-square w-full rounded-2xl object-cover shadow-2xl ${
                isCurrentTrack && isPlaying ? 'animate-pulse-glow' : ''
              }`}
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-card-hover text-muted" aria-hidden="true">
              <Disc3 className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <div>
            <p className="text-gradient text-xs font-semibold uppercase tracking-wide">Song</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">{track.trackName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              {track.artistId ? (
                <Link to={ROUTES.artist(track.artistId)} className="font-medium text-ink hover:underline">
                  {track.artistName}
                </Link>
              ) : (
                <span className="font-medium text-ink">{track.artistName}</span>
              )}
              {track.collectionName ? (
                <>
                  <span aria-hidden="true">·</span>
                  {track.collectionId ? (
                    <Link to={ROUTES.album(track.collectionId)} className="hover:text-ink hover:underline">
                      {track.collectionName}
                    </Link>
                  ) : (
                    <span>{track.collectionName}</span>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {track.genre ? (
              <span className="glass rounded-full px-3 py-1">{track.genre}</span>
            ) : null}
            <span className="glass inline-flex items-center gap-1 rounded-full px-3 py-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDuration(track.durationMs)}
            </span>
            {hasPreview ? (
              <span
                className="rounded-full bg-black/30 px-3 py-1 font-medium text-ink backdrop-blur-sm"
                title="Catalog preview clip, 30 seconds"
              >
                30s preview
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handlePlay}
              disabled={!hasPreview}
              aria-label={
                hasPreview
                  ? isCurrentTrack && isPlaying
                    ? 'Pause preview'
                    : 'Play preview'
                  : 'No preview available for this track'
              }
              className="gradient-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-app shadow-[0_0_24px_rgba(167,139,250,0.45)] transition-transform hover:scale-105 disabled:scale-100 disabled:bg-card-hover disabled:text-muted disabled:shadow-none"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {isCurrentTrack && isPlaying ? 'Pause' : 'Play preview'}
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(track)}
              aria-pressed={isFavoriteTrack}
              aria-label={isFavoriteTrack ? 'Remove from favorites' : 'Save to favorites'}
              className={`inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium transition-colors hover:bg-card-hover ${
                isFavoriteTrack ? 'text-accent' : 'text-ink'
              }`}
            >
              <Heart className="h-4 w-4" aria-hidden="true" fill={isFavoriteTrack ? 'currentColor' : 'none'} />
              {isFavoriteTrack ? 'Favorited' : 'Favorite'}
            </button>

            <AddToPlaylistButton track={track} />

            {track.trackViewUrl ? (
              <a
                href={track.trackViewUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-hover hover:text-ink"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open in catalog
              </a>
            ) : null}
          </div>

          {!hasPreview ? (
            <p className="text-xs text-muted">
              No preview clip is available for this track in the catalog, so playback is disabled.
            </p>
          ) : (
            <p className="text-xs text-muted">Previews are short clips provided by the catalog.</p>
          )}
        </div>
      </section>

      {track.artistId ? (
        <section aria-labelledby="more-from-artist" className="glass rounded-2xl p-4">
          <h2 id="more-from-artist" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <User className="h-4 w-4 text-accent" aria-hidden="true" />
            Discover more
          </h2>
          <Link
            to={ROUTES.artist(track.artistId)}
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Explore {track.artistName}
            {track.collectionId ? ' and more like this' : ''}
          </Link>
        </section>
      ) : null}
    </article>
  )
}
