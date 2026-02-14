/**
 * BhOfferNegotiation - Main Export
 * Visual timeline of offer negotiation process.
 */

import type { BhOfferNegotiationProps } from './core';
import { BH_OFFER_NEGOTIATION_DEFAULTS } from './core';
import { BH_OFFER_NEGOTIATION_PRESETS } from './presets';

export {
  type BhOfferNegotiationProps,
  type BhOfferNegotiationPreset,
  type DBOffer,
  type RecruiterOffer,
  type NegotiationStepType,
  type CompensationPackage,
  type NegotiationStep,
  type OfferNegotiation,
  offerToNegotiation,
  BH_OFFER_NEGOTIATION_DEFAULTS,
} from './core';
export * from './presets';

export function BhOfferNegotiation(props: BhOfferNegotiationProps): React.ReactElement {
  const preset = props.preset ?? BH_OFFER_NEGOTIATION_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_OFFER_NEGOTIATION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOfferNegotiation.displayName = 'BhOfferNegotiation';

export { TimelineBhOfferNegotiation, ComparisonBhOfferNegotiation } from './presets';
