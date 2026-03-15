/**
 * BhMessageTemplateGallery - All Presets
 */

export { GalleryBhMessageTemplateItemGallery as GalleryBhMessageTemplateGallery } from './gallery';
export { CompactBhMessageTemplateItemGallery as CompactBhMessageTemplateGallery } from './compact';

import type { BhMessageTemplateGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhMessageTemplateGalleryProps } from '../core';
import { GalleryBhMessageTemplateItemGallery } from './gallery';
import { CompactBhMessageTemplateItemGallery } from './compact';

export const BH_MESSAGE_TEMPLATE_GALLERY_PRESETS: Record<BhMessageTemplateGalleryPreset, ComponentType<BhMessageTemplateGalleryProps>> = {
  gallery: GalleryBhMessageTemplateItemGallery,
  compact: CompactBhMessageTemplateItemGallery,
};
