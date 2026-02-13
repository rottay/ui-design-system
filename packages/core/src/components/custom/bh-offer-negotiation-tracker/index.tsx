/**
 * BhOfferNegotiationTracker - Main Export
 * Visual negotiation timeline with salary progression
 */

import type { BhOfferNegotiationTrackerProps } from './core';
import { BH_OFFER_NEGOTIATION_TRACKER_DEFAULTS } from './core';
import { BH_OFFER_NEGOTIATION_TRACKER_PRESETS } from './presets';

export {
  type BhOfferNegotiationTrackerProps,
  type BhOfferNegotiationTrackerPreset,
  type NegotiationRound,
  BH_OFFER_NEGOTIATION_TRACKER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhOfferNegotiationTracker component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOfferNegotiationTracker(props: BhOfferNegotiationTrackerProps): React.ReactElement {
  const preset = props.preset ?? BH_OFFER_NEGOTIATION_TRACKER_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_OFFER_NEGOTIATION_TRACKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOfferNegotiationTracker.displayName = 'BhOfferNegotiationTracker';
