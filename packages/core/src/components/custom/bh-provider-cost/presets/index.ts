/**
 * BhProviderCost - All Presets
 */

export { DashboardBhProviderCost } from './dashboard';
export { CompactBhProviderCost } from './compact';

import type { BhProviderCostPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhProviderCostProps } from '../core';
import { DashboardBhProviderCost } from './dashboard';
import { CompactBhProviderCost } from './compact';

export const BH_PROVIDER_COST_PRESETS: Record<BhProviderCostPreset, ComponentType<BhProviderCostProps>> = {
  dashboard: DashboardBhProviderCost,
  compact: CompactBhProviderCost,
};
