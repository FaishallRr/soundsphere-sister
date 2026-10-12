import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Check,
  Heart,
  History,
  ListMusic,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/feedback/EmptyState'
import TrackCard from '../components/music/TrackCard'
import TrackList from '../components/music/TrackList'
import { ROUTES } from '../constants/app'
import { useFavorites } from '../features/favorites/useFavorites'
import { useRecentlyPlayed } from '../features/history/useRecentlyPlayed'
import { sanitizePlaylistName, usePlaylists } from '../features/playlists/usePlaylists'
import { usePlayer } from '../features/player/PlayerProvider'
import type { Playlist } from '../types/music'

const TABS = [
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'history', label: 'Recently played', icon: History },
] as const

type TabId = (typeof TABS)[number]['id']

function normalizeTab(value: string | null): TabId {
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : 'favorites'
}

function FavoritesTab() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        message="Tap the heart on any track to save it here. Your favorites stay in this browser."
        action={
          <Link to={ROUTES.home} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-app inline-block">
            Discover music
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {favorites.length} favorite{favorites.length === 1 ? '' : 's'} saved in this browser.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {favorites.map((track, index) => (
          <TrackCard key={track.trackId} track={track} contextTracks={favorites} index={index} />
        ))}
      </div>
    </div>
  )
}

function PlaylistDetail({ playlist }: { playlist: Playlist }) {
  const { removeTrackFromPlaylist } = usePlaylists()
  const { playFromQueue } = usePlayer()
  const playableTracks = playlist.tracks.filter((track) => track.previewUrl)

  return (
    <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">
          {playlist.name} · {playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'}
        </h3>
        <button
          type="button"
          onClick={() => playFromQueue(playableTracks, 0)}
          disabled={playableTracks.length === 0}
          aria-label={`Play tracks from playlist ${playlist.name}`}
          className="gradient-cta inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-app hover:scale-105 disabled:scale-100 disabled:bg-card-hover disabled:text-muted disabled:shadow-none"
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          Play
        </button>
      </div>

      {playlist.tracks.length === 0 ? (
        <p className="rounded-lg bg-card px-3 py-6 text-center text-sm text-muted">
          This playlist is empty. Add tracks with the “add to playlist” button on any card or track page.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
          {playlist.tracks.map((track) => (
            <li key={track.trackId} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <Link to={ROUTES.track(track.trackId)} className="block truncate text-sm font-medium text-ink hover:underline">
                  {track.trackName}
                </Link>
                <p className="truncate text-xs text-muted">{track.artistName}</p>
              </div>
              <button
                type="button"
                onClick={() => removeTrackFromPlaylist(playlist.id, track.trackId)}
                aria-label={`Remove ${track.trackName} from ${playlist.name}`}
                className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-card-hover hover:text-danger"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PlaylistsTab() {
  const {
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
  } = usePlaylists()
  const [newName, setNewName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    const playlist = createPlaylist(newName)
    if (!playlist) {
      setFormError('Enter a playlist name.')
      return
    }
    setFormError(null)
    setNewName('')
    setExpandedId(playlist.id)
  }

  function handleRenameSubmit(event: FormEvent, playlistId: string) {
    event.preventDefault()
    const renamed = renamePlaylist(playlistId, editingName)
    if (!renamed) {
      setFormError('Enter a playlist name.')
      return
    }
    setFormError(null)
    setEditingId(null)
  }

  function handleDelete(playlist: Playlist) {
    const confirmed = window.confirm(`Delete playlist “${playlist.name}”? This cannot be undone.`)
    if (!confirmed) return
    deletePlaylist(playlist.id)
    if (expandedId === playlist.id) setExpandedId(null)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
        <label htmlFor="new-playlist" className="sr-only">
          New playlist name
        </label>
        <input
          id="new-playlist"
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New playlist name"
          maxLength={60}
          className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent/50 focus:outline-none"
        />
        <button
          type="submit"
          className="gradient-cta inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-app shadow-[0_0_18px_rgba(167,139,250,0.35)] hover:scale-105"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create playlist
        </button>
      </form>

      {formError ? (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      {playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          message="Create your first playlist above, or use the add-to-playlist button on any track."
        />
      ) : (
        <ul className="space-y-3">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="rounded-xl border border-line bg-card">
              <div className="flex flex-wrap items-center gap-2 p-3">
                {editingId === playlist.id ? (
                  <form onSubmit={(event) => handleRenameSubmit(event, playlist.id)} className="flex flex-1 items-center gap-2">
                    <label htmlFor={`rename-${playlist.id}`} className="sr-only">
                      Rename playlist
                    </label>
                    <input
                      id={`rename-${playlist.id}`}
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      maxLength={60}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-ink focus:border-accent/50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Save playlist name"
                      className="rounded-full p-2 text-success hover:bg-card-hover"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel rename"
                      className="rounded-full p-2 text-muted hover:bg-card-hover"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
                      aria-expanded={expandedId === playlist.id}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-ink">{playlist.name}</p>
                      <p className="text-xs text-muted">
                        {playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(playlist.id)
                        setEditingName(sanitizePlaylistName(playlist.name))
                      }}
                      aria-label={`Rename playlist ${playlist.name}`}
                      className="rounded-full p-2 text-muted transition-colors hover:bg-card-hover hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(playlist)}
                      aria-label={`Delete playlist ${playlist.name}`}
                      className="rounded-full p-2 text-muted transition-colors hover:bg-card-hover hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              {expandedId === playlist.id && editingId !== playlist.id ? (
                <div className="px-3 pb-3">
                  <PlaylistDetail playlist={playlist} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HistoryTab() {
  const { history, clearHistory } = useRecentlyPlayed()

  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No listening history yet"
        message="Tracks appear here once a preview actually starts playing — not merely when you open a page."
        action={
          <Link to={ROUTES.home} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-app inline-block">
            Discover music
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          The last {history.length} track{history.length === 1 ? '' : 's'} you started playing, stored only in this
          browser.
        </p>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-card-hover hover:text-danger"
        >
          Clear history
        </button>
      </div>
      <TrackList tracks={history} />
    </div>
  )
}

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = normalizeTab(searchParams.get('tab'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Your library</h1>
        <p className="text-sm text-muted">
          Favorites, playlists, and history live in this browser's local storage — clearing site data removes them.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Library sections"
        className="glass inline-flex flex-wrap gap-1 rounded-full p-1.5"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-cta text-app shadow-[0_0_18px_rgba(167,139,250,0.4)]'
                  : 'text-muted hover:bg-card-hover hover:text-ink'
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {activeTab === 'favorites' ? <FavoritesTab /> : null}
        {activeTab === 'playlists' ? <PlaylistsTab /> : null}
        {activeTab === 'history' ? <HistoryTab /> : null}
      </div>
    </div>
  )
}
