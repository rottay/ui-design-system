/**
 * BhProctoringHeatmap - Core Interface
 * Heatmap showing event density by hour and day of week
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringHeatmapPreset = 'grid' | 'compact';

export interface HeatmapDataPoint {
  /** Day of week: 0 = Sunday, 6 = Saturday */
  day: number;
  /** Hour of day: 0-23 */
  hour: number;
  /** Event count for this cell */
  count: number;
}

export interface BhProctoringHeatmapProps extends EngineAwareProps {
  preset?: BhProctoringHeatmapPreset;

  /** Heatmap data points */
  data: HeatmapDataPoint[];

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
