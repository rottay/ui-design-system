/**
 * EvMediaGallery - All Presets
 */

export { GridEvMediaGallery } from './grid';
export { ModerationEvMediaGallery } from './moderation';

import type { EvMediaGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvMediaGalleryProps } from '../core';
import { GridEvMediaGallery } from './grid';
import { ModerationEvMediaGallery } from './moderation';

export const EV_MEDIA_GALLERY_PRESETS: Record<EvMediaGalleryPreset, ComponentType<EvMediaGalleryProps>> = {
  grid: GridEvMediaGallery,
  moderation: ModerationEvMediaGallery,
};
