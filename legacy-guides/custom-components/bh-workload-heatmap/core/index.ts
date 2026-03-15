/**
 * BhWorkloadHeatmap - Core Interface
 * Dashboard widget showing recruiter workload distribution as a heatmap.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhWorkloadHeatmapPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Individual recruiter workload across weekdays */
export interface RecruiterWorkload {
  recruiterId: string;
  name: string;
  /** Array of load values per day (Mon-Fri), representing hours or tasks */
  dailyLoad: number[];
  weeklyTotal: number;
  capacity: number;
  /** Utilization percentage (0-100) */
  utilization: number;
}

/** Team workload heatmap data */
export interface WorkloadHeatmapData {
  recruiters: RecruiterWorkload[];
  weekDays: string[];
  avgUtilization: number;
  overloadedCount: number;
  underutilizedCount: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhWorkloadHeatmapProps extends EngineAwareProps {
  preset?: BhWorkloadHeatmapPreset;

  /** Workload heatmap data */
  data?: WorkloadHeatmapData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a recruiter row is clicked */
  onViewRecruiter?: (recruiterId: string) => void;

  /** Metric type displayed in cells */
  metric?: 'hours' | 'tasks';

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_WORKLOAD_HEATMAP_DEFAULTS: Partial<BhWorkloadHeatmapProps> = {
  preset: 'compact',
  metric: 'hours',
};

/** Re-export n helper for convenience */
export { n };
