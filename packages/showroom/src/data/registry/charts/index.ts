/**
 * Charts Registry
 *
 * Catalog of all 18 chart types in the design system.
 * All charts are D3-backed, engine-agnostic, token-aware, and personality-driven.
 */

export type ChartFamily =
  | 'basic'
  | 'statistical'
  | 'flow'
  | 'temporal'
  | 'spatial'
  | 'hierarchical'
  | 'relational'
  | 'kpi';

export interface ChartEntry {
  slug: string;
  name: string;
  family: ChartFamily;
  description: string;
  variants?: string[];
}

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

const basic: ChartEntry[] = [
  {
    slug: 'bar-chart',
    name: 'BarChart',
    family: 'basic',
    description: 'Vertical or horizontal bars for categorical comparisons',
    variants: ['simple', 'grouped', 'stacked'],
  },
  {
    slug: 'line-chart',
    name: 'LineChart',
    family: 'basic',
    description: 'Connected data points for trends over continuous axes',
  },
  {
    slug: 'area-chart',
    name: 'AreaChart',
    family: 'basic',
    description: 'Filled line chart emphasizing volume or magnitude',
  },
  {
    slug: 'pie-chart',
    name: 'PieChart',
    family: 'basic',
    description: 'Circular chart for part-to-whole proportions',
    variants: ['pie', 'donut'],
  },
  {
    slug: 'scatter',
    name: 'ScatterChart',
    family: 'basic',
    description: 'Point distribution across two axes',
    variants: ['scatter', 'bubble', 'trend-line'],
  },
];

// ---------------------------------------------------------------------------
// Statistical
// ---------------------------------------------------------------------------

const statistical: ChartEntry[] = [
  {
    slug: 'radar-chart',
    name: 'RadarChart',
    family: 'statistical',
    description: 'Multi-axis spider/radar chart for multivariate comparison',
  },
  {
    slug: 'gauge',
    name: 'GaugeChart',
    family: 'statistical',
    description: 'Arc gauge with segments and needle for KPI targets',
    variants: ['arc', 'segments', 'needle'],
  },
  {
    slug: 'histogram',
    name: 'Histogram',
    family: 'statistical',
    description: 'Frequency distribution with d3.bin bucketing',
    variants: ['standard', 'density', 'cumulative'],
  },
];

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------

const flow: ChartEntry[] = [
  {
    slug: 'funnel-chart',
    name: 'FunnelChart',
    family: 'flow',
    description: 'Stage-based funnel for conversion pipelines',
  },
  {
    slug: 'waterfall',
    name: 'WaterfallChart',
    family: 'flow',
    description: 'Running total chart with increase, decrease, and total bars',
    variants: ['increase', 'decrease', 'total'],
  },
  {
    slug: 'sankey',
    name: 'SankeyChart',
    family: 'flow',
    description: 'Flow diagram showing weighted relationships between nodes',
  },
];

// ---------------------------------------------------------------------------
// Temporal
// ---------------------------------------------------------------------------

const temporal: ChartEntry[] = [
  {
    slug: 'gantt-chart',
    name: 'GanttChart',
    family: 'temporal',
    description: 'Horizontal bar timeline for project scheduling and dependencies',
  },
  {
    slug: 'sparkline',
    name: 'Sparkline',
    family: 'temporal',
    description: 'Compact inline SVG trend chart with area fill and end dot',
  },
  {
    slug: 'calendar-heatmap',
    name: 'CalendarHeatMap',
    family: 'temporal',
    description: 'Daily activity grid showing value intensity over calendar months',
  },
];

// ---------------------------------------------------------------------------
// Spatial
// ---------------------------------------------------------------------------

const spatial: ChartEntry[] = [
  {
    slug: 'heatmap',
    name: 'HeatMap',
    family: 'spatial',
    description: 'Matrix grid with color-coded intensity values',
  },
];

// ---------------------------------------------------------------------------
// Hierarchical
// ---------------------------------------------------------------------------

const hierarchical: ChartEntry[] = [
  {
    slug: 'treemap',
    name: 'TreeMap',
    family: 'hierarchical',
    description: 'Nested rectangles representing hierarchical data proportions',
  },
];

// ---------------------------------------------------------------------------
// Relational
// ---------------------------------------------------------------------------

const relational: ChartEntry[] = [
  {
    slug: 'network-graph',
    name: 'NetworkGraph',
    family: 'relational',
    description: 'Force-directed node-link diagram for relationships',
  },
];

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------

const kpi: ChartEntry[] = [
  {
    slug: 'bullet',
    name: 'BulletChart',
    family: 'kpi',
    description: 'Compact chart comparing actual value against target with range bands',
  },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const charts: ChartEntry[] = [
  ...basic,
  ...statistical,
  ...flow,
  ...temporal,
  ...spatial,
  ...hierarchical,
  ...relational,
  ...kpi,
];

export const chartsByFamily: Record<ChartFamily, ChartEntry[]> = {
  basic,
  statistical,
  flow,
  temporal,
  spatial,
  hierarchical,
  relational,
  kpi,
};

export const chartFamilies: { slug: ChartFamily; label: string; count: number }[] = [
  { slug: 'basic', label: 'Basic', count: basic.length },
  { slug: 'statistical', label: 'Statistical', count: statistical.length },
  { slug: 'flow', label: 'Flow', count: flow.length },
  { slug: 'temporal', label: 'Temporal', count: temporal.length },
  { slug: 'spatial', label: 'Spatial', count: spatial.length },
  { slug: 'hierarchical', label: 'Hierarchical', count: hierarchical.length },
  { slug: 'relational', label: 'Relational', count: relational.length },
  { slug: 'kpi', label: 'KPI', count: kpi.length },
];
