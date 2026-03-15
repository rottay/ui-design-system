/**
 * BhMarketIntelligence - Main Export
 * Dashboard widget showing labor market data and salary benchmarking.
 */

import type { BhMarketIntelligenceProps } from './core';
import { BH_MARKET_INTELLIGENCE_DEFAULTS } from './core';
import { BH_MARKET_INTELLIGENCE_PRESETS } from './presets';

export {
  type BhMarketIntelligenceProps,
  type BhMarketIntelligencePreset,
  type MarketIntelData,
  BH_MARKET_INTELLIGENCE_DEFAULTS,
  getDemandColor,
  getDemandBadgeColor,
  formatSalary,
} from './core';
export * from './presets';

export function BhMarketIntelligence(props: BhMarketIntelligenceProps): React.ReactElement {
  const preset = props.preset ?? BH_MARKET_INTELLIGENCE_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_MARKET_INTELLIGENCE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhMarketIntelligence.displayName = 'BhMarketIntelligence';

export { CompactBhMarketIntelligence } from './presets';
