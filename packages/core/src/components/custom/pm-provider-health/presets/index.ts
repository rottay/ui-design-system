/**
 * PmProviderHealth - All Presets
 */

export { DashboardPmProviderHealth } from './dashboard';
export { CompactPmProviderHealth } from './compact';

import type { PmProviderHealthPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmProviderHealthProps } from '../core';
import { DashboardPmProviderHealth } from './dashboard';
import { CompactPmProviderHealth } from './compact';

export const PM_PROVIDER_HEALTH_PRESETS: Record<PmProviderHealthPreset, ComponentType<PmProviderHealthProps>> = {
  dashboard: DashboardPmProviderHealth,
  compact: CompactPmProviderHealth,
};
