/**
 * BhDiversityDashboard - Core Interface
 * Diversity metrics and analytics dashboard for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhDiversityDashboardPreset = 'dashboard' | 'compact';

export interface DiversitySegment {
  label: string;
  count: number;
  percentage: number;
}

export interface DiversityMetric {
  category: string;
  segments: DiversitySegment[];
}

export interface BhDiversityDashboardProps extends EngineAwareProps {
  preset?: BhDiversityDashboardPreset;

  /** Diversity metrics by category */
  metrics: DiversityMetric[];

  /** Total candidates count */
  totalCandidates: number;

  /** Dashboard title */
  title?: string;

  /** Callback when a segment is clicked */
  onSegmentClick?: (category: string, label: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_DIVERSITY_DASHBOARD_DEFAULTS: Partial<BhDiversityDashboardProps> = {
  preset: 'dashboard',
  title: 'Diversity & Inclusion',
};
