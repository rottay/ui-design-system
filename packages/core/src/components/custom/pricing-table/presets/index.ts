/**
 * PricingTable - All Presets
 */

import type { PricingTablePreset, PricingTableProps } from '../core';
import type { ComponentType } from 'react';
import { CardsPricingTable } from './cards';
import { ComparisonPricingTable } from './comparison';

export { CardsPricingTable } from './cards';
export { ComparisonPricingTable } from './comparison';

export const PRICING_TABLE_PRESETS: Record<PricingTablePreset, ComponentType<PricingTableProps>> = {
  cards: CardsPricingTable,
  comparison: ComparisonPricingTable,
};
