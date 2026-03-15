/**
 * BhPipelineStatsBar - Core Interface
 * Pipeline conversion stats bar showing conversion rates,
 * avg time-to-hire, bottleneck indicator for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineStatsBarPreset = 'detailed' | 'compact';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface StageConversion {
  fromStage?: string;
  toStage?: string;
  rate?: number;
  candidateCount?: number;
  trend?: TrendDirection;
  avgDaysInStage?: number;
  slaLimit?: number;
  breachCount?: number;
}

export interface TimeToHireMetric {
  days?: number;
  trend?: TrendDirection;
  previousDays?: number;
  targetDays?: number;
  byDepartment?: Array<{ department: string; days: number }>;
}

export interface BhPipelineStatsBarProps extends EngineAwareProps {
  preset?: BhPipelineStatsBarPreset;

  /** Conversion rates between pipeline stages */
  conversionRates?: StageConversion[];

  /** Average time to hire metric */
  avgTimeToHire?: TimeToHireMetric;

  /** Stage name that is a bottleneck */
  bottleneckStage?: string | null;

  /** Total candidates across pipeline */
  totalCandidates?: number;

  /** Number of active job requisitions */
  activeJobs?: number;

  /** Callback when a stage conversion is clicked */
  onConversionClick?: (fromStage: string, toStage: string) => void;

  /** Callback when bottleneck indicator is clicked */
  onBottleneckClick?: (stage: string) => void;

  /** Offer acceptance rate percentage */
  offerAcceptanceRate?: number;

  /** Cost per hire metric */
  costPerHire?: number;

  /** Quality of hire metric */
  qualityOfHire?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_STATS_BAR_DEFAULTS: Partial<BhPipelineStatsBarProps> = {
  preset: 'detailed',
};
