/**
 * BhPipelineAnalytics - Core Interface
 * Funnel visualization of application pipeline with conversion rates,
 * time-in-stage metrics, and bottleneck detection.
 * Tables: recruiting_applications (aggregated by status)
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhPipelineAnalyticsPreset = 'overview' | 'detailed';

export type PipelineStageStatus =
  | 'new'
  | 'sourced'
  | 'screening'
  | 'phone_screen'
  | 'technical_interview'
  | 'onsite_interview'
  | 'panel_review'
  | 'reference_check'
  | 'offer_pending'
  | 'offer_extended'
  | 'offer_accepted'
  | 'hired';

export interface PipelineStage {
  id: string;
  name: string;
  status: PipelineStageStatus;
  count: number;
  previousPeriodCount?: number;
  conversionRate: number;
  avgTimeInStageDays: number;
  slaLimitDays?: number;
  dropoffCount: number;
}

export interface PipelineBottleneck {
  stageId: string;
  stageName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  avgDelayDays: number;
  impactedCandidates: number;
}

export interface PipelineSummary {
  totalActive: number;
  totalHired: number;
  avgTimeToHireDays: number;
  overallConversionRate: number;
  bottleneckCount: number;
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

  /** Currently selected stage */
  selectedStage?: string | null;

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
