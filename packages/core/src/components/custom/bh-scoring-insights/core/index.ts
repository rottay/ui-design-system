/**
 * BhScoringInsights - Core Interface
 * Scoring Analytics for the BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhScoringInsightsPreset = 'dashboard' | 'detailed';

export interface ScoringKpi {
  label: string;
  value: number;
  trend: number;
  previousValue: number;
}

export type ScoreColorKey = 'success' | 'primary' | 'warning' | 'error' | 'info' | 'secondary';

export interface LevelDistribution {
  level: string;
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
}

export interface CohortComparison {
  groupName: string;
  avgScore: number;
  count: number;
}

export interface SkillGap {
  dimension: string;
  avgScore: number;
  gapFromTarget: number;
}

export interface ScoringFilter {
  job?: string | null;
  stage?: string | null;
  team?: string | null;
  rubric?: string | null;
}

export interface BhScoringInsightsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhScoringInsightsPreset;

  /** KPI summary cards */
  kpis: ScoringKpi[];

  /** Level distribution data */
  levelDistribution: LevelDistribution[];

  /** Heatmap data (dimension x job) */
  heatmapData: HeatmapCell[];

  /** Knockout statistics per dimension */
  knockoutStats: KnockoutStat[];

  /** Trend data over time */
  trendData: TrendPoint[];

  /** Cohort comparison groups */
  cohortComparisons: CohortComparison[];

  /** Skill gap analysis */
  skillGaps: SkillGap[];

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
