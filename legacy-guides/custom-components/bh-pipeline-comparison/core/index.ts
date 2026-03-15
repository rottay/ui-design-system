/**
 * BhPipelineComparison - Core Interface
 * Side-by-side pipeline comparison for two jobs
 * in the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineComparisonPreset = 'side-by-side' | 'overlay';

export interface ComparisonStage {
  name?: string;
  candidateCount?: number;
  conversionRate?: number;
  avgDaysInStage?: number;
  dropoffRate?: number;
  slaBreachCount?: number;
  sourceBreakdown?: Record<string, number>;
}

export interface ComparisonJob {
  id?: string;
  title?: string;
  department?: string;
  recruiter?: string;
  totalCandidates?: number;
  stages?: ComparisonStage[];
  timeToHireDays?: number;
  overallConversionRate?: number;
  status?: string;
  startDate?: Date | string | null;
  hiringManager?: string;
  costPerHire?: number;
  qualityOfHire?: number;
}

export interface BhPipelineComparisonProps extends EngineAwareProps {
  preset?: BhPipelineComparisonPreset;

  /** First job to compare */
  jobA?: ComparisonJob;

  /** Second job to compare */
  jobB?: ComparisonJob;

  /** Callback when swap button is clicked */
  onSwap?: () => void;

  /** Whether to show delta values */
  showDelta?: boolean;

  /** Callback when a stage is clicked */
  onStageClick?: (jobId: string, stageName: string) => void;

  /** Metric to compare by */
  metric?: 'conversionRate' | 'avgDays' | 'candidateCount';

  /** Time period for comparison */
  period?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_COMPARISON_DEFAULTS: Partial<BhPipelineComparisonProps> = {
  preset: 'side-by-side',
};
