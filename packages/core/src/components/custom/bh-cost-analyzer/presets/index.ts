/**
 * BhCostAnalyzer - All Presets
 */

import type { BhCostAnalyzerPreset } from '../core';
import { DashboardBhCostAnalyzer } from './dashboard';
import { BreakdownBhCostAnalyzer } from './breakdown';

export { DashboardBhCostAnalyzer } from './dashboard';
export { BreakdownBhCostAnalyzer } from './breakdown';

export const BH_COST_ANALYZER_PRESETS: Record<BhCostAnalyzerPreset, React.ComponentType<any>> = {
  dashboard: DashboardBhCostAnalyzer,
  breakdown: BreakdownBhCostAnalyzer,
};
