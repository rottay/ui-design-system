/**
 * W3TvlTracker - Core Interface
 * Track Total Value Locked across protocols with historical trends and breakdowns
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TvlTrackerPreset = 'chart' | 'summary';

export interface MetricCard {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface W3TvlTrackerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TvlTrackerPreset;

  /** Loading state */
  loading?: boolean;
  /** Metric cards */
  metrics?: MetricCard[];
  /** Chart data */
  chartData?: ChartDataPoint[];
  /** Time range */
  timeRange?: '24h' | '7d' | '30d' | '90d';
  /** Callback when time range changes */
  onTimeRangeChange?: (range: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TVL_TRACKER_DEFAULTS: Partial<W3TvlTrackerProps> = {
  preset: 'chart',
};
