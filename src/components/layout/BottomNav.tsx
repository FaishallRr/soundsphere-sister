import { Home, Library, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/app'

const navItems = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.search, label: 'Search', icon: Search, end: false },
  { to: ROUTES.library, label: 'Library', icon: Library, end: false },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-panel/85 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-muted hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`mb-0.5 h-0.5 w-6 rounded-full transition-all ${
                      isActive ? 'gradient-cta opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`rounded-full px-3.5 py-1 transition-all ${
                      isActive
                        ? 'bg-accent/15 shadow-[0_0_18px_rgba(167,139,250,0.3)]'
                        : 'bg-transparent'
                    }`}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
