/**
 * @fileoverview Shared type definitions and color palettes for all chart
 * components. Defines the universal chart surface plus opt-in capability
 * traits, DataPoint/Series shapes, and five named color schemes (default,
 * pastel, vibrant, monochrome, accessible) that map to --ds-color-* CSS
 * variables. A chart only extends the traits it actually implements, so its
 * public TypeScript contract cannot advertise ignored props.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Compact options shared by every chart family that supports compact mode.
 * Axis and mark-label controls are composed separately so families cannot
 * advertise a compact behavior they do not render.
 *
 * @example
 * ```tsx
 * <LineChart
 *   series={data}
 *   compact={{ hideLegend: true, maxTicks: 3, compactTooltip: true }}
 *   compactMode
 *   autoCompact
 * />
 * ```
 */
export interface ChartCompactCoreConfig {
  /** Hide legend when compact mode is active */
  hideLegend?: boolean;
  /** Use compact tooltip (value only, no series name) */
  compactTooltip?: boolean;
  /** Minimum height in pixels when compact mode is active */
  minHeight?: number;
}

/** Compact options implemented by charts with numeric/category axes. */
export interface ChartCartesianCompactConfig extends ChartCompactCoreConfig {
  /** Maximum number of axis ticks in compact mode */
  maxTicks?: number;
}

/** Compact options implemented by charts that render labels on their marks. */
export interface ChartSeriesLabelCompactConfig extends ChartCompactCoreConfig {
  /** Hide series labels on chart elements */
  hideSeriesLabels?: boolean;
}

/**
 * Complete compact configuration accepted by the resolver hook. When compact
 * mode is active it can hide legends, limit axis ticks, simplify tooltips,
 * hide mark labels, and enforce a minimum height.
 */
export interface ChartCompactConfig
  extends ChartCartesianCompactConfig, ChartSeriesLabelCompactConfig {}

/** Sensible defaults for compact mode so charts work well on mobile without config */
export const DEFAULT_COMPACT_CONFIG: Required<ChartCompactConfig> = {
  hideLegend: true,
  maxTicks: 4,
  compactTooltip: true,
  hideSeriesLabels: false,
  minHeight: 150,
};

/**
 * Universal props implemented by every scaffold-backed chart component.
 * Optional capabilities such as legends, palettes, margins, and compact mode
 * are declared separately below and composed by each chart family.
 *
 * @example
 * ```tsx
 * // Universal surface props:
 * <BarChart
 *   width="100%"
 *   height={400}
 *   title="Monthly Revenue"
 *   subtitle="Last 12 months"
 *   animate
 *   responsive
 *   tooltip
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
  /** Whether to animate data transitions and initial render */
  animate?: boolean;
  /** Whether the chart resizes responsively with its container */
  responsive?: boolean;
  /** Whether to show tooltips on hover/focus */
  tooltip?: boolean;
}

/** Opt-in legend capability. */
export interface ChartLegendProps {
  /** Whether to show the color legend */
  legend?: boolean;
}

/** Opt-in explicit palette capability. */
export interface ChartColorsProps {
  /** Custom color palette; falls back to the active chart personality */
  colors?: string[];
}

/** Opt-in named-palette capability. */
export interface ChartColorSchemeProps {
  /** Named palette resolved from the active tenant/brand chart personality */
  colorScheme?: ChartColorScheme;
}

/** Insets around the chart drawing area. */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Opt-in drawing-area margin capability. */
export interface ChartMarginProps {
  /** Pixel margins around the chart drawing area */
  margin?: ChartMargin;
}

/** Opt-in compact-mode capability, narrowed per chart family. */
export interface ChartCompactProps<
  TConfig extends ChartCompactCoreConfig = ChartCompactConfig,
> {
  /** Responsive compact configuration, applied only while compact mode is active */
  compact?: TConfig;
  /** Explicitly activate compact mode (default: false) */
  compactMode?: boolean;
  /** Auto-detect compact mode based on container width (default: false) */
  autoCompact?: boolean;
  /** Container width breakpoint below which compact mode activates (default: 640px) */
  compactBreakpoint?: number;
}

export type ChartColorScheme =
  | 'default'
  | 'pastel'
  | 'vibrant'
  | 'monochrome'
  | 'accessible';

/**
 * Restrained legacy categorical fallback. The React-owned kernel resolves a
 * theme-aware/provider-scoped channel instead; this concrete sequence remains
 * for imperative families and SSR fallbacks while they migrate. It excludes
 * raw black and bright yellow because each disappears on a supported surface.
 */
export const ACCESSIBLE_COLORS = [
  '#2F6B9A',
  '#A23B72',
  '#1F7A55',
  '#9A5700',
  '#355CB5',
  '#7A4595',
  '#5F6368',
  '#006D77',
  '#9B4A5A',
  '#4D6A00',
];

/**
 * Default 10-color palette for a no-config legacy chart. Status tokens are
 * not reused as arbitrary categories. New kernel renderers additionally map
 * the same channel through provider-scoped light/dark variables.
 */
export const DEFAULT_COLORS = ACCESSIBLE_COLORS;

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
