import { useCallback, useEffect, useState } from 'react'
import { Disc3, Pause, Play } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import TrackList from '../components/music/TrackList'
import { TrackRowSkeleton } from '../components/music/Skeletons'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import LoadingState from '../components/feedback/LoadingState'
import { ROUTES } from '../constants/app'
import { usePlayer } from '../features/player/PlayerProvider'
import { getAlbumWithTracks, isAbortError } from '../services/itunesApi'
import type { Album, Track } from '../types/music'

interface AlbumData {
  album: Album | null
  tracks: Track[]
}

export default function AlbumPage() {
  const { collectionId: collectionIdParam } = useParams()
  const collectionId = Number(collectionIdParam)
  const isValidId = Number.isInteger(collectionId) && collectionId > 0

  const [data, setData] = useState<AlbumData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const { currentTrack, isPlaying, playFromQueue, togglePlay } = usePlayer()

  useEffect(() => {
    // Invalid IDs render the not-found state directly in the component body.
    if (!isValidId) return

    const controller = new AbortController()

    async function loadAlbum() {
      setStatus('loading')
      try {
        const result = await getAlbumWithTracks(collectionId, { signal: controller.signal })
        if (result.album === null && result.tracks.length === 0) {
          setStatus('not-found')
          return
        }
        setData(result)
        setStatus('ready')
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage(error instanceof Error ? error.message : 'Could not load this album.')
        setStatus('error')
      }
    }

    void loadAlbum()
    return () => controller.abort()
  }, [collectionId, isValidId, retryToken])

  const handleRetry = useCallback(() => setRetryToken((token) => token + 1), [])

  const notFoundState = (
    <EmptyState
      icon={Disc3}
      title="Album not found"
      message="This album ID does not match anything in the catalog, or it is unavailable in this storefront."
      action={
        <Link to={ROUTES.home} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-app inline-block">
          Back to discovery
        </Link>
      }
    />
  )

  if (!isValidId) {
    return notFoundState
  }

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <LoadingState label="Loading album…" />
        <TrackRowSkeleton count={6} />
      </div>
    )
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={handleRetry} />
  }

  if (status === 'not-found' || !data) {
    return notFoundState
  }

  const { album, tracks } = data
  const albumName = album?.collectionName ?? tracks[0]?.collectionName ?? 'Unknown album'
  const artistName = album?.artistName ?? tracks[0]?.artistName ?? 'Unknown artist'
  const artistId = album?.artistId ?? tracks[0]?.artistId ?? null
  const releaseYear = album?.releaseDate?.slice(0, 4) ?? null
  const playableTracks = tracks.filter((track) => track.previewUrl)

  const isAlbumPlaying = currentTrack !== null && tracks.some((track) => track.trackId === currentTrack.trackId)

  function handlePlayAll() {
    if (isAlbumPlaying) {
      togglePlay()
      return
    }
    if (playableTracks.length > 0) {
      playFromQueue(playableTracks, 0)
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-gradient-to-br from-accent-2/15 via-card to-transparent p-6 backdrop-blur-sm sm:flex-row sm:p-8">
        <div className="mx-auto w-full max-w-52 shrink-0 sm:mx-0">
          {album?.artworkUrl ?? tracks[0]?.artworkUrl ? (
            <img
              src={album?.artworkUrl ?? tracks[0]?.artworkUrl ?? ''}
              alt={`Album artwork for ${albumName}`}
              className="aspect-square w-full rounded-2xl object-cover shadow-2xl"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-card-hover text-muted" aria-hidden="true">
              <Disc3 className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <p className="text-gradient text-xs font-semibold uppercase tracking-wide">Album</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">{albumName}</h1>
          <p className="text-sm text-muted">
            {artistId ? (
              <Link to={ROUTES.artist(artistId)} className="font-medium text-ink hover:underline">
                {artistName}
              </Link>
            ) : (
              <span className="font-medium text-ink">{artistName}</span>
            )}
            {album?.trackCount !== null && album?.trackCount !== undefined
              ? ` · ${album.trackCount} songs`
              : tracks.length > 0
                ? ` · ${tracks.length} songs`
                : ''}
            {releaseYear ? ` · ${releaseYear}` : ''}
          </p>
          {album?.genre ? <p className="text-xs text-muted">{album.genre}</p> : null}

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={playableTracks.length === 0}
              aria-label={isAlbumPlaying && isPlaying ? 'Pause album' : 'Play all previewable tracks from this album'}
              className="gradient-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-app shadow-[0_0_24px_rgba(167,139,250,0.45)] transition-transform hover:scale-105 disabled:scale-100 disabled:bg-card-hover disabled:text-muted disabled:shadow-none"
            >
              {isAlbumPlaying && isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {isAlbumPlaying && isPlaying ? 'Pause' : 'Play album'}
            </button>
            {playableTracks.length === 0 ? (
              <p className="mt-2 text-xs text-muted">No previews are available for this album.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="album-tracks">
        <h2 id="album-tracks" className="mb-3 text-lg font-semibold text-ink">
          Tracks
        </h2>
        <TrackList
          tracks={tracks}
          showIndex
          showArtwork={false}
          emptyMessage="This album returned no tracks in the catalog."
        />
      </section>
    </div>
  )
}
