/**
 * BhTeamPerformance - All Presets
 */

export { ChartBhTeamPerformance } from './chart';
export { CompactBhTeamPerformance } from './compact';

import type { BhTeamPerformancePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTeamPerformanceProps } from '../core';
import { ChartBhTeamPerformance } from './chart';
import { CompactBhTeamPerformance } from './compact';

export const BH_TEAM_PERFORMANCE_PRESETS: Record<BhTeamPerformancePreset, ComponentType<BhTeamPerformanceProps>> = {
  chart: ChartBhTeamPerformance,
  compact: CompactBhTeamPerformance,
};
