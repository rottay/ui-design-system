/**
 * BhOfferNegotiationTracker - All Presets
 */

import type { BhOfferNegotiationTrackerPreset } from '../core';
import { TimelineBhOfferNegotiationTracker } from './timeline';
import { CompactBhOfferNegotiationTracker } from './compact';

export { TimelineBhOfferNegotiationTracker } from './timeline';
export { CompactBhOfferNegotiationTracker } from './compact';

export const BH_OFFER_NEGOTIATION_TRACKER_PRESETS: Record<BhOfferNegotiationTrackerPreset, React.ComponentType<any>> = {
  'timeline': TimelineBhOfferNegotiationTracker,
  'compact': CompactBhOfferNegotiationTracker,
};
