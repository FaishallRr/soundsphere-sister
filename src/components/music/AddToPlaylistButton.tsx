import { useState } from 'react'
import { Check, ListPlus, Plus } from 'lucide-react'
import { usePlaylists } from '../../features/playlists/usePlaylists'
import type { Track } from '../../types/music'

interface AddToPlaylistButtonProps {
  track: Track
  className?: string
}

export default function AddToPlaylistButton({ track, className = '' }: AddToPlaylistButtonProps) {
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylists()
  const [isOpen, setIsOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  function handleAdd(playlistId: string, playlistName: string) {
    addTrackToPlaylist(playlistId, track)
    setStatusMessage(`Added to “${playlistName}”.`)
    setIsOpen(false)
  }

  function handleCreateAndAdd(event: React.FormEvent) {
    event.preventDefault()
    const playlist = createPlaylist(newPlaylistName)
    if (!playlist) {
      setStatusMessage('Playlist name cannot be empty.')
      return
    }
    addTrackToPlaylist(playlist.id, track)
    setNewPlaylistName('')
    setStatusMessage(`Created “${playlist.name}” and added this track.`)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open)
          setStatusMessage(null)
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Add ${track.trackName} to a playlist`}
        className="rounded-full p-2 text-muted transition-colors hover:bg-card-hover hover:text-ink"
      >
        <ListPlus className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-30 cursor-default bg-black/40 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          {/* Bottom sheet on phones, anchored popover on larger screens. */}
          <div
            role="menu"
            className="fixed inset-x-4 bottom-40 z-40 max-h-[50vh] w-auto overflow-y-auto rounded-2xl border border-line bg-panel/95 p-2 shadow-2xl backdrop-blur-xl scrollbar-thin sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:max-h-72 sm:w-64 sm:rounded-xl"
          >
            {playlists.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted">No playlists yet. Create one below.</p>
            ) : (
              playlists.map((playlist) => {
                const alreadyAdded = playlist.tracks.some((item) => item.trackId === track.trackId)
                return (
                  <button
                    key={playlist.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleAdd(playlist.id, playlist.name)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-left text-sm text-ink hover:bg-card-hover"
                  >
                    <span className="truncate">{playlist.name}</span>
                    {alreadyAdded ? (
                      <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <span className="sr-only">Add track</span>
                    )}
                  </button>
                )
              })
            )}

            <form onSubmit={handleCreateAndAdd} className="mt-2 border-t border-line pt-2">
              <label htmlFor={`new-playlist-${track.trackId}`} className="sr-only">
                New playlist name
              </label>
              <input
                id={`new-playlist-${track.trackId}`}
                type="text"
                value={newPlaylistName}
                onChange={(event) => setNewPlaylistName(event.target.value)}
                placeholder="New playlist name"
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted"
              />
              <button
                type="submit"
                className="gradient-cta mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-app hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create & add
              </button>
            </form>
          </div>
        </>
      ) : null}

      <p className="sr-only" role="status">
        {statusMessage ?? ''}
      </p>
    </div>
  )
}
