/**
 * EvMediaGallery - Main Export
 * Event media gallery
 * Automatically selects preset based on props
 */

import type { EvMediaGalleryProps } from './core';
import { EV_MEDIA_GALLERY_DEFAULTS } from './core';
import { EV_MEDIA_GALLERY_PRESETS } from './presets';

export {
  type EvMediaGalleryProps,
  type EvMediaGalleryPreset,
  type MediaFile as EvMediaGalleryMediaFile,
  EV_MEDIA_GALLERY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvMediaGallery component
 * Renders the appropriate preset based on the preset prop
 */
export function EvMediaGallery(props: EvMediaGalleryProps): React.ReactElement {
  const preset = props.preset ?? EV_MEDIA_GALLERY_DEFAULTS.preset ?? 'grid';
  const PresetComponent = EV_MEDIA_GALLERY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvMediaGallery.displayName = 'EvMediaGallery';

export { GridEvMediaGallery, ModerationEvMediaGallery } from './presets';
