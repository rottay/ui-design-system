/**
 * BhCostAnalyzer - All Presets
 */

import type { BhCostAnalyzerPreset, BhCostAnalyzerProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhCostAnalyzer } from './dashboard';
import { BreakdownBhCostAnalyzer } from './breakdown';

export { DashboardBhCostAnalyzer } from './dashboard';
export { BreakdownBhCostAnalyzer } from './breakdown';

export const BH_COST_ANALYZER_PRESETS: Record<BhCostAnalyzerPreset, ComponentType<BhCostAnalyzerProps>> = {
  dashboard: DashboardBhCostAnalyzer,
  breakdown: BreakdownBhCostAnalyzer,
};
