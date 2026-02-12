/**
 * BarStockDashboard - All Presets
 */

export { DashboardBarStockDashboard } from './dashboard';
export { CompactBarStockDashboard } from './compact';

import type { BarStockDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarStockDashboardProps } from '../core';
import { DashboardBarStockDashboard } from './dashboard';
import { CompactBarStockDashboard } from './compact';

export const BAR_STOCK_DASHBOARD_PRESETS: Record<BarStockDashboardPreset, ComponentType<BarStockDashboardProps>> = {
  dashboard: DashboardBarStockDashboard,
  compact: CompactBarStockDashboard,
};
