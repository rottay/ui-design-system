/**
 * BhOfferLetterPreview - All Presets
 */

import type { BhOfferLetterPreviewPreset } from '../core';
import { PreviewBhOfferLetterPreview } from './preview';
import { CompactBhOfferLetterPreview } from './compact';

export { PreviewBhOfferLetterPreview } from './preview';
export { CompactBhOfferLetterPreview } from './compact';

export const BH_OFFER_LETTER_PREVIEW_PRESETS: Record<BhOfferLetterPreviewPreset, React.ComponentType<any>> = {
  'preview': PreviewBhOfferLetterPreview,
  'compact': CompactBhOfferLetterPreview,
};
