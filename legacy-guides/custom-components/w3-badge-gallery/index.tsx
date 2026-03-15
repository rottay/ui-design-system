/**
 * W3BadgeGallery - Main Export
 * Display earned badges and achievements with rarity levels and unlock conditions
 */

import type { W3BadgeGalleryProps } from './core';
import { W3_BADGE_GALLERY_DEFAULTS } from './core';
import { W3_BADGE_GALLERY_PRESETS } from './presets';

export { type W3BadgeGalleryProps, type W3BadgeGalleryPreset, W3_BADGE_GALLERY_DEFAULTS } from './core';
export * from './presets';

export function W3BadgeGallery(props: W3BadgeGalleryProps): React.ReactElement {
  const preset = props.preset ?? W3_BADGE_GALLERY_DEFAULTS.preset ?? 'gallery';
  const PresetComponent = W3_BADGE_GALLERY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3BadgeGallery.displayName = 'W3BadgeGallery';
