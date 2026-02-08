/**
 * BhCostAnalyzer - Main Export
 * Multi-provider cost breakdown
 */

import type { BhCostAnalyzerProps } from './core';
import { BH_COST_ANALYZER_DEFAULTS } from './core';
import { BH_COST_ANALYZER_PRESETS } from './presets';

export { type BhCostAnalyzerProps, type BhCostAnalyzerPreset, type ProviderCost, type ModelCost, type CostTrendPoint, type TokenBalance, type BudgetAlert, type CostSummary, type CostCategory, type TrendDirection, BH_COST_ANALYZER_DEFAULTS } from './core';
export * from './presets';

export function BhCostAnalyzer(props: BhCostAnalyzerProps): React.ReactElement {
  const preset = props.preset ?? BH_COST_ANALYZER_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_COST_ANALYZER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCostAnalyzer.displayName = 'BhCostAnalyzer';

export { DashboardBhCostAnalyzer, BreakdownBhCostAnalyzer } from './presets';
