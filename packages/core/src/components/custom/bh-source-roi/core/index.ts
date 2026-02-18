/**
 * BhSourceRoi - Core Interface
 * Source channel analysis showing hire rate vs cost by source.
 *
 * Source ROI analytics are computed from candidates, outreach activities,
 * and search cost logs. The component works with aggregated metrics data.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSourceRoiPreset = 'summary' | 'breakdown';

/**
 * Source channel data (computed/aggregated from DB entities).
 */
export interface SourceChannel {
  id: string;
  name: string;
  type: 'linkedin' | 'referral' | 'job_board' | 'agency' | 'career_site' | 'social' | 'event' | 'other';
  candidateCount: number;
  hireCount: number;
  hireRate: number;
  totalCost: number;
  costPerHire: number;
  costPerCandidate: number;
  avgTimeToHireDays: number;
  qualityScore: number;
  retentionRate90d?: number;
  trend?: 'up' | 'down' | 'flat';
  previousPeriodHires?: number;
  channelUrl?: string;
  isActive?: boolean;
}

/**
 * Source trend over time (computed/aggregated).
 */
export interface SourceTrend {
  month: string;
  sourceId: string;
  hires: number;
  cost: number;
}

/**
 * ROI summary metrics (computed/aggregated).
 */
export interface SourceRoiSummary {
  totalSpend: number;
  totalHires: number;
  avgCostPerHire: number;
  bestRoiSource: string;
  worstRoiSource: string;
  roi?: number;
  budgetUtilization?: number;
  trendVsPrevious?: number;
  recommendedBudgetShift?: Record<string, number>;
}

export interface BhSourceRoiProps extends EngineAwareProps {
  preset?: BhSourceRoiPreset;

  /** Source channel data (computed/aggregated) */
  sources?: SourceChannel[];

  /** Trend data over time (computed/aggregated) */
  trends?: SourceTrend[];

  /** Summary metrics (computed/aggregated) */
  summary?: SourceRoiSummary;

  /** Sort field */
  sortBy?: 'hireRate' | 'costPerHire' | 'candidateCount' | 'qualityScore';

  /** Callback when sort changes */
  onSortChange?: (field: string) => void;

  /** Currently selected source for detail */
  selectedSource?: string | null;

  /** Callback when source is selected */
  onSourceSelect?: (sourceId: string | null) => void;

  /** Total budget for the period */
  budget?: number;

  /** Time period label */
  period?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SOURCE_ROI_DEFAULTS: Partial<BhSourceRoiProps> = {
  preset: 'summary',
};
