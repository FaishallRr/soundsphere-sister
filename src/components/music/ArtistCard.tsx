import { User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import type { Artist } from '../../types/music'

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      to={ROUTES.artist(artist.artistId)}
      className="group flex items-center gap-3 rounded-xl border border-line bg-card p-3 transition-colors hover:bg-card-hover"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card-hover text-accent">
        <User className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink" title={artist.artistName}>
          {artist.artistName}
        </p>
        {artist.genre ? <p className="truncate text-xs text-muted">{artist.genre}</p> : null}
      </div>
    </Link>
  )
}
