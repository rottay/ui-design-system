/**
 * BhMessageTemplateGallery - All Presets
 */

export { GalleryBhMessageTemplateGallery } from './gallery';
export { CompactBhMessageTemplateGallery } from './compact';

import type { BhMessageTemplateGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhMessageTemplateGalleryProps } from '../core';
import { GalleryBhMessageTemplateGallery } from './gallery';
import { CompactBhMessageTemplateGallery } from './compact';

export const BH_MESSAGE_TEMPLATE_GALLERY_PRESETS: Record<BhMessageTemplateGalleryPreset, ComponentType<BhMessageTemplateGalleryProps>> = {
  gallery: GalleryBhMessageTemplateGallery,
  compact: CompactBhMessageTemplateGallery,
};
