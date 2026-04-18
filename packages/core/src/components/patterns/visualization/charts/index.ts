/**
 * @fileoverview Charts barrel -- re-exports all D3-backed chart components,
 * shared types, color palettes, and the useChartPersonality hook. Charts are
 * not engine-based; they render SVG directly using D3 and respect design-system
 * tokens via the personality hook.
 */

// Types
export type {
  ChartBaseProps,
  ChartCompactConfig,
  DataPoint,
  SeriesDataPoint,
  Series,
} from './Charts.types';
export { DEFAULT_COLORS, DEFAULT_MARGIN, DEFAULT_COMPACT_CONFIG } from './Charts.types';

// Hooks
export { useChartDimensions, useChartPersonality, useChartCompact } from './hooks';
export type { ChartPersonalityOptions, ResolvedChartPersonality, UseChartCompactOptions, ResolvedChartCompact } from './hooks';

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
