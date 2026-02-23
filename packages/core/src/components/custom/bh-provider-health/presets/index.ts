/**
 * BhProviderHealth - Preset Registry
 */

import type { BhProviderHealthPreset, BhProviderHealthProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhProviderHealth } from './dashboard';
import { CompactBhProviderHealth } from './compact';

export const BH_PROVIDER_HEALTH_PRESETS: Record<BhProviderHealthPreset, ComponentType<BhProviderHealthProps>> = {
  dashboard: DashboardBhProviderHealth,
  compact: CompactBhProviderHealth,
};

export { DashboardBhProviderHealth } from './dashboard';
export { CompactBhProviderHealth } from './compact';
