/**
 * BhProviderCost - Main Export
 * Cost analytics by provider/model with budget alerts
 */

import type { BhProviderCostProps } from './core';
import { BH_PROVIDER_COST_DEFAULTS } from './core';
import { BH_PROVIDER_COST_PRESETS } from './presets';

export {
  type BhProviderCostProps,
  type BhProviderCostPreset,
  type ProviderCostEntry,
  type CostAlert,
  type CostAlertSeverity,
  type CostTrend,
  BH_PROVIDER_COST_DEFAULTS,
} from './core';
export * from './presets';

export function BhProviderCost(props: BhProviderCostProps): React.ReactElement {
  const preset = props.preset ?? BH_PROVIDER_COST_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_PROVIDER_COST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProviderCost.displayName = 'BhProviderCost';
