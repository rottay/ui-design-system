'use client';

/** Dedicated public entry for the supplier-independent chart experience kernel. */
export { ChartFrame } from '../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/projection/frame';
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
