import { FavoritesProvider } from '../features/favorites/useFavorites'
import { RecentlyPlayedProvider } from '../features/history/useRecentlyPlayed'
import { PlaylistsProvider } from '../features/playlists/usePlaylists'
import { PlayerProvider } from '../features/player/PlayerProvider'
import AppRouter from './router'

export default function App() {
  return (
    <RecentlyPlayedProvider>
      <FavoritesProvider>
        <PlaylistsProvider>
          <PlayerProvider>
            <AppRouter />
          </PlayerProvider>
        </PlaylistsProvider>
      </FavoritesProvider>
    </RecentlyPlayedProvider>
  )
}
