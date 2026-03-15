/**
 * BhMoneyballInsights - All Presets
 */

export { DashboardBhMoneyballInsights } from './dashboard';
export { DetailBhMoneyballInsights } from './detail';

import type { BhMoneyballInsightsPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhMoneyballInsightsProps } from '../core';
import { DashboardBhMoneyballInsights } from './dashboard';
import { DetailBhMoneyballInsights } from './detail';

export const BH_MONEYBALL_INSIGHTS_PRESETS: Record<BhMoneyballInsightsPreset, ComponentType<BhMoneyballInsightsProps>> = {
  dashboard: DashboardBhMoneyballInsights,
  detail: DetailBhMoneyballInsights,
};
