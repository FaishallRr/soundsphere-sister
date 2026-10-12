import { Heart, Music2, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useFavorites } from '../../features/favorites/useFavorites'
import { usePlayer } from '../../features/player/PlayerProvider'
import type { Track } from '../../types/music'
import AddToPlaylistButton from './AddToPlaylistButton'

interface TrackCardProps {
  track: Track
  contextTracks?: Track[]
  index?: number
}

export default function TrackCard({ track, contextTracks, index }: TrackCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { currentTrack, isPlaying, playFromQueue, togglePlay } = usePlayer()

  const isFavoriteTrack = isFavorite(track.trackId)
  const isCurrentTrack = currentTrack?.trackId === track.trackId
  const hasPreview = Boolean(track.previewUrl)

  function handlePlay() {
    if (isCurrentTrack) {
      togglePlay()
      return
    }
    if (contextTracks && typeof index === 'number') {
      playFromQueue(contextTracks, index)
      return
    }
    playFromQueue([track], 0)
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-card-hover hover:shadow-[0_18px_44px_-18px_rgba(167,139,250,0.55)] ${
        isCurrentTrack
          ? 'border-accent/45 shadow-[0_0_28px_rgba(167,139,250,0.3)]'
          : 'border-line'
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-card-hover">
        <Link to={ROUTES.track(track.trackId)} tabIndex={-1} aria-hidden="true">
          {track.artworkUrl ? (
            <img
              src={track.artworkUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted" aria-hidden="true">
              <Music2 className="h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Scrim keeps bottom controls readable over any artwork. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          aria-hidden="true"
        />

        {hasPreview ? (
          <span
            className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink backdrop-blur-sm"
            title="Catalog preview clip, 30 seconds"
          >
            30s
          </span>
        ) : null}

        <div className="absolute inset-x-2 bottom-2 flex items-center justify-between opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={handlePlay}
            disabled={!hasPreview}
            aria-label={
              hasPreview
                ? isCurrentTrack && isPlaying
                  ? `Pause ${track.trackName}`
                  : `Play ${track.trackName}`
                : `No preview available for ${track.trackName}`
            }
            className="gradient-cta flex h-11 w-11 items-center justify-center rounded-full text-app shadow-[0_0_22px_rgba(167,139,250,0.55)] transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted disabled:shadow-none"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <div className="flex items-center gap-1">
            <AddToPlaylistButton track={track} />
            <button
              type="button"
              onClick={() => toggleFavorite(track)}
              aria-label={
                isFavoriteTrack
                  ? `Remove ${track.trackName} from favorites`
                  : `Save ${track.trackName} to favorites`
              }
              aria-pressed={isFavoriteTrack}
              className={`glass rounded-full p-2 shadow-lg transition-colors hover:bg-card-hover ${
                isFavoriteTrack ? 'text-accent animate-pop' : 'text-muted'
              }`}
            >
              <Heart
                className="h-4 w-4"
                aria-hidden="true"
                fill={isFavoriteTrack ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <Link
          to={ROUTES.track(track.trackId)}
          className="truncate text-sm font-medium text-ink hover:text-accent hover:underline"
          title={track.trackName}
        >
          {track.trackName}
        </Link>
        {track.artistId ? (
          <Link
            to={ROUTES.artist(track.artistId)}
            className="truncate text-xs text-muted hover:text-ink hover:underline"
            title={track.artistName}
          >
            {track.artistName}
          </Link>
        ) : (
          <p className="truncate text-xs text-muted" title={track.artistName}>
            {track.artistName}
          </p>
        )}
        {!hasPreview ? (
          <p className="text-[11px] text-muted/70">No preview available</p>
        ) : null}
      </div>
    </article>
  )
}
