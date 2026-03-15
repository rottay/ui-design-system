/**
 * BhOfferNegotiationTracker - All Presets
 */

import type { BhOfferNegotiationTrackerPreset, BhOfferNegotiationTrackerProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineBhOfferNegotiationTracker } from './timeline';
import { CompactBhOfferNegotiationTracker } from './compact';

export { TimelineBhOfferNegotiationTracker } from './timeline';
export { CompactBhOfferNegotiationTracker } from './compact';

export const BH_OFFER_NEGOTIATION_TRACKER_PRESETS: Record<BhOfferNegotiationTrackerPreset, ComponentType<BhOfferNegotiationTrackerProps>> = {
  'timeline': TimelineBhOfferNegotiationTracker,
  'compact': CompactBhOfferNegotiationTracker,
};
