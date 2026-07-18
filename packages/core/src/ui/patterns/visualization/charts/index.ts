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
  ChartEmptyStateProps,
  ChartErrorStateProps,
  ChartLegendProps,
  ChartColorsProps,
  ChartColorSchemeProps,
  ChartMargin,
  ChartMarginProps,
  ChartNeutralStateProps,
  ChartScaffoldState,
  ChartStateProps,
  ChartSummaryTable,
  DataPoint,
  SeriesDataPoint,
  Series,
} from './contracts';
export { DEFAULT_COMPACT_CONFIG } from './contracts/compactness';
export { DEFAULT_MARGIN } from './foundation/geometry';
export { DEFAULT_COLORS } from './foundation/palettes';

// Hooks
export {
  useChartDimensions,
  useChartPersonality,
  useChartCompact,
  useChartTheme,
  useChartTooltip,
  useChartBrush,
  useChartViewport,
  useChartStream,
  applyStreamCommit,
  useChartExport,
} from './runtime';
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
  ChartDimensions,
  ChartDimensionsOptions,
  UseChartDimensionsResult,
  ChartAxisInterval,
  ChartDomain,
  ChartViewportAxis,
  ChartViewportBrushAxis,
  ChartViewportBrushConfig,
  ChartViewportBrushScale,
  ChartViewportConfig,
  ChartViewportPlotRect,
  ChartViewportResetButtonProps,
  ChartViewportRootProps,
  ChartViewportState,
  ChartViewportZoomConfig,
  ChartStreamOptions,
  ChartStreamState,
  ChartStreamWindow,
  UseChartExportReturn,
} from './runtime';

// Utils
export { exportChart } from './runtime/exporting';
export type { ChartExportOptions } from './runtime/exporting';

// Scaffold shell shared by every family (the Wave-0 delegation template)
export { ChartScaffold, describeChart, resolveChartScaffoldState } from './presentation/scaffold';
export type {
  ChartScaffoldProps,
  ChartScaffoldStateResolution,
} from './presentation/scaffold';

// Opt-in semantic-projection door for families
export { ChartFamilyFrame } from './presentation/family-frame';
export type {
  ChartFamilyFrameProps,
  ChartFamilyFrameStateProps,
} from './presentation/family-frame';

// Responsive chart experience kernel
export { ChartFrame, resolveChartProjection } from './runtime/chart-engine';
export {
  CHART_METRIC_TREND_RENDERER_ID,
  CHART_RANKED_ROWS_RENDERER_ID,
  ChartImperativePlot,
  ChartMetricTrendView,
  ChartRankedRowsView,
  buildChartTrendPoints,
  projectChartSummaryRows,
} from './runtime/chart-engine';
export type {
  ChartImperativePlotContext,
  ChartImperativePlotDraw,
  ChartImperativePlotProps,
  ChartMetricTrendContent,
  ChartMetricTrendTone,
  ChartMetricTrendViewProps,
  ChartRankedRowsColumn,
  ChartRankedRowsProjection,
  ChartRankedRowsSource,
  ChartRankedRowsViewProps,
} from './runtime/chart-engine';
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
} from './runtime/chart-engine';

// Concrete chart families
export {
  AreaChart,
  BarChart,
  BulletChart,
  CalendarHeatMap,
  FunnelChart,
  GanttChart,
  GaugeChart,
  HeatMap,
  Histogram,
  LineChart,
  NetworkGraph,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  TreeMap,
  WaterfallChart,
} from './families';
export type {
  AreaChartProps,
  BarChartProps,
  BulletChartProps,
  BulletDataPoint,
  CalendarHeatMapDataPoint,
  CalendarHeatMapProps,
  FunnelChartProps,
  GanttChartProps,
  GanttTask,
  GaugeChartProps,
  GaugeSegment,
  HeatMapProps,
  HistogramProps,
  LineChartProps,
  NetworkGraphProps,
  NetworkLink,
  NetworkNode,
  PieChartProps,
  RadarChartProps,
  SankeyChartProps,
  SankeyLink,
  SankeyNode,
  ScatterChartProps,
  ScatterDataPoint,
  SparklineProps,
  TreeMapNode,
  TreeMapProps,
  WaterfallChartProps,
  WaterfallDataPoint,
} from './families';

// Tooltip
export { ChartTooltip, TooltipValue, TooltipSeries } from './presentation/tooltip';
export type { ChartTooltipProps, ChartTooltipVariant } from './presentation/tooltip';
