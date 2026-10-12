import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'
import RightPanel from './RightPanel'
import Sidebar from './Sidebar'
import MusicPlayer from '../player/MusicPlayer'

export default function AppShell() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="relative z-10 min-h-screen text-ink">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-sm font-medium text-app focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Mobile: tab bar at the very bottom, compact player stacked above it. */}
      <div className="pb-44 lg:pb-32 lg:pl-64">
        <Header onOpenNav={() => setIsNavOpen(true)} />

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 xl:flex-row xl:items-start xl:px-6">
          <main id="main-content" key={location.pathname} className="min-w-0 flex-1 animate-fade-in-up">
            <Outlet />
          </main>
          <RightPanel />
        </div>
      </div>

      <MusicPlayer />
      <BottomNav />
    </div>
  )
}
