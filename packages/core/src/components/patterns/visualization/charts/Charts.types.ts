/**
 * @fileoverview Shared type definitions and color palettes for all chart
 * components. Defines ChartBaseProps (common to every chart), DataPoint/Series
 * shapes, and five named color schemes (default, pastel, vibrant, monochrome,
 * accessible) that map to --ds-color-* CSS variables.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Configuration for compact/responsive chart rendering on small screens.
 * When compact mode is active, charts reduce visual clutter by hiding legends,
 * limiting axis ticks, simplifying tooltips, and enforcing a minimum height.
 *
 * @example
 * ```tsx
 * <LineChart
 *   series={data}
 *   compact={{ hideLegend: true, maxTicks: 3, compactTooltip: true }}
 *   autoCompact
 * />
 * ```
 */
export interface ChartCompactConfig {
  /** Hide legend when compact mode is active */
  hideLegend?: boolean;
  /** Maximum number of axis ticks in compact mode */
  maxTicks?: number;
  /** Use compact tooltip (value only, no series name) */
  compactTooltip?: boolean;
  /** Hide series labels on chart elements */
  hideSeriesLabels?: boolean;
  /** Minimum height in pixels when compact mode is active */
  minHeight?: number;
}

/** Sensible defaults for compact mode so charts work well on mobile without config */
export const DEFAULT_COMPACT_CONFIG: Required<ChartCompactConfig> = {
  hideLegend: true,
  maxTicks: 4,
  compactTooltip: true,
  hideSeriesLabels: false,
  minHeight: 150,
};

/**
 * Common base props shared by every chart component (BarChart, LineChart,
 * PieChart, AreaChart, etc.). Controls dimensions, loading state,
 * title/subtitle, legend visibility, animation, color palette, and margins.
 *
 * @example
 * ```tsx
 * // These props are spread into any chart component:
 * <BarChart
 *   width="100%"
 *   height={400}
 *   title="Monthly Revenue"
 *   subtitle="Last 12 months"
 *   legend
 *   animate
 *   responsive
 *   colors={PASTEL_COLORS}
 *   tooltip
 *   margin={{ top: 20, right: 30, bottom: 40, left: 60 }}
 *   data={revenueData}
 * />
 * ```
 */
export interface ChartBaseProps {
  /** Width of the chart container (CSS value or pixel number) */
  width?: number | string;
  /** Height of the chart container in pixels */
  height?: number;
  /** Additional CSS class name applied to the chart wrapper */
  className?: string;
  /** Inline styles applied to the chart wrapper */
  style?: CSSProperties;
  /** Whether the chart is in a loading state (shows skeleton/spinner) */
  loading?: boolean;
  /** Chart title displayed above the chart area */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Whether to show the color legend */
  legend?: boolean;
  /** Whether to animate data transitions and initial render */
  animate?: boolean;
  /** Whether the chart resizes responsively with its container */
  responsive?: boolean;
  /** Custom color palette; falls back to DEFAULT_COLORS if not provided */
  colors?: string[];
  /** Whether to show tooltips on hover/focus */
  tooltip?: boolean;
  /** Pixel margins around the chart drawing area */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** Responsive compact configuration for small screens */
  compact?: ChartCompactConfig;
  /** Auto-detect compact mode based on container width (default: false) */
  autoCompact?: boolean;
  /** Container width breakpoint below which compact mode activates (default: 640px) */
  compactBreakpoint?: number;
}

/** Default 10-color palette using mid-range design system token values */
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

/** Default margin values applied when no custom margin is specified */
export const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * A single categorical data point used by pie, donut, and bar charts.
 * Additional arbitrary properties are forwarded to tooltip/render callbacks.
 */
export interface DataPoint {
  /** Category label displayed on the axis or legend */
  label: string;
  /** Numeric value for this data point */
  value: number;
  /** Optional color override for this specific data point */
  color?: string;
  /** Additional custom properties accessible in render callbacks */
  [key: string]: unknown;
}

/**
 * A single point within a data series, positioned by x (category or time)
 * and y (numeric value). Used by line, area, and multi-series bar charts.
 */
export interface SeriesDataPoint {
  /** Horizontal axis value (category label, numeric index, or Date) */
  x: string | number | Date;
  /** Vertical axis numeric value */
  y: number;
  /** Additional custom properties accessible in render callbacks */
  [key: string]: unknown;
}

/**
 * A named data series containing an ordered array of data points.
 * Multiple series are overlaid in line/area charts or grouped in bar charts.
 */
export interface Series {
  /** Display name shown in the legend and tooltips */
  name: string;
  /** Ordered array of data points belonging to this series */
  data: SeriesDataPoint[];
  /** Optional color override for this entire series */
  color?: string;
}
