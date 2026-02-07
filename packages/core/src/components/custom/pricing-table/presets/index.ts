/**
 * PricingTable - All Presets
 */

import type { PricingTablePreset } from '../core';
import { CardsPricingTable } from './cards';
import { ComparisonPricingTable } from './comparison';

export { CardsPricingTable } from './cards';
export { ComparisonPricingTable } from './comparison';

export const PRICING_TABLE_PRESETS: Record<PricingTablePreset, React.ComponentType<any>> = {
  cards: CardsPricingTable,
  comparison: ComparisonPricingTable,
};
