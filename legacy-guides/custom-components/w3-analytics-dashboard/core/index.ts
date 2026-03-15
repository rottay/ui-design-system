/**
 * W3AnalyticsDashboard - Core Interface
 * Comprehensive Web3 analytics with transaction volume, gas usage, and wallet metrics
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3AnalyticsDashboardPreset = 'dashboard' | 'compact';

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

export interface W3AnalyticsDashboardProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3AnalyticsDashboardPreset;

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

export const W3_ANALYTICS_DASHBOARD_DEFAULTS: Partial<W3AnalyticsDashboardProps> = {
  preset: 'dashboard',
};
