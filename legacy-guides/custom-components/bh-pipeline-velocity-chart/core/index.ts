/**
 * BhPipelineVelocityChart - Core Interface
 * Line chart showing candidates processed per day over configurable periods
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineVelocityChartPreset = 'line' | 'compact';

export type VelocityPeriod = 30 | 60 | 90;

export interface VelocityDataPoint {
  date?: string;
  count?: number;
  target?: number;
  hires?: number;
  interviews?: number;
  offers?: number;
  costPerHire?: number;
}

export interface BhPipelineVelocityChartProps extends EngineAwareProps {
  preset?: BhPipelineVelocityChartPreset;

  /** Time series data points */
  data?: VelocityDataPoint[];

  /** Selected period in days */
  period?: VelocityPeriod;

  /** Whether to show the target line */
  showTarget?: boolean;

  /** Whether to show the average line */
  showAverage?: boolean;

  /** Callback when user changes period */
  onPeriodChange?: (period: VelocityPeriod) => void;

  /** Metric to display on the chart */
  metric?: 'count' | 'hires' | 'interviews' | 'offers';

  /** Benchmark data for comparison overlay */
  benchmarkData?: Array<{ date?: string; value?: number }>;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_VELOCITY_CHART_DEFAULTS: Partial<BhPipelineVelocityChartProps> = {
  preset: 'line',
  period: 30,
  showTarget: true,
  showAverage: true,
};
