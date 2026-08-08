'use client';

/* R5 chart probe: one family per case, deterministic fixtures, so every
   stress axis the harness applies is the only variable in the frame. */

import type { ReactNode } from 'react';
import {
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
  WaterfallChart
} from '@rottay/design-system';
import type { R5Case } from './cases';

const POINTS = [
  { label: 'Alpha', value: 40 },
  { label: 'Beta', value: 25 },
  { label: 'Gamma', value: 15 },
];

const SERIES = [
  { name: 'Reviews', data: [{ x: 'Jan', y: 12 }, { x: 'Feb', y: 19 }, { x: 'Mar', y: 9 }] },
  { name: 'Offers', data: [{ x: 'Jan', y: 5 }, { x: 'Feb', y: 11 }, { x: 'Mar', y: 14 }] },
];

function Chart({ only }: { only: R5Case }): ReactNode {
  switch (only) {
    case 'area-chart':
      return <AreaChart series={SERIES} />;
    case 'bar-chart':
      return <BarChart data={POINTS} />;
    case 'bullet':
      return <BulletChart data={[{ label: "Revenue", value: 72, target: 90 }]} />;
    case 'calendar-heatmap':
      return <CalendarHeatMap data={[{ date: "2026-03-02", value: 4 }, { date: "2026-03-03", value: 9 }]} />;
    case 'funnel-chart':
      return <FunnelChart data={POINTS} />;
    case 'gantt-chart':
      return <GanttChart tasks={[{ id: "t1", name: "Design", start: "2026-03-01", end: "2026-03-10", progress: 40 }, { id: "t2", name: "Build", start: "2026-03-08", end: "2026-03-20" }]} />;
    case 'gauge':
      return <GaugeChart value={68} />;
    case 'heatmap':
      return <HeatMap data={[{ x: "Mon", y: "AM", value: 3 }, { x: "Tue", y: "PM", value: 8 }]} />;
    case 'histogram':
      return <Histogram values={[1, 2, 2, 3, 3, 3, 4, 4, 5, 8]} />;
    case 'line-chart':
      return <LineChart series={SERIES} />;
    case 'network-graph':
      return <NetworkGraph nodes={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]} links={[{ source: "a", target: "b" }]} />;
    case 'pie-chart':
      return <PieChart data={POINTS} />;
    case 'radar-chart':
      return <RadarChart data={[{ axis: "Speed", value: 7 }, { axis: "Cost", value: 4 }, { axis: "Scale", value: 9 }]} />;
    case 'sankey':
      return <SankeyChart nodes={[{ id: "a", label: "Source" }, { id: "b", label: "Sink" }]} links={[{ source: "a", target: "b", value: 5 }]} />;
    case 'scatter':
      return <ScatterChart data={[{ x: 1, y: 3 }, { x: 4, y: 7 }, { x: 6, y: 2 }]} />;
    case 'sparkline':
      return <Sparkline data={[3, 6, 4, 9, 7, 11]} />;
    case 'treemap':
      return <TreeMap data={[{ name: "Alpha", value: 40 }, { name: "Beta", value: 25 }]} />;
    case 'waterfall':
      return <WaterfallChart data={[{ label: "Start", value: 100 }, { label: "Fees", value: -20 }, { label: "Net", value: 80 }]} />;
    default:
      return null;
  }
}

export function R5ChartScene({ only }: { only: R5Case }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-chart-${only}`} style={{ inlineSize: '100%', maxInlineSize: 720 }}>
        <Chart only={only} />
      </div>
      <p data-testid="lab-chart-readout">{`chart: ${only}`}</p>
    </div>
  );
}
