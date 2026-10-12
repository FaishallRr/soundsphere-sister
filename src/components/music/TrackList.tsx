import { Heart, Music2, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { useFavorites } from '../../features/favorites/useFavorites'
import { usePlayer } from '../../features/player/PlayerProvider'
import type { Track } from '../../types/music'
import { formatDuration } from '../../utils/formatDuration'
import AddToPlaylistButton from './AddToPlaylistButton'
import Equalizer from './Equalizer'

interface TrackListProps {
  tracks: Track[]
  showArtwork?: boolean
  showIndex?: boolean
  emptyMessage?: string
}

export default function TrackList({
  tracks,
  showArtwork = true,
  showIndex = false,
  emptyMessage = 'No tracks to show.',
}: TrackListProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { currentTrack, isPlaying, playFromQueue, togglePlay } = usePlayer()

  if (tracks.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-card/80 px-4 py-8 text-center text-sm text-muted backdrop-blur-sm">
        {emptyMessage}
      </p>
    )
  }

  function handlePlay(track: Track, index: number) {
    const isCurrentTrack = currentTrack?.trackId === track.trackId
    if (isCurrentTrack) {
      togglePlay()
      return
    }
    playFromQueue(tracks, index)
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/85 backdrop-blur-sm">
      {tracks.map((track, index) => {
        const isFavoriteTrack = isFavorite(track.trackId)
        const isCurrentTrack = currentTrack?.trackId === track.trackId
        const hasPreview = Boolean(track.previewUrl)

        return (
          <li
            key={track.trackId}
            className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-card-hover sm:gap-3 ${
              isCurrentTrack
                ? 'bg-card-hover/90 shadow-[inset_3px_0_0_0_var(--color-accent)]'
                : ''
            }`}
          >
            {showIndex ? (
              <span
                className={`w-6 shrink-0 text-center text-sm tabular-nums ${
                  isCurrentTrack ? 'text-accent' : 'text-muted'
                }`}
                aria-hidden="true"
              >
                {index + 1}
              </span>
            ) : null}

            <button
              type="button"
              onClick={() => handlePlay(track, index)}
              disabled={!hasPreview}
              aria-label={
                hasPreview
                  ? isCurrentTrack && isPlaying
                    ? `Pause ${track.trackName}`
                    : `Play ${track.trackName}`
                  : `No preview available for ${track.trackName}`
              }
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-card-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${
                isCurrentTrack ? 'gradient-cta text-app shadow-[0_0_16px_rgba(167,139,250,0.45)]' : 'text-muted'
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {showArtwork ? (
              track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card-hover text-muted"
                  aria-hidden="true"
                >
                  <Music2 className="h-4 w-4" />
                </div>
              )
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isCurrentTrack && isPlaying ? <Equalizer className="text-accent" /> : null}
                <Link
                  to={ROUTES.track(track.trackId)}
                  className={`block truncate text-sm font-medium hover:underline ${
                    isCurrentTrack ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {track.trackName}
                </Link>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                {track.artistId ? (
                  <Link to={ROUTES.artist(track.artistId)} className="truncate hover:text-ink hover:underline">
                    {track.artistName}
                  </Link>
                ) : (
                  <span className="truncate">{track.artistName}</span>
                )}
                {track.collectionName ? (
                  <>
                    <span aria-hidden="true">·</span>
                    {track.collectionId ? (
                      <Link
                        to={ROUTES.album(track.collectionId)}
                        className="truncate hover:text-ink hover:underline"
                      >
                        {track.collectionName}
                      </Link>
                    ) : (
                      <span className="truncate">{track.collectionName}</span>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {!hasPreview ? (
              <span
                className="hidden shrink-0 text-xs text-muted/70 sm:inline"
                title="This track has no preview clip"
              >
                No preview
              </span>
            ) : (
              <span
                className="hidden shrink-0 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm sm:inline"
                title="Catalog preview clip, 30 seconds"
              >
                30s
              </span>
            )}

            <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-muted sm:inline">
              {formatDuration(track.durationMs)}
            </span>

            <AddToPlaylistButton track={track} className="shrink-0" />

            <button
              type="button"
              onClick={() => toggleFavorite(track)}
              aria-label={
                isFavoriteTrack
                  ? `Remove ${track.trackName} from favorites`
                  : `Save ${track.trackName} to favorites`
              }
              aria-pressed={isFavoriteTrack}
              className={`shrink-0 rounded-full p-2 transition-colors hover:bg-card-hover ${
                isFavoriteTrack ? 'text-accent animate-pop' : 'text-muted'
              }`}
            >
              <Heart className="h-4 w-4" aria-hidden="true" fill={isFavoriteTrack ? 'currentColor' : 'none'} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
