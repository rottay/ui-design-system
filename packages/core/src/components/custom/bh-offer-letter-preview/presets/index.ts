/**
 * BhOfferLetterPreview - All Presets
 */

import type { BhOfferLetterPreviewPreset, BhOfferLetterPreviewProps } from '../core';
import type { ComponentType } from 'react';
import { PreviewBhOfferLetterPreview } from './preview';
import { CompactBhOfferLetterPreview } from './compact';

export { PreviewBhOfferLetterPreview } from './preview';
export { CompactBhOfferLetterPreview } from './compact';

export const BH_OFFER_LETTER_PREVIEW_PRESETS: Record<BhOfferLetterPreviewPreset, ComponentType<BhOfferLetterPreviewProps>> = {
  'preview': PreviewBhOfferLetterPreview,
  'compact': CompactBhOfferLetterPreview,
};
