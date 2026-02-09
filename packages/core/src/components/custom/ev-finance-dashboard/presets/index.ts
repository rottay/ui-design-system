/**
 * EvFinanceDashboard - All Presets
 */

export { OverviewEvFinanceDashboard } from './overview';
export { DetailedEvFinanceDashboard } from './detailed';

import type { EvFinanceDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvFinanceDashboardProps } from '../core';
import { OverviewEvFinanceDashboard } from './overview';
import { DetailedEvFinanceDashboard } from './detailed';

export const EV_FINANCE_DASHBOARD_PRESETS: Record<EvFinanceDashboardPreset, ComponentType<EvFinanceDashboardProps>> = {
  overview: OverviewEvFinanceDashboard,
  detailed: DetailedEvFinanceDashboard,
};
