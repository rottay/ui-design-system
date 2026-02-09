/**
 * PmRevenueDashboard - Core Interface
 * Track revenue metrics with MRR, ARR, churn, and growth rate dashboards
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRevenueDashboardPreset = 'dashboard' | 'report';

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

export interface PmRevenueDashboardProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRevenueDashboardPreset;

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

export const PM_REVENUE_DASHBOARD_DEFAULTS: Partial<PmRevenueDashboardProps> = {
  preset: 'dashboard',
};
