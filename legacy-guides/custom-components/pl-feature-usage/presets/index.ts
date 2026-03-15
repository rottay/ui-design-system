/**
 * PlFeatureUsage - All Presets
 */

export { DashboardPlFeatureUsage } from './dashboard';
export { TablePlFeatureUsage } from './table';

import type { PlFeatureUsagePreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureUsageProps } from '../core';
import { DashboardPlFeatureUsage } from './dashboard';
import { TablePlFeatureUsage } from './table';

export const PL_FEATURE_USAGE_PRESETS: Record<PlFeatureUsagePreset, ComponentType<PlFeatureUsageProps>> = {
  dashboard: DashboardPlFeatureUsage,
  table: TablePlFeatureUsage,
};
