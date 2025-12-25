/**
 * DashboardCard Presets
 */

export { CompactDashboardCard } from './compact';
export { TrendingDashboardCard } from './trending';
export { ChartDashboardCard } from './chart';
export { DetailedDashboardCard } from './detailed';

import type { DashboardCardPreset } from '../core';
import type { ComponentType } from 'react';
import type { DashboardCardProps } from '../core';
import { CompactDashboardCard } from './compact';
import { TrendingDashboardCard } from './trending';
import { ChartDashboardCard } from './chart';
import { DetailedDashboardCard } from './detailed';

export const DASHBOARD_CARD_PRESETS: Record<DashboardCardPreset, ComponentType<DashboardCardProps>> = {
  compact: CompactDashboardCard,
  trending: TrendingDashboardCard,
  chart: ChartDashboardCard,
  detailed: DetailedDashboardCard,
};
