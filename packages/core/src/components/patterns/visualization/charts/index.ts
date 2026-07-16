/**
 * @fileoverview Charts barrel -- re-exports all D3-backed chart components,
 * shared types, color palettes, and the useChartPersonality hook. Charts are
 * not engine-based; they render SVG directly using D3 and respect design-system
 * tokens via the personality hook.
 */

// Types
export type {
  ChartBaseProps,
  ChartColorScheme,
  ChartCompactCoreConfig,
  ChartCartesianCompactConfig,
  ChartSeriesLabelCompactConfig,
  ChartCompactConfig,
  ChartCompactProps,
  ChartLegendProps,
  ChartColorsProps,
  ChartColorSchemeProps,
  ChartMargin,
  ChartMarginProps,
  DataPoint,
  SeriesDataPoint,
  Series,
} from './Charts.types';
export { DEFAULT_COLORS, DEFAULT_MARGIN, DEFAULT_COMPACT_CONFIG } from './Charts.types';

// Hooks
export {
  useChartDimensions,
  useChartPersonality,
  useChartCompact,
  useChartTheme,
  useChartTooltip,
  useChartBrush,
  useChartExport,
} from './hooks';
export type {
  ChartPersonalityOptions,
  ResolvedChartPersonality,
  UseChartCompactOptions,
  ResolvedChartCompact,
  ChartColorOwner,
  ChartTheme,
  ChartThemeOwner,
  UseChartTooltipReturn,
  BrushSelection,
  UseChartBrushOptions,
  UseChartBrushReturn,
  UseChartExportReturn,
} from './hooks';

// Utils
export { exportChart } from './utils';
export type { ChartExportOptions } from './utils';

// Responsive chart experience kernel
export { ChartFrame, resolveChartProjection } from './kernel';
export type {
  ChartAlternateProjectionView,
  ChartDeviceClass,
  ChartFrameHeadingLevel,
  ChartFrameProps,
  ChartFrameStatus,
  ChartFullProjectionView,
  ChartMicroProjectionView,
  ChartPhoneProjectionView,
  ChartProjectionSpec,
  ChartProjectionView,
  ChartRankedRowsProjectionView,
  ChartSummaryProjectionView,
  ChartTopNProjectionView,
} from './kernel';

// Charts
export { BarChart } from './bar-chart';
export type { BarChartProps } from './bar-chart';

export { LineChart } from './line-chart';
export type { LineChartProps } from './line-chart';

export { PieChart } from './pie-chart';
export type { PieChartProps } from './pie-chart';

export { AreaChart } from './area-chart';
export type { AreaChartProps } from './area-chart';

export { FunnelChart } from './funnel-chart';
export type { FunnelChartProps } from './funnel-chart';

export { RadarChart } from './radar-chart';
export type { RadarChartProps } from './radar-chart';

export { TreeMap } from './treemap';
export type { TreeMapProps, TreeMapNode } from './treemap';

export { HeatMap } from './heatmap';
export type { HeatMapProps } from './heatmap';

export { GanttChart } from './gantt-chart';
export type { GanttChartProps, GanttTask } from './gantt-chart';

export { NetworkGraph } from './network-graph';
export type { NetworkGraphProps, NetworkNode, NetworkLink } from './network-graph';

export { GaugeChart } from './gauge';
export type { GaugeChartProps, GaugeSegment } from './gauge';

export { Sparkline } from './sparkline';
export type { SparklineProps } from './sparkline';

export { WaterfallChart } from './waterfall';
export type { WaterfallChartProps, WaterfallDataPoint } from './waterfall';

export { ScatterChart } from './scatter';
export type { ScatterChartProps, ScatterDataPoint } from './scatter';

export { CalendarHeatMap } from './calendar-heatmap';
export type { CalendarHeatMapProps, CalendarHeatMapDataPoint } from './calendar-heatmap';

export { BulletChart } from './bullet';
export type { BulletChartProps, BulletDataPoint } from './bullet';

export { Histogram } from './histogram';
export type { HistogramProps } from './histogram';

export { SankeyChart } from './sankey';
export type { SankeyChartProps, SankeyNode, SankeyLink } from './sankey';

// Tooltip
export { ChartTooltip, TooltipValue, TooltipSeries } from './tooltip';
export type { ChartTooltipProps, ChartTooltipVariant } from './tooltip';
