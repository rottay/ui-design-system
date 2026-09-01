/**
 * @fileoverview Shared type definitions and color palettes for all chart
 * components. Defines the universal chart surface plus opt-in capability
 * traits and DataPoint/Series shapes. A chart only extends the traits it
 * actually implements, so its
 * public TypeScript contract cannot advertise ignored props.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ChartPersonalityTokens } from '../../../../../foundation/contracts';

/** Personality-owned visual treatment for chart tooltip overlays. */
export type ChartTooltipVariant = ChartPersonalityTokens['tooltipStyle'];

/** Contract shared by the tooltip renderer and its state composition helper. */
export interface ChartTooltipProps {
  visible: boolean;
  x: number;
  y: number;
  children: ReactNode;
  autoFlip?: boolean;
  offset?: number;
  variant?: ChartTooltipVariant;
}

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
 * Accessible summary table every scaffold-backed family builds for screen
 * readers. It doubles as the source of the ranked-rows phone projection, so
 * it lives at the contracts tier where scaffold, families, and the frame
 * adapter can all consume it without peer imports.
 */
export interface ChartSummaryTable {
  caption?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

/**
 * Lifecycle states shared by the chart scaffold and every family shell.
 * Non-ready states never mount the plot, so stale or misleading marks can
 * never remain visible or interactive beneath feedback copy.
 *
 * This state machine is distinct from the family-computed `data-fallback`
 * overlay: that overlay is the INVALID-DATA semantic (unrenderable geometry
 * such as negative or NaN values), while `empty` is the zero-data semantic
 * and `loading`/`error` are caller-declared lifecycle facts.
 */
export type ChartScaffoldState = 'ready' | 'loading' | 'empty' | 'error';

/**
 * Neutral arm of the state contract: `ready` (default) and `loading` need no
 * state-specific copy beyond the always-required loading label. The optional
 * empty copy enables the automatic zero-data empty state: the design system
 * hardcodes no locale, so that state can only activate when the application
 * supplied the copy.
 */
export interface ChartNeutralStateProps {
  state?: 'ready' | 'loading';
  /** App-supplied copy that arms the automatic zero-data empty state. */
  emptyLabel?: ReactNode;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  errorLabel?: never;
  errorDescription?: never;
  errorAction?: never;
}

/** Explicit empty state; the visible and announced copy is app-required. */
export interface ChartEmptyStateProps {
  state: 'empty';
  /** Required visible and announced copy; the DS never hardcodes a locale. */
  emptyLabel: ReactNode;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  errorLabel?: never;
  errorDescription?: never;
  errorAction?: never;
}

/** Explicit error state; the visible and announced copy is app-required. */
export interface ChartErrorStateProps {
  state: 'error';
  /** Required visible and announced copy; the DS never hardcodes a locale. */
  errorLabel: ReactNode;
  errorDescription?: ReactNode;
  errorAction?: ReactNode;
  emptyLabel?: never;
  emptyDescription?: never;
  emptyAction?: never;
}

/**
 * Typed-required state copy union threaded by the scaffold and, as families
 * migrate, by every family contract: declaring `state='empty'` without
 * `emptyLabel` (or `state='error'` without `errorLabel`) is a type error.
 */
export type ChartStateProps =
  | ChartNeutralStateProps
  | ChartEmptyStateProps
  | ChartErrorStateProps;

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
