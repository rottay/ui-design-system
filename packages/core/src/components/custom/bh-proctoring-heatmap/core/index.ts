/**
 * BhProctoringHeatmap - Core Interface
 * Heatmap showing event density by hour and day of week
 *
 * Pure visualization component. Uses ProctoringEventSeverityValue
 * from @rottay/scoring for severity type reference.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringHeatmapPreset = 'grid' | 'compact';

/** Backward-compat alias (old name from pre-migration) */
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

export interface HeatmapDataPoint {
  /** Day of week: 0 = Sunday, 6 = Saturday */
  day: number;
  /** Hour of day: 0-23 */
  hour: number;
  /** Event count for this cell */
  count: number;
  /** Average severity score for this cell (0-1 scale, for color weighting) */
  averageSeverity?: number;
  /** Breakdown of event counts by severity for this cell */
  severityBreakdown?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  /** Number of reviewed events in this cell */
  reviewedCount?: number;
  /** Number of dismissed events in this cell */
  dismissedCount?: number;
}

export interface BhProctoringHeatmapProps extends EngineAwareProps {
  preset?: BhProctoringHeatmapPreset;

  /** Heatmap data points */
  data?: HeatmapDataPoint[];

  /** Callback when a cell is clicked */
  onCellClick?: (day: number, hour: number, count: number) => void;

  /** Color scale override (uses error scale by default) */
  colorScale?: 'error' | 'warning' | 'primary' | 'info';

  /** Show count values inside cells */
  showValues?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_HEATMAP_DEFAULTS: Partial<BhProctoringHeatmapProps> = {
  preset: 'grid',
  colorScale: 'error',
  showValues: false,
};

/** Re-export DB types for convenience */
export type { ProctoringEventSeverity };
