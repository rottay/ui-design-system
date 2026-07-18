'use client';

/** Dedicated public entry for the supplier-independent chart experience kernel. */
export { ChartFrame } from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/frame';
export { ChartImperativePlot } from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/imperative';
export type {
  ChartImperativePlotContext,
  ChartImperativePlotDraw,
  ChartImperativePlotProps,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/imperative';
export {
  CHART_METRIC_TREND_RENDERER_ID,
  ChartMetricTrendView,
  buildChartTrendPoints,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/metric-trend';
export type {
  ChartMetricTrendContent,
  ChartMetricTrendTone,
  ChartMetricTrendViewProps,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/metric-trend';
export {
  CHART_RANKED_ROWS_RENDERER_ID,
  ChartRankedRowsView,
  projectChartSummaryRows,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/ranked-rows';
export type {
  ChartRankedRowsColumn,
  ChartRankedRowsProjection,
  ChartRankedRowsSource,
  ChartRankedRowsViewProps,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/ranked-rows';
export { ChartFamilyFrame } from '../../ui/patterns/visualization/charts/presentation/family-frame';
export type {
  ChartFamilyFrameProps,
  ChartFamilyFrameStateProps,
} from '../../ui/patterns/visualization/charts/presentation/family-frame';
export { ChartInsightSummary } from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/insight/summary';
export { resolveChartProjection } from '../../ui/patterns/visualization/charts/runtime/chart-engine/foundation/projection';
export type {
  ChartFrameHeadingLevel,
  ChartFrameProps,
  ChartFrameStatus,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/frame';
export type { ChartInsightSummaryProps } from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/insight/summary';
export type {
  ChartAlternateProjectionView,
  ChartDeviceClass,
  ChartFullProjectionView,
  ChartMicroProjectionView,
  ChartPhoneProjectionView,
  ChartProjectionSpec,
  ChartProjectionView,
  ChartRankedRowsProjectionView,
  ChartSummaryProjectionView,
  ChartTopNProjectionView,
} from '../../ui/patterns/visualization/charts/runtime/chart-engine/foundation/projection';
