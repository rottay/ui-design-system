import React from 'react';
import type { MediaGalleryProps } from './core';
import { MEDIA_GALLERY_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MediaGalleryProps, MediaGalleryPreset, MediaItem } from './core';
export { MEDIA_GALLERY_DEFAULTS } from './core';

export function MediaGallery(props: MediaGalleryProps): React.ReactElement {
  const preset = props.preset ?? MEDIA_GALLERY_DEFAULTS.preset ?? 'masonry';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
MediaGallery.displayName = 'MediaGallery';
