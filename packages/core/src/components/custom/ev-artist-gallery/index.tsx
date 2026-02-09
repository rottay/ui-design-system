/**
 * EvArtistGallery - Main Export
 * Artist profile gallery
 * Automatically selects preset based on props
 */

import type { EvArtistGalleryProps } from './core';
import { EV_ARTIST_GALLERY_DEFAULTS } from './core';
import { EV_ARTIST_GALLERY_PRESETS } from './presets';

export {
  type EvArtistGalleryProps,
  type EvArtistGalleryPreset,
  type ArtistProfile as EvArtistGalleryArtistProfile,
  type ArtistFilter as EvArtistGalleryArtistFilter,
  EV_ARTIST_GALLERY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvArtistGallery component
 * Renders the appropriate preset based on the preset prop
 */
export function EvArtistGallery(props: EvArtistGalleryProps): React.ReactElement {
  const preset = props.preset ?? EV_ARTIST_GALLERY_DEFAULTS.preset ?? 'cards';
  const PresetComponent = EV_ARTIST_GALLERY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvArtistGallery.displayName = 'EvArtistGallery';

export { CardsEvArtistGallery, ListEvArtistGallery } from './presets';
