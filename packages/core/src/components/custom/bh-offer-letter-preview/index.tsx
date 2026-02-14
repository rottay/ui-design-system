/**
 * BhOfferLetterPreview - Main Export
 * A4 letter preview with variable highlighting
 */

import type { BhOfferLetterPreviewProps } from './core';
import { BH_OFFER_LETTER_PREVIEW_DEFAULTS } from './core';
import { BH_OFFER_LETTER_PREVIEW_PRESETS } from './presets';

export {
  type BhOfferLetterPreviewProps,
  type BhOfferLetterPreviewPreset,
  type DBOffer,
  type RecruiterOffer,
  type OfferLetterData,
  offerToLetterData,
  BH_OFFER_LETTER_PREVIEW_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhOfferLetterPreview component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOfferLetterPreview(props: BhOfferLetterPreviewProps): React.ReactElement {
  const preset = props.preset ?? BH_OFFER_LETTER_PREVIEW_DEFAULTS.preset ?? 'preview';
  const PresetComponent = BH_OFFER_LETTER_PREVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOfferLetterPreview.displayName = 'BhOfferLetterPreview';
