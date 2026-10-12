import { useState } from 'react'
import type { FormEvent } from 'react'
import { Menu, Music2, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/app'

interface HeaderProps {
  onOpenNav: () => void
}

export default function Header({ onOpenNav }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [term, setTerm] = useState(() => new URLSearchParams(location.search).get('q') ?? '')
  const [lastSearch, setLastSearch] = useState(location.search)

  // Adjust state during render when the URL changes (e.g. back/forward navigation).
  if (lastSearch !== location.search) {
    setLastSearch(location.search)
    setTerm(new URLSearchParams(location.search).get('q') ?? '')
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    const query = term.trim()
    if (query === '') return
    navigate(`${ROUTES.search}?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          className="rounded-xl p-2.5 text-muted transition-colors hover:bg-card-hover hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link
          to={ROUTES.home}
          aria-label="SoundSphere home"
          className="gradient-cta flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-app shadow-[0_0_16px_rgba(167,139,250,0.4)] lg:hidden"
        >
          <Music2 className="h-4 w-4" aria-hidden="true" />
        </Link>

        <form onSubmit={handleSearchSubmit} role="search" className="relative w-full max-w-xl">
          <label htmlFor="global-search" className="sr-only">
            Search songs and artists
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors peer-focus:text-accent"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search songs, artists…"
            className="w-full rounded-full border border-line bg-card/80 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted transition-all hover:bg-card focus:border-accent/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/25 focus:shadow-[0_0_24px_rgba(167,139,250,0.18)]"
            autoComplete="off"
          />
        </form>
      </div>
    </header>
  )
}
