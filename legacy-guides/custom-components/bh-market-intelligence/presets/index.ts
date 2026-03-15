/**
 * BhMarketIntelligence - All Presets
 */

import type { BhMarketIntelligencePreset, BhMarketIntelligenceProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhMarketIntelligence } from './compact';

export { CompactBhMarketIntelligence } from './compact';

export const BH_MARKET_INTELLIGENCE_PRESETS: Record<BhMarketIntelligencePreset, ComponentType<BhMarketIntelligenceProps>> = {
  compact: CompactBhMarketIntelligence,
};
