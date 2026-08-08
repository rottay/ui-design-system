/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type R5Case = string;

export const R5_CASES: R5Case[] = [
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
