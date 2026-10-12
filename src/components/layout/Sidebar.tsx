import { Heart, Home, Library, ListMusic, Music2, Search, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/app'
import { usePlayer } from '../../features/player/PlayerProvider'
import Equalizer from '../music/Equalizer'

const primaryNav = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.search, label: 'Search', icon: Search, end: false },
  { to: ROUTES.library, label: 'Library', icon: Library, end: false },
]

const libraryLinks = [
  { to: `${ROUTES.library}?tab=favorites`, label: 'Favorites', icon: Heart },
  { to: `${ROUTES.library}?tab=playlists`, label: 'Playlists', icon: ListMusic },
  { to: `${ROUTES.library}?tab=history`, label: 'Recently played', icon: Music2 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentTrack, isPlaying } = usePlayer()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-accent/25 via-accent/10 to-transparent text-accent shadow-[inset_0_0_0_1px_rgba(167,139,250,0.22)]'
        : 'text-muted hover:bg-card-hover hover:text-ink'
    }`

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4 scrollbar-thin">
      <div className="flex items-center justify-between">
        <NavLink to={ROUTES.home} className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink">
          <span
            className="gradient-cta flex h-9 w-9 items-center justify-center rounded-xl text-app glow-accent"
            aria-hidden="true"
          >
            <Music2 className="h-4.5 w-4.5" />
          </span>
          <span className="text-gradient">SoundSphere</span>
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-full p-2 text-muted hover:bg-card-hover hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {currentTrack ? (
        <div className="glass rounded-xl p-3" aria-label="Current track">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {isPlaying ? <Equalizer className="text-accent" /> : null}
            Now playing
          </p>
          <div className="mt-2 flex items-center gap-2">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt=""
                className={`h-10 w-10 rounded-lg object-cover ${isPlaying ? 'animate-pulse-glow' : ''}`}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card-hover text-muted" aria-hidden="true">
                <Music2 className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{currentTrack.trackName}</p>
              <p className="truncate text-xs text-muted">{currentTrack.artistName}</p>
            </div>
          </div>
        </div>
      ) : null}

      <nav aria-label="Primary">
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={navLinkClass} onClick={onClose}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Library">
        <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Your library</h2>
        <ul className="mt-2 space-y-1">
          {libraryLinks.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass} onClick={onClose}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-auto px-3 text-[11px] leading-relaxed text-muted/70">
        Catalog data via the iTunes Search API. Previews are 30-second clips, not full songs.
      </p>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-panel/70 backdrop-blur-xl lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-panel/95 shadow-2xl backdrop-blur-xl">
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  )
}
