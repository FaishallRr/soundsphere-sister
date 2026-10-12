import { useCallback, useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import AlbumCard from '../components/music/AlbumCard'
import TrackList from '../components/music/TrackList'
import { TrackRowSkeleton } from '../components/music/Skeletons'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import LoadingState from '../components/feedback/LoadingState'
import { ROUTES } from '../constants/app'
import { isAbortError, lookupArtistWithAlbums, lookupSongsByArtist } from '../services/itunesApi'
import type { Album, Artist, Track } from '../types/music'

interface ArtistData {
  artist: Artist | null
  albums: Album[]
  songs: Track[]
}

export default function ArtistPage() {
  const { artistId: artistIdParam } = useParams()
  const artistId = Number(artistIdParam)
  const isValidId = Number.isInteger(artistId) && artistId > 0

  const [data, setData] = useState<ArtistData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    // Invalid IDs render the not-found state directly in the component body.
    if (!isValidId) return

    const controller = new AbortController()

    async function loadArtist() {
      setStatus('loading')
      try {
        const [artistResult, songs] = await Promise.all([
          lookupArtistWithAlbums(artistId, { signal: controller.signal }),
          lookupSongsByArtist(artistId, { limit: 12, signal: controller.signal }),
        ])

        if (artistResult.artist === null && artistResult.albums.length === 0 && songs.length === 0) {
          setStatus('not-found')
          return
        }

        setData({
          artist: artistResult.artist,
          albums: artistResult.albums.slice(0, 12),
          songs: songs.slice(0, 12),
        })
        setStatus('ready')
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage(error instanceof Error ? error.message : 'Could not load this artist.')
        setStatus('error')
      }
    }

    void loadArtist()
    return () => controller.abort()
  }, [artistId, isValidId, retryToken])

  const handleRetry = useCallback(() => setRetryToken((token) => token + 1), [])

  const notFoundState = (
    <EmptyState
      icon={User}
      title="Artist not found"
      message="This artist ID does not match anything in the catalog, or it is unavailable in this storefront."
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
        <LoadingState label="Loading artist…" />
        <TrackRowSkeleton count={5} />
      </div>
    )
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={handleRetry} />
  }

  if (status === 'not-found' || !data) {
    return notFoundState
  }

  const displayName = data.artist?.artistName ?? data.songs[0]?.artistName ?? data.albums[0]?.artistName ?? 'Unknown artist'

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-accent-2/20 via-card to-accent/10 p-6 backdrop-blur-sm sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 animate-float rounded-full bg-accent-2/25 blur-3xl"
        />
        <p className="relative text-gradient text-xs font-semibold uppercase tracking-wide">Artist</p>
        <h1 className="relative mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{displayName}</h1>
        {data.artist?.genre ? (
          <p className="mt-2 text-sm text-muted">{data.artist.genre}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted">
          {data.songs.length} song{data.songs.length === 1 ? '' : 's'} and {data.albums.length} album
          {data.albums.length === 1 ? '' : 's'} available in this storefront.
        </p>
      </section>

      <section aria-labelledby="artist-songs">
        <h2 id="artist-songs" className="mb-3 text-lg font-semibold text-ink">
          Songs
        </h2>
        <TrackList tracks={data.songs} emptyMessage="No songs returned for this artist." />
      </section>

      {data.albums.length > 0 ? (
        <section aria-labelledby="artist-albums">
          <h2 id="artist-albums" className="mb-3 text-lg font-semibold text-ink">
            Albums
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {data.albums.map((album) => (
              <AlbumCard key={album.collectionId} album={album} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
