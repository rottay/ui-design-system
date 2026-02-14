/**
 * BhScoringInsights - Main Export
 * Scoring Analytics for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhScoringInsightsProps } from './core';
import { BH_SCORING_INSIGHTS_DEFAULTS } from './core';
import { BH_SCORING_INSIGHTS_PRESETS } from './presets';

export {
  type BhScoringInsightsProps,
  type BhScoringInsightsPreset,
  type ScoringKpi,
  type LevelDistribution,
  type HeatmapCell,
  type KnockoutStat,
  type TrendPoint,
  type CohortComparison,
  type SkillGapSummary,
  type SkillGap,
  type ScoringFilter,
  BH_SCORING_INSIGHTS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhScoringInsights component
 * Renders the appropriate preset based on the preset prop
 */
export function BhScoringInsights(props: BhScoringInsightsProps): React.ReactElement {
  const preset = props.preset ?? BH_SCORING_INSIGHTS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_SCORING_INSIGHTS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhScoringInsights.displayName = 'BhScoringInsights';

export { DashboardBhScoringInsights, DetailedBhScoringInsights } from './presets';
