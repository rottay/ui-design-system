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
  'var(--ds-color-info-500)',
  'var(--ds-color-success-500)',
  'var(--ds-color-warning-500)',
  'var(--ds-color-error-500)',
  'var(--ds-color-secondary-500)',
  'var(--ds-color-primary-300)',
  'var(--ds-color-info-300)',
  'var(--ds-color-success-300)',
  'var(--ds-color-secondary-300)',
];

/** Lighter, softer tones for dashboards that favor a calm aesthetic */
export const PASTEL_COLORS = [
  'var(--ds-color-primary-200)',
  'var(--ds-color-info-200)',
  'var(--ds-color-success-200)',
  'var(--ds-color-warning-200)',
  'var(--ds-color-error-200)',
  'var(--ds-color-secondary-200)',
  'var(--ds-color-primary-100)',
  'var(--ds-color-info-100)',
  'var(--ds-color-success-100)',
  'var(--ds-color-secondary-100)',
];

/** High-saturation palette for bold, attention-grabbing charts */
export const VIBRANT_COLORS = [
  'var(--ds-color-primary-700)',
  'var(--ds-color-info-700)',
  'var(--ds-color-success-700)',
  'var(--ds-color-warning-700)',
  'var(--ds-color-error-700)',
  'var(--ds-color-secondary-700)',
  'var(--ds-color-primary-600)',
  'var(--ds-color-info-600)',
  'var(--ds-color-success-600)',
  'var(--ds-color-secondary-600)',
];

/** Single-hue scale derived from the tenant primary color */
export const MONOCHROME_COLORS = [
  'var(--ds-color-primary-900)',
  'var(--ds-color-primary-700)',
  'var(--ds-color-primary-600)',
  'var(--ds-color-primary-500)',
  'var(--ds-color-primary-400)',
  'var(--ds-color-primary-300)',
  'var(--ds-color-primary-200)',
  'var(--ds-color-primary-100)',
  'var(--ds-color-primary-50)',
  'var(--ds-color-primary-800)',
];

/**
 * Colorblind-safe palette using perceptually distinct hues.
 * Based on established accessible color sets (Wong, 2011).
 */
export const ACCESSIBLE_COLORS = [
  '#0072B2', // blue
  '#E69F00', // orange
  '#009E73', // bluish green
  '#CC79A7', // reddish purple
  '#F0E442', // yellow
  '#56B4E9', // sky blue
  '#D55E00', // vermilion
  '#000000', // black
  '#999999', // grey
  '#661100', // dark red
];

/** Map from colorScheme name to the corresponding palette */
export const COLOR_SCHEME_MAP: Record<string, string[]> = {
  default: DEFAULT_COLORS,
  pastel: PASTEL_COLORS,
  vibrant: VIBRANT_COLORS,
  monochrome: MONOCHROME_COLORS,
  accessible: ACCESSIBLE_COLORS,
};

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
