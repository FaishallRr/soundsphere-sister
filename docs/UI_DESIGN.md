# UI and Design System — SoundSphere

## 1. Visual direction

Use the provided Soundly screenshot as layout inspiration, not as a pixel-perfect copy. Build an original SoundSphere identity with a dark purple environment, restrained gradient accents, clear typography, and album artwork as the main visual element.

## 2. Layout

### Desktop
- Left sidebar: brand, mini current-track summary, primary navigation, library links.
- Main column: featured discovery banner, recently played, genre sections, recommended tracks.
- Right panel: curated picks and artist discovery.
- Bottom player: fixed/persistent player across routes.

### Tablet
- Collapse or narrow the sidebar.
- Hide or move the right panel below the main feed.
- Keep player controls usable.

### Mobile
- Replace desktop sidebar with a drawer or bottom navigation.
- Main content uses one column.
- Right panel becomes a normal section or is omitted where redundant.
- Player uses a compact layout with accessible controls.

## 3. Suggested palette

- App background: `#0D0D12`
- Sidebar/panel: `#15131D`
- Card: `#1D1A27`
- Card hover: `#292336`
- Primary accent: `#A78BFA`
- Secondary accent: `#67D5E5`
- Primary text: `#F5F5F7`
- Secondary text: `#A1A1AA`
- Border: `rgba(255,255,255,0.08)`
- Error: accessible red with sufficient contrast
- Success: accessible green with sufficient contrast

Use gradients sparingly for the featured banner and active states.

## 4. Typography and spacing

- Use a readable sans-serif system font or one chosen web font.
- Use a consistent spacing scale.
- Keep body text readable; avoid tiny labels for important information.
- Use clear title hierarchy and line clamping only where truncation is expected.
- Avoid layout shifts when artwork or API content loads.

## 5. Component behavior

- Track cards: artwork, title, artist, favorite button, play button only when preview exists.
- Hover effects should not be the only way to reveal controls.
- Player: display track title/artist, preview status, play/pause, progress, volume, next/previous, shuffle/repeat where applicable.
- Loading: skeletons with similar dimensions to final cards.
- Empty state: explain why there are no results and offer a useful next action.
- Error state: short explanation and Retry button.
- Missing artwork: branded placeholder; do not render a broken image icon.

## 6. Accessibility

- Use buttons for actions and links for navigation.
- Add accessible names to icon-only buttons.
- Preserve visible keyboard focus.
- Ensure text contrast.
- Provide artwork alt text using title/artist where appropriate.
- Do not rely on color alone to communicate status.
- Avoid autoplay; audio starts only after a user action.
- Respect `prefers-reduced-motion`.

## 7. Content honesty

- Label curated results as “Explore”, “Featured”, or “Editor's picks”.
- Do not imply “Trending now” is a real-time chart unless the data source truly supports it.
- Clearly communicate when a track has no preview.
