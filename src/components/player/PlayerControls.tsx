import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { usePlayer } from '../../features/player/PlayerProvider'
import { formatDuration } from '../../utils/formatDuration'

interface PlayerControlsProps {
  compact?: boolean
}

function trackGradient(percent: number): string {
  const filled = Math.min(Math.max(percent, 0), 100)
  return `linear-gradient(to right, #a78bfa 0%, #67d5e5 ${filled}%, rgba(255,255,255,0.12) ${filled}%, rgba(255,255,255,0.12) 100%)`
}

export default function PlayerControls({ compact = false }: PlayerControlsProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    isShuffling,
    errorMessage,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlayer()

  const hasPreview = Boolean(currentTrack?.previewUrl)
  const isTrackLoaded = currentTrack !== null
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={compact ? 'flex flex-col gap-1.5' : 'flex flex-col gap-3'}>
      <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
        <button
          type="button"
          onClick={toggleShuffle}
          disabled={!isTrackLoaded}
          aria-label={isShuffling ? 'Disable shuffle' : 'Enable shuffle'}
          aria-pressed={isShuffling}
          className={`rounded-full p-2.5 transition-colors hover:bg-card-hover disabled:opacity-40 ${
            isShuffling ? 'text-accent drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]' : 'text-muted'
          }`}
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={playPrevious}
          disabled={!isTrackLoaded}
          aria-label="Previous track"
          className="rounded-full p-2.5 text-ink transition-colors hover:bg-card-hover disabled:opacity-40"
        >
          <SkipBack className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!isTrackLoaded}
          aria-label={
            !hasPreview
              ? 'No preview available for this track'
              : isPlaying
                ? 'Pause preview'
                : 'Play preview'
          }
          className="gradient-cta flex h-12 w-12 items-center justify-center rounded-full text-app shadow-[0_0_24px_rgba(167,139,250,0.45)] transition-transform hover:scale-105 disabled:scale-100 disabled:bg-card-hover disabled:text-muted disabled:shadow-none"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={playNext}
          disabled={!isTrackLoaded}
          aria-label="Next track"
          className="rounded-full p-2.5 text-ink transition-colors hover:bg-card-hover disabled:opacity-40"
        >
          <SkipForward className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={cycleRepeatMode}
          disabled={!isTrackLoaded}
          aria-label={
            repeatMode === 'off'
              ? 'Repeat off'
              : repeatMode === 'all'
                ? 'Repeat queue'
                : 'Repeat current track'
          }
          className={`rounded-full p-2.5 transition-colors hover:bg-card-hover disabled:opacity-40 ${
            repeatMode !== 'off'
              ? 'text-accent drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]'
              : 'text-muted'
          }`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Repeat className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="w-9 text-right tabular-nums sm:w-10" aria-hidden="true">
          {formatDuration(currentTime * 1000)}
        </span>
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 1}
          step={0.1}
          value={Math.min(currentTime, duration > 0 ? duration : currentTime)}
          onChange={(event) => seek(Number(event.target.value))}
          disabled={!hasPreview}
          aria-label="Seek position"
          className="range-accent flex-1 disabled:opacity-40"
          style={{ background: trackGradient(progressPercent) }}
        />
        <span className="w-9 tabular-nums sm:w-10" aria-hidden="true">
          {duration > 0 ? formatDuration(duration * 1000) : '0:30'}
        </span>
      </div>

      {/* Volume is hidden on small phones where hardware volume keys are used. */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
          aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-card-hover hover:text-ink"
        >
          {volume === 0 ? (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volume"
          className="range-accent w-24 lg:w-28"
          style={{ background: trackGradient(volume * 100) }}
        />
      </div>

      {errorMessage ? (
        <p className="truncate text-center text-xs text-danger sm:text-right" role="status">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
