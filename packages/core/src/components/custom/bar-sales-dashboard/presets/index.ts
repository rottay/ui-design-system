/**
 * BarSalesDashboard - All Presets
 */

export { DashboardBarSalesDashboard } from './dashboard';
export { CompactBarSalesDashboard } from './compact';

import type { BarSalesDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarSalesDashboardProps } from '../core';
import { DashboardBarSalesDashboard } from './dashboard';
import { CompactBarSalesDashboard } from './compact';

export const BAR_SALES_DASHBOARD_PRESETS: Record<BarSalesDashboardPreset, ComponentType<BarSalesDashboardProps>> = {
  dashboard: DashboardBarSalesDashboard,
  compact: CompactBarSalesDashboard,
};
