/**
 * BhOfferNegotiation - All Presets
 */

export { TimelineBhOfferNegotiation } from './timeline';
export { ComparisonBhOfferNegotiation } from './comparison';

import type { BhOfferNegotiationPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhOfferNegotiationProps } from '../core';
import { TimelineBhOfferNegotiation } from './timeline';
import { ComparisonBhOfferNegotiation } from './comparison';

export const BH_OFFER_NEGOTIATION_PRESETS: Record<BhOfferNegotiationPreset, ComponentType<BhOfferNegotiationProps>> = {
  timeline: TimelineBhOfferNegotiation,
  comparison: ComparisonBhOfferNegotiation,
};
