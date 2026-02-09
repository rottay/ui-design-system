/**
 * EvDynamicPricing - Main Export
 * AI-driven dynamic pricing with demand curves, simulators, and live price monitoring
 */

import type { EvDynamicPricingProps } from './core';
import { EV_DYNAMIC_PRICING_DEFAULTS } from './core';
import { EV_DYNAMIC_PRICING_PRESETS } from './presets';

export {
  type EvDynamicPricingProps,
  type EvDynamicPricingPreset,
  type PricingTier as EvDynamicPricingPricingTier,
  type PriceHistory as EvDynamicPricingPriceHistory,
  EV_DYNAMIC_PRICING_DEFAULTS,
} from './core';
export * from './presets';

export function EvDynamicPricing(props: EvDynamicPricingProps): React.ReactElement {
  const preset = props.preset ?? EV_DYNAMIC_PRICING_DEFAULTS.preset ?? 'control';
  const PresetComponent = EV_DYNAMIC_PRICING_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvDynamicPricing.displayName = 'EvDynamicPricing';

export { ControlEvDynamicPricing, MonitorEvDynamicPricing } from './presets';
