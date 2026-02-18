/**
 * BhAnalyticsHub - Core Interface
 * Comprehensive Analytics Dashboard for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { ApplicationSourceValue } from '@rottay/recruiter';

export type BhAnalyticsHubPreset = 'executive' | 'operational';

export type DateRangePreset = '7d' | '30d' | '90d' | 'year' | 'custom';

export interface FunnelStage {
  name?: string;
  count?: number;
  conversionPercent?: number;
  prevPeriodCount?: number;
}

export interface TimeToHireData {
  job?: string;
  avgDays?: number;
  stages?: { name?: string; avgDays?: number }[];
}

export interface SourceEffectiveness {
  /** Source identifier - maps to DB ApplicationSourceValue */
  source?: ApplicationSourceValue | string;
  candidateCount?: number;
  qualityScore?: number;
  hireCount?: number;
  hireRate?: number;
  costPerHire?: number;
  retentionRate?: number;
}

export interface RecruiterPerformance {
  name?: string;
  avatar?: string;
  hires?: number;
  velocity?: number;
  pipelineValue?: number;
  satisfaction?: number;
  sparkline?: number[];
  id?: string;
  activePositions?: number;
  avgTimeToFill?: number;
  offerAcceptanceRate?: number;
}

export interface CostAnalysis {
  category?: string;
  costPerHire?: number;
  breakdown?: { item?: string; cost?: number }[];
  trend?: number;
  previousPeriodCost?: number;
  savings?: number;
}

export interface PipelineVelocity {
  stage?: string;
  avgDays?: number;
  slaLimit?: number;
  breachCount?: number;
  trend?: 'improving' | 'declining' | 'stable';
}

export interface TrendComparison {
  date?: string;
  current?: number;
  previous?: number;
}

export interface BhAnalyticsHubProps extends EngineAwareProps {
  preset?: BhAnalyticsHubPreset;

  /** Current date range selection */
  dateRange?: DateRangePreset;

  /** Callback when date range changes */
  onDateRangeChange?: (range: DateRangePreset) => void;

  /** Whether comparison period is enabled */
  comparisonPeriod?: boolean;

  /** Callback to toggle comparison period */
  onComparisonToggle?: (enabled: boolean) => void;

  /** Hiring funnel stages data */
  funnelData?: FunnelStage[];

  /** Time-to-hire data by job/stage */
  timeToHireData?: TimeToHireData[];

  /** Source effectiveness data */
  sourceData?: SourceEffectiveness[];

  /** Recruiter performance data */
  recruiterData?: RecruiterPerformance[];

  /** Cost analysis data */
  costData?: CostAnalysis[];

  /** Pipeline velocity data */
  velocityData?: PipelineVelocity[];

  /** Diversity metrics data (optional module) */
  diversityData?: { category: string; value: number; total: number }[];

  /** Trend comparison data */
  trendData?: TrendComparison[];

  /** Active filters */
  filters?: Record<string, string>;

  /** Callback when filters change */
  onFilterChange?: (filters: Record<string, string>) => void;

  /** Currently selected metric for drill-down */
  selectedMetric?: string | null;

  /** Callback when a metric is selected */
  onMetricSelect?: (metric: string | null) => void;

  /** Current drill-down entity */
  drilldownEntity?: string | null;

  /** Callback when drill-down occurs */
  onDrilldown?: (entity: string | null) => void;

  /** Selected export format */
  exportFormat?: 'pdf' | 'csv' | 'email';

  /** Callback when export is triggered */
  onExport?: (format: 'pdf' | 'csv' | 'email') => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_ANALYTICS_HUB_DEFAULTS: Partial<BhAnalyticsHubProps> = {
  preset: 'executive',
};
