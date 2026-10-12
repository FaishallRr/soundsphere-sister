export interface GenreSection {
  id: string
  label: string
  searchTerm: string
}

// Curated jump-off points into the catalog. The iTunes API has no dependable
// real-time chart endpoint, so these are labelled as exploration, not rankings.
export const DISCOVERY_SECTIONS: GenreSection[] = [
  { id: 'pop', label: 'Pop', searchTerm: 'pop hits' },
  { id: 'indie', label: 'Indie', searchTerm: 'indie' },
  { id: 'rock', label: 'Rock', searchTerm: 'rock' },
  { id: 'electronic', label: 'Electronic', searchTerm: 'electronic' },
]

export const MORE_GENRE_CHIPS: GenreSection[] = [
  { id: 'rnb', label: 'R&B', searchTerm: 'R&B' },
  { id: 'hiphop', label: 'Hip-Hop', searchTerm: 'hip hop' },
  { id: 'jazz', label: 'Jazz', searchTerm: 'jazz' },
  { id: 'latin', label: 'Latin', searchTerm: 'latin pop' },
  { id: 'local', label: 'Indonesian', searchTerm: 'indonesian pop' },
  { id: 'acoustic', label: 'Acoustic', searchTerm: 'acoustic' },
]

export const FEATURED_SECTION = {
  id: 'featured',
  label: 'Featured',
  searchTerm: 'hit songs',
  title: 'Featured discovery',
  subtitle: 'A curated jump-off point into the catalog — not a live chart.',
} as const

export const EDITORS_PICKS_TERM = 'essential'

export interface RecommendationProfile {
  genreTerm: string | null
  artistTerm: string | null
}

export function describeRecommendation(profile: RecommendationProfile): string | null {
  if (profile.artistTerm && profile.genreTerm) {
    return `Artists and genres you keep coming back to — try more ${profile.genreTerm} like ${profile.artistTerm}.`
  }
  if (profile.genreTerm) {
    return `Based on your favorites and recent plays — try more ${profile.genreTerm}.`
  }
  if (profile.artistTerm) {
    return `Based on your favorites and recent plays — try more music like ${profile.artistTerm}.`
  }
  return null
}
