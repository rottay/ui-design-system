/**
 * BhScoringInsights - Core Interface
 * Scoring Analytics for the BitHire ATS platform
 *
 * This component works with analytics/aggregated data, not raw DB entities.
 * All data props are optional with safe defaults.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { ScorecardSelect, DimensionScoreSelect, RubricSelect } from '@rottay/scoring';

export type BhScoringInsightsPreset = 'dashboard' | 'detailed';

/** DB score level values from ScorecardSelect.scoreLevel */
export type ScoreLevelValue = 'excellent' | 'good' | 'average' | 'below' | 'poor';

export type ScoreColorKey = 'success' | 'primary' | 'warning' | 'error' | 'info' | 'secondary';

export interface ScoringKpi {
  label: string;
  value: number;
  trend?: number;
  previousValue?: number;
  unit?: string;
  description?: string;
}

export interface LevelDistribution {
  level: ScoreLevelValue | string;
  count: number;
  color?: string;
  colorKey?: ScoreColorKey;
}

export interface HeatmapCell {
  dimension: string;
  job: string;
  avgScore: number;
}

export interface KnockoutStat {
  dimension: string;
  knockoutCount: number;
  totalEvaluations: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CohortComparison {
  groupName: string;
  avgScore: number;
  count: number;
  medianScore?: number;
  stdDeviation?: number;
}

export interface SkillGapSummary {
  dimension: string;
  avgScore: number;
  gapFromTarget: number;
}

export interface ModelPerformance {
  model: string;
  avgLatencyMs: number;
  avgTokensUsed: number;
  totalScorecards: number;
  avgScore: number;
  errorRate: number;
}

export interface TokenUsageTrend {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface ScoreDistributionBucket {
  rangeMin: number;
  rangeMax: number;
  count: number;
  percentage: number;
}

export interface ScoringFilter {
  job?: string | null;
  stage?: string | null;
  team?: string | null;
  rubric?: string | null;
  model?: string | null;
}

export interface BhScoringInsightsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhScoringInsightsPreset;

  /** KPI summary cards */
  kpis?: ScoringKpi[];

  /** Level distribution data */
  levelDistribution?: LevelDistribution[];

  /** Heatmap data (dimension x job) */
  heatmapData?: HeatmapCell[];

  /** Knockout statistics per dimension */
  knockoutStats?: KnockoutStat[];

  /** Trend data over time */
  trendData?: TrendPoint[];

  /** Cohort comparison groups */
  cohortComparisons?: CohortComparison[];

  /** Skill gap analysis */
  skillGaps?: SkillGapSummary[];

  /** Model performance metrics */
  modelPerformance?: ModelPerformance[];

  /** Token usage trend data */
  tokenUsageTrends?: TokenUsageTrend[];

  /** Score distribution buckets */
  scoreDistributionBuckets?: ScoreDistributionBucket[];

  /** Total tokens used in period */
  totalTokensUsed?: number;

  /** Total scoring cost in period */
  totalScoringCost?: number;

  /** Average latency across all models */
  avgLatencyMs?: number;

  /** Active filters */
  filters?: ScoringFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: ScoringFilter) => void;

  /** Current date range */
  dateRange?: [string, string];

  /** Callback when date range changes */
  onDateRangeChange?: (range: [string, string]) => void;

  /** Currently selected dimension */
  selectedDimension?: string | null;

  /** Callback when a dimension is selected */
  onDimensionSelect?: (dimension: string | null) => void;

  /** Entity for drill-down */
  drilldownEntity?: string | null;

  /** Callback when drill-down entity changes */
  onDrilldown?: (entity: string | null) => void;

  /** Active chart type */
  chartType?: 'bar' | 'line' | 'area';

  /** Callback when chart type changes */
  onChartTypeChange?: (type: 'bar' | 'line' | 'area') => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SCORING_INSIGHTS_DEFAULTS: Partial<BhScoringInsightsProps> = {
  preset: 'dashboard',
};

/** Backward-compat alias (old name from pre-migration) */
export type SkillGap = SkillGapSummary;

/** Re-export DB types for convenience */
export type { ScorecardSelect, DimensionScoreSelect, RubricSelect };
