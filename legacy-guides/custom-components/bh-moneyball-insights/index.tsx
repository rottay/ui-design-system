/**
 * BhMoneyballInsights - Main Export
 * Recruiter Moneyball Analytics for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhMoneyballInsightsProps } from './core';
import { BH_MONEYBALL_INSIGHTS_DEFAULTS } from './core';
import { BH_MONEYBALL_INSIGHTS_PRESETS } from './presets';

export {
  type BhMoneyballInsightsProps,
  type BhMoneyballInsightsPreset,
  type PatternType,
  type InsightStatus,
  type MoneyballInsight,
  type MoneyballCorrelation,
  type AffectedCandidate,
  type InsightStats,
  BH_MONEYBALL_INSIGHTS_DEFAULTS,
} from './core';
export {
  getPatternTypeConfig,
  getInsightStatusConfig,
  getSignificanceStars,
  getCorrelationColor,
  formatPValue,
  getOutcomeConfig,
} from './core';
export * from './presets';

/**
 * BhMoneyballInsights component
 * Renders the appropriate preset based on the preset prop
 */
export function BhMoneyballInsights(props: BhMoneyballInsightsProps): React.ReactElement {
  const preset = props.preset ?? BH_MONEYBALL_INSIGHTS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_MONEYBALL_INSIGHTS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhMoneyballInsights.displayName = 'BhMoneyballInsights';

export { DashboardBhMoneyballInsights, DetailBhMoneyballInsights } from './presets';
