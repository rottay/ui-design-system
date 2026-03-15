/**
 * PmPaymentAnalytics - Core Interface
 * Analyze payment trends with volume, success rates, and method distribution
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentAnalyticsPreset = 'dashboard' | 'compact';

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

export interface PmPaymentAnalyticsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentAnalyticsPreset;

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

export const PM_PAYMENT_ANALYTICS_DEFAULTS: Partial<PmPaymentAnalyticsProps> = {
  preset: 'dashboard',
};
