import type { CSSProperties, ReactNode } from 'react';

export interface ChartBaseProps {
  width?: number | string;
  height?: number;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  legend?: boolean;
  animate?: boolean;
  responsive?: boolean;
  colors?: string[];
  tooltip?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const DEFAULT_COLORS = [
  'var(--ds-color-primary-500)',
  'var(--ds-color-success-500)',
  'var(--ds-color-warning-500)',
  'var(--ds-color-error-500)',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
];

export const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

export interface SeriesDataPoint {
  x: string | number | Date;
  y: number;
  [key: string]: unknown;
}

export interface Series {
  name: string;
  data: SeriesDataPoint[];
  color?: string;
}
