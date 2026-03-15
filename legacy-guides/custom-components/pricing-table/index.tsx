/**
 * PricingTable - Main Export
 * Automatically selects preset based on props
 */

import type { PricingTableProps } from './core';
import { PRICING_TABLE_DEFAULTS } from './core';
import { PRICING_TABLE_PRESETS } from './presets';

export { type PricingTableProps, type PricingTablePreset, type PricingPlan, type PricingFeature, type BillingCycle, PRICING_TABLE_DEFAULTS } from './core';
export * from './presets';

/**
 * PricingTable component
 * Renders the appropriate preset based on the preset prop
 */
export function PricingTable(props: PricingTableProps): React.ReactElement {
  const preset = props.preset ?? PRICING_TABLE_DEFAULTS.preset ?? 'cards';
  const PresetComponent = PRICING_TABLE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

PricingTable.displayName = 'PricingTable';

export { CardsPricingTable, ComparisonPricingTable } from './presets';
