/**
 * BhOfferExpiration - Main Export
 * Cards grouped by urgency with countdown
 */

import type { BhOfferExpirationProps } from './core';
import { BH_OFFER_EXPIRATION_DEFAULTS } from './core';
import { BH_OFFER_EXPIRATION_PRESETS } from './presets';

export {
  type BhOfferExpirationProps,
  type BhOfferExpirationPreset,
  type DBOffer,
  type RecruiterOffer,
  type ExpiringOffer,
  offerToExpiringOffer,
  offersToExpiringOffers,
  BH_OFFER_EXPIRATION_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhOfferExpiration component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOfferExpiration(props: BhOfferExpirationProps): React.ReactElement {
  const preset = props.preset ?? BH_OFFER_EXPIRATION_DEFAULTS.preset ?? 'cards';
  const PresetComponent = BH_OFFER_EXPIRATION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOfferExpiration.displayName = 'BhOfferExpiration';
