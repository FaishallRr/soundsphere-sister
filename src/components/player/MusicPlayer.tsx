import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePlayer } from '../../features/player/PlayerProvider'
import { ROUTES } from '../../constants/app'
import Equalizer from '../music/Equalizer'
import PlayerControls from './PlayerControls'

export default function MusicPlayer() {
  const { currentTrack, isPlaying } = usePlayer()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isExpanded) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsExpanded(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-14 z-40 border-t border-line bg-panel/85 backdrop-blur-xl lg:bottom-0"
        role="region"
        aria-label="Music player"
      >
        <div className="hairline-gradient h-px w-full" aria-hidden="true" />
        <div className="mx-auto flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-64 lg:flex-none">
            {currentTrack ? (
              <>
                {/* Mobile: tap the compact player to open the full now-playing sheet. */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  aria-label={`Open full player for ${currentTrack.trackName}`}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left lg:hidden"
                >
                  {currentTrack.artworkUrl ? (
                    <img
                      src={currentTrack.artworkUrl}
                      alt=""
                      className={`h-11 w-11 shrink-0 rounded-lg object-cover ${isPlaying ? 'animate-pulse-glow' : ''}`}
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card text-muted" aria-hidden="true">
                      <Music2 className="h-5 w-5" />
                    </div>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {currentTrack.trackName}
                    </span>
                    <span className="flex items-center gap-1.5 truncate text-xs text-muted">
                      {isPlaying ? <Equalizer className="text-accent" /> : null}
                      {currentTrack.artistName}
                      {currentTrack.previewUrl ? ' · 30s preview' : ' · no preview'}
                    </span>
                  </span>
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </button>

                {/* Desktop: static metadata with navigation links. */}
                <div className="hidden min-w-0 items-center gap-3 lg:flex">
                  {currentTrack.artworkUrl ? (
                    <img
                      src={currentTrack.artworkUrl}
                      alt=""
                      className={`h-12 w-12 shrink-0 rounded-lg object-cover ${isPlaying ? 'animate-pulse-glow' : ''}`}
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-card text-muted" aria-hidden="true">
                      <Music2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={ROUTES.track(currentTrack.trackId)}
                      className="flex items-center gap-2 truncate text-sm font-medium text-ink hover:underline"
                    >
                      {currentTrack.trackName}
                      {isPlaying ? <Equalizer className="text-accent" /> : null}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {currentTrack.artistName}
                      {currentTrack.previewUrl ? ' · 30s preview' : ' · no preview'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted">Nothing playing</p>
                <p className="truncate text-xs text-muted/70">
                  Pick a track to start listening to a 30s preview.
                </p>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 sm:max-w-md">
            <PlayerControls compact />
          </div>

          <div className="hidden min-w-0 flex-1 justify-end text-right lg:flex">
            {currentTrack?.collectionName ? (
              <Link
                to={
                  currentTrack.collectionId
                    ? ROUTES.album(currentTrack.collectionId)
                    : `${ROUTES.search}?q=${encodeURIComponent(currentTrack.collectionName)}`
                }
                className="truncate text-xs text-muted hover:text-ink hover:underline"
              >
                {currentTrack.collectionName}
              </Link>
            ) : (
              <span className="text-xs text-muted/60">SoundSphere previews</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile full-screen now-playing sheet. */}
      {isExpanded && currentTrack ? (
        <div
          className="fixed inset-0 z-60 flex flex-col bg-panel/95 backdrop-blur-2xl animate-sheet-up lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Now playing"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-16 top-8 h-56 w-56 animate-float rounded-full bg-accent/25 blur-3xl" />
            <div
              className="absolute -right-12 bottom-24 h-52 w-52 animate-float rounded-full bg-accent-2/20 blur-3xl"
              style={{ animationDelay: '1.6s' }}
            />
          </div>

          <div className="relative flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close full player"
              className="rounded-full p-2.5 text-muted transition-colors hover:bg-card-hover hover:text-ink"
            >
              <ChevronDown className="h-6 w-6" aria-hidden="true" />
            </button>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {isPlaying ? <Equalizer className="text-accent" /> : null}
              Now playing
            </p>
            <span className="w-10" aria-hidden="true" />
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-7 overflow-y-auto px-6 pb-12">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt={`Artwork for ${currentTrack.trackName}`}
                className={`aspect-square w-full max-w-[19rem] rounded-3xl object-cover shadow-2xl ${
                  isPlaying ? 'animate-pulse-glow' : ''
                }`}
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[19rem] items-center justify-center rounded-3xl bg-card text-muted" aria-hidden="true">
                <Music2 className="h-20 w-20" />
              </div>
            )}

            <div className="w-full max-w-sm text-center">
              <Link
                to={ROUTES.track(currentTrack.trackId)}
                onClick={() => setIsExpanded(false)}
                className="block truncate text-xl font-bold text-ink hover:underline"
              >
                {currentTrack.trackName}
              </Link>
              {currentTrack.artistId ? (
                <Link
                  to={ROUTES.artist(currentTrack.artistId)}
                  onClick={() => setIsExpanded(false)}
                  className="mt-1 block truncate text-sm text-muted hover:text-ink hover:underline"
                >
                  {currentTrack.artistName}
                </Link>
              ) : (
                <p className="mt-1 truncate text-sm text-muted">{currentTrack.artistName}</p>
              )}
              <p className="mt-2 text-xs text-muted/70">
                {currentTrack.previewUrl
                  ? '30s catalog preview — open the track for the full song in the official catalog.'
                  : 'No preview available for this track.'}
              </p>
            </div>

            <div className="w-full max-w-sm">
              <PlayerControls />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
