/**
 * BhTimeToHireChart - Core Interface
 * Multi-line chart by department with rolling avg and target line
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhTimeToHireChartPreset = 'chart' | 'compact';

export interface TimeToHireDataPoint {
  date?: string;
  department?: string;
  days?: number;
}

export interface DepartmentConfig {
  name?: string;
  color?: string;
}

export interface BhTimeToHireChartProps extends EngineAwareProps {
  preset?: BhTimeToHireChartPreset;

  /** Data points for the chart */
  data?: TimeToHireDataPoint[];

  /** Department configurations */
  departments?: DepartmentConfig[];

  /** Target days to hire (draws horizontal line) */
  targetDays?: number;

  /** Rolling average window size */
  rollingAvgWindow?: number;

  /** Title */
  title?: string;

  /** Callback when a data point is clicked */
  onDataPointClick?: (point: TimeToHireDataPoint) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TIME_TO_HIRE_CHART_DEFAULTS: Partial<BhTimeToHireChartProps> = {
  preset: 'chart',
  targetDays: 30,
  rollingAvgWindow: 3,
};
