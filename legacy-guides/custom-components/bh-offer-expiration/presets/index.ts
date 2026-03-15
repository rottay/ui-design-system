/**
 * BhOfferExpiration - All Presets
 */

import type { BhOfferExpirationPreset, BhOfferExpirationProps } from '../core';
import type { ComponentType } from 'react';
import { CardsBhOfferExpiration } from './cards';
import { ListBhOfferExpiration } from './list';

export { CardsBhOfferExpiration } from './cards';
export { ListBhOfferExpiration } from './list';

export const BH_OFFER_EXPIRATION_PRESETS: Record<BhOfferExpirationPreset, ComponentType<BhOfferExpirationProps>> = {
  'cards': CardsBhOfferExpiration,
  'list': ListBhOfferExpiration,
};
