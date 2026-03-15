/**
 * BhAgentGallery - All Presets
 */

export { GalleryBhAgentGallery } from './gallery';
export { ListBhAgentGallery } from './list';

import type { BhAgentGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentGalleryProps } from '../core';
import { GalleryBhAgentGallery } from './gallery';
import { ListBhAgentGallery } from './list';

export const BH_AGENT_GALLERY_PRESETS: Record<BhAgentGalleryPreset, ComponentType<BhAgentGalleryProps>> = {
  gallery: GalleryBhAgentGallery,
  list: ListBhAgentGallery,
};
