/**
 * BhSourceRoi - Core Interface
 * Source channel analysis showing hire rate vs cost by source.
 * Tables: recruiting_candidates.source + recruiting_metrics_search_costs
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSourceRoiPreset = 'summary' | 'breakdown';

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
}

export interface SourceTrend {
  month: string;
  sourceId: string;
  hires: number;
  cost: number;
}

export interface SourceRoiSummary {
  totalSpend: number;
  totalHires: number;
  avgCostPerHire: number;
  bestRoiSource: string;
  worstRoiSource: string;
}

export interface BhSourceRoiProps extends EngineAwareProps {
  preset?: BhSourceRoiPreset;

  /** Source channel data */
  sources?: SourceChannel[];

  /** Trend data over time */
  trends?: SourceTrend[];

  /** Summary metrics */
  summary?: SourceRoiSummary;

  /** Sort field */
  sortBy?: 'hireRate' | 'costPerHire' | 'candidateCount' | 'qualityScore';

  /** Callback when sort changes */
  onSortChange?: (field: string) => void;

  /** Currently selected source for detail */
  selectedSource?: string | null;

  /** Callback when source is selected */
  onSourceSelect?: (sourceId: string | null) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SOURCE_ROI_DEFAULTS: Partial<BhSourceRoiProps> = {
  preset: 'summary',
};
