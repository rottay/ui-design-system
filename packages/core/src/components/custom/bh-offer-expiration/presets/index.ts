/**
 * BhOfferExpiration - All Presets
 */

import type { BhOfferExpirationPreset } from '../core';
import { CardsBhOfferExpiration } from './cards';
import { ListBhOfferExpiration } from './list';

export { CardsBhOfferExpiration } from './cards';
export { ListBhOfferExpiration } from './list';

export const BH_OFFER_EXPIRATION_PRESETS: Record<BhOfferExpirationPreset, React.ComponentType<any>> = {
  'cards': CardsBhOfferExpiration,
  'list': ListBhOfferExpiration,
};
