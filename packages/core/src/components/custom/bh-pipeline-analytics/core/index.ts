/**
 * BhPipelineAnalytics - Core Interface
 * Funnel visualization of application pipeline with conversion rates,
 * time-in-stage metrics, and bottleneck detection.
 * Tables: recruiting_applications (aggregated by status)
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { ApplicationStatusValue } from '@rottay/recruiter';

export type BhPipelineAnalyticsPreset = 'overview' | 'detailed';

/**
 * Pipeline stage status - uses DB ApplicationStatusValue where applicable,
 * plus custom stage names for UI grouping.
 */
export type PipelineStageStatus = ApplicationStatusValue | string;

export interface PipelineStage {
  id?: string;
  name?: string;
  status?: PipelineStageStatus;
  count?: number;
  previousPeriodCount?: number;
  conversionRate?: number;
  avgTimeInStageDays?: number;
  slaLimitDays?: number;
  dropoffCount?: number;
  slaLimitHours?: number;
  slaBreachCount?: number;
  bottleneckScore?: number;
  sourceBreakdown?: Record<string, number>;
  rejectionReasons?: Array<{ reason: string; count: number }>;
}

export interface PipelineBottleneck {
  stageId?: string;
  stageName?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  avgDelayDays?: number;
  impactedCandidates?: number;
}

export interface PipelineSummary {
  totalActive?: number;
  totalHired?: number;
  avgTimeToHireDays?: number;
  overallConversionRate?: number;
  bottleneckCount?: number;
  interviews?: number;
  offers?: number;
  costPerHire?: number;
}

export interface PipelineTrend {
  date?: string;
  applications?: number;
  hires?: number;
  interviews?: number;
  offers?: number;
  costPerHire?: number;
}

export interface BhPipelineAnalyticsProps extends EngineAwareProps {
  preset?: BhPipelineAnalyticsPreset;

  /** Pipeline stages data */
  stages?: PipelineStage[];

  /** Detected bottlenecks */
  bottlenecks?: PipelineBottleneck[];

  /** Summary metrics */
  summary?: PipelineSummary;

  /** Whether to show comparison with previous period */
  showComparison?: boolean;

  /** Callback when a stage is clicked for drill-down */
  onStageSelect?: (stageId: string | null) => void;

  /** Trend data over time */
  trends?: PipelineTrend[];

  /** Currently selected stage */
  selectedStage?: string | null;

  /** Whether to show comparison with a previous period */
  comparisonPeriod?: boolean;

  /** Export format for analytics data */
  exportFormat?: 'pdf' | 'csv';

  /** Callback when bottleneck is clicked */
  onBottleneckSelect?: (stageId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_ANALYTICS_DEFAULTS: Partial<BhPipelineAnalyticsProps> = {
  preset: 'overview',
};
