/**
 * PmProviderMetrics - Core Interface
 * Compare provider performance metrics including latency, costs, and success rates
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmProviderMetricsPreset = 'dashboard' | 'comparison';

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

export interface PmProviderMetricsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmProviderMetricsPreset;

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

export const PM_PROVIDER_METRICS_DEFAULTS: Partial<PmProviderMetricsProps> = {
  preset: 'dashboard',
};
