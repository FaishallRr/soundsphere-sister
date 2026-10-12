import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import AlbumPage from '../pages/AlbumPage'
import ArtistPage from '../pages/ArtistPage'
import HomePage from '../pages/HomePage'
import LibraryPage from '../pages/LibraryPage'
import NotFoundPage from '../pages/NotFoundPage'
import SearchPage from '../pages/SearchPage'
import TrackPage from '../pages/TrackPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="track/:trackId" element={<TrackPage />} />
          <Route path="artist/:artistId" element={<ArtistPage />} />
          <Route path="album/:collectionId" element={<AlbumPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
