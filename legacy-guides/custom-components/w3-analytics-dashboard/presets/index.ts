/**
 * W3AnalyticsDashboard - All Presets
 */

export { DashboardW3AnalyticsDashboard } from './dashboard';
export { CompactW3AnalyticsDashboard } from './compact';

import type { W3AnalyticsDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3AnalyticsDashboardProps } from '../core';
import { DashboardW3AnalyticsDashboard } from './dashboard';
import { CompactW3AnalyticsDashboard } from './compact';

export const W3_ANALYTICS_DASHBOARD_PRESETS: Record<W3AnalyticsDashboardPreset, ComponentType<W3AnalyticsDashboardProps>> = {
  dashboard: DashboardW3AnalyticsDashboard,
  compact: CompactW3AnalyticsDashboard,
};
