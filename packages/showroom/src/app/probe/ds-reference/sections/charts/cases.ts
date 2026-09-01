/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type ChartCase = string;

export const CHART_CASES: ChartCase[] = [
  'area-chart',
  'bar-chart',
  'bullet',
  'calendar-heatmap',
  'funnel-chart',
  'gantt-chart',
  'gauge',
  'heatmap',
  'histogram',
  'line-chart',
  'network-graph',
  'pie-chart',
  'radar-chart',
  'sankey',
  'scatter',
  'sparkline',
  'treemap',
  'waterfall'
];
