/**
 * W3BadgeGallery - All Presets
 */

export { GalleryW3BadgeGallery } from './gallery';
export { ListW3BadgeGallery } from './list';

import type { W3BadgeGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3BadgeGalleryProps } from '../core';
import { GalleryW3BadgeGallery } from './gallery';
import { ListW3BadgeGallery } from './list';

export const W3_BADGE_GALLERY_PRESETS: Record<W3BadgeGalleryPreset, ComponentType<W3BadgeGalleryProps>> = {
  gallery: GalleryW3BadgeGallery,
  list: ListW3BadgeGallery,
};
