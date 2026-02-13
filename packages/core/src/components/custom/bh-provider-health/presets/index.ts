/**
 * BhProviderHealth - Preset Registry
 */

import type { BhProviderHealthPreset } from '../core';
import { DashboardBhProviderHealth } from './dashboard';
import { CompactBhProviderHealth } from './compact';

export const BH_PROVIDER_HEALTH_PRESETS: Record<BhProviderHealthPreset, React.ComponentType<any>> = {
  dashboard: DashboardBhProviderHealth,
  compact: CompactBhProviderHealth,
};

export { DashboardBhProviderHealth } from './dashboard';
export { CompactBhProviderHealth } from './compact';
