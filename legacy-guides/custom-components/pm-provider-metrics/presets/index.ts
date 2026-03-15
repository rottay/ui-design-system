/**
 * PmProviderMetrics - All Presets
 */

export { DashboardPmProviderMetrics } from './dashboard';
export { ComparisonPmProviderMetrics } from './comparison';

import type { PmProviderMetricsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmProviderMetricsProps } from '../core';
import { DashboardPmProviderMetrics } from './dashboard';
import { ComparisonPmProviderMetrics } from './comparison';

export const PM_PROVIDER_METRICS_PRESETS: Record<PmProviderMetricsPreset, ComponentType<PmProviderMetricsProps>> = {
  dashboard: DashboardPmProviderMetrics,
  comparison: ComparisonPmProviderMetrics,
};
