import { Disc3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import type { Album } from '../../types/music'

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      to={ROUTES.album(album.collectionId)}
      className="group flex flex-col gap-2 rounded-xl border border-line bg-card p-3 transition-colors hover:bg-card-hover"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-card-hover">
        {album.artworkUrl ? (
          <img
            src={album.artworkUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted" aria-hidden="true">
            <Disc3 className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink" title={album.collectionName}>
          {album.collectionName}
        </p>
        <p className="truncate text-xs text-muted" title={album.artistName}>
          {album.artistName}
          {album.trackCount !== null ? ` · ${album.trackCount} songs` : ''}
        </p>
      </div>
    </Link>
  )
}
