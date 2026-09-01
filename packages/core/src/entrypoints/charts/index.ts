'use client';

/** Dedicated public entry for the supplier-independent chart experience kernel. */
export { ChartFrame } from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/frame';
export { ChartImperativePlot } from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/imperative';
export type {
  ChartImperativePlotContext,
  ChartImperativePlotDraw,
  ChartImperativePlotProps,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/imperative';
export {
  CHART_METRIC_TREND_RENDERER_ID,
  ChartMetricTrendView,
  buildChartTrendPoints,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/metric-trend';
export type {
  ChartMetricTrendContent,
  ChartMetricTrendTone,
  ChartMetricTrendViewProps,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/metric-trend';
export {
  CHART_RANKED_ROWS_RENDERER_ID,
  ChartRankedRowsView,
  projectChartSummaryRows,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/ranked-rows';
export type {
  ChartRankedRowsColumn,
  ChartRankedRowsProjection,
  ChartRankedRowsSource,
  ChartRankedRowsViewProps,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/ranked-rows';
export { ChartFamilyFrame } from '../../components/patterns/visualization/charts/presentation/family-frame';
export type {
  ChartFamilyFrameProps,
  ChartFamilyFrameStateProps,
} from '../../components/patterns/visualization/charts/presentation/family-frame';
export { ChartInsightSummary } from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/insight/summary';
export { resolveChartProjection } from '../../components/patterns/visualization/charts/runtime/chart-engine/foundation/projection';
export type {
  ChartFrameHeadingLevel,
  ChartFrameProps,
  ChartFrameStatus,
} from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/frame';
export type { ChartInsightSummaryProps } from '../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/insight/summary';
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
} from '../../components/patterns/visualization/charts/runtime/chart-engine/foundation/projection';
