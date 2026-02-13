/**
 * BhAgentGalleryEnhanced - All Presets
 */

export { GalleryBhAgentGalleryEnhanced } from './gallery';
export { CompactBhAgentGalleryEnhanced } from './compact';

import type { BhAgentGalleryEnhancedPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAgentGalleryEnhancedProps } from '../core';
import { GalleryBhAgentGalleryEnhanced } from './gallery';
import { CompactBhAgentGalleryEnhanced } from './compact';

export const BH_AGENT_GALLERY_ENHANCED_PRESETS: Record<BhAgentGalleryEnhancedPreset, ComponentType<BhAgentGalleryEnhancedProps>> = {
  gallery: GalleryBhAgentGalleryEnhanced,
  compact: CompactBhAgentGalleryEnhanced,
};
