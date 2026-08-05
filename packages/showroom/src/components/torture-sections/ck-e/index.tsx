'use client';

import { useRef, type CSSProperties } from 'react';
import {
  AreaChart,
  BarChart,
  Box,
  BulletChart,
  CalendarHeatMap,
  Card,
  FunnelChart,
  GanttChart,
  GaugeChart,
  HeatMap,
  Histogram,
  LineChart,
  NetworkGraph,
  PatternCalendarView,
  PatternKanbanBoard,
  PatternMapView,
  PatternTimeline,
  PatternTreeView,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  Stack,
  Text,
  TreeMap,
  WaterfallChart,
  useChartBrush,
} from '@rottay/design-system';
import { useTortureFrame } from '@/components/torture-sections/frame';

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-E -- visualization anatomy + paint fixture (?ckE=1).
//
// Every Stage-1 visualization owner renders here with deterministic data and
// motion disabled. The non-chart band exercises both engine implementations;
// the chart catalog covers shared scaffold, tooltip, D3, intrinsic-SVG and
// brush channels under one hostile-tenant capture surface.
// ---------------------------------------------------------------------------

const CK_E_COLORS = [
  'var(--ds-color-primary)',
  'var(--ds-color-secondary)',
  'var(--ds-color-info)',
  'var(--ds-color-success)',
] as const;

const CK_E_SERIES = [
  { name: 'North', color: CK_E_COLORS[0], data: [{ x: 'Mon', y: 18 }, { x: 'Tue', y: 27 }, { x: 'Wed', y: 22 }, { x: 'Thu', y: 34 }] },
  { name: 'South', color: CK_E_COLORS[1], data: [{ x: 'Mon', y: 12 }, { x: 'Tue', y: 20 }, { x: 'Wed', y: 29 }, { x: 'Thu', y: 25 }] },
];

const CK_E_POINTS = [
  { label: 'Discovery', value: 120, color: CK_E_COLORS[0] },
  { label: 'Qualified', value: 82, color: CK_E_COLORS[1] },
  { label: 'Proposal', value: 49, color: CK_E_COLORS[2] },
  { label: 'Won', value: 31, color: CK_E_COLORS[3] },
];

const CK_E_CHART_CELL_STYLE: CSSProperties = {
  minWidth: 0,
  border: '1px solid var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-lg)',
  background: 'var(--ds-color-bg-primary)',
  padding: 12,
  overflow: 'hidden',
};

function CkEBrushFixture() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const brush = useChartBrush({
    svgRef,
    width: 440,
    height: 58,
    margin: { top: 8, right: 16, bottom: 8, left: 16 },
    brushHeight: 34,
    enabled: true,
  });

  return (
    <svg ref={svgRef} width="100%" height={100} viewBox="0 0 440 100" aria-label="Deterministic chart brush">
      <path d="M16 44 L90 22 L164 36 L238 14 L312 31 L424 18" fill="none" stroke="currentColor" />
      {brush.renderBrush()}
    </svg>
  );
}

export function CkEStates() {
  const { engine } = useTortureFrame();
  const currentDate = new Date('2026-07-14T12:00:00');
  const calendarEvents = [
    { id: 'kickoff', title: 'Launch kickoff', start: '2026-07-14T10:00:00', color: CK_E_COLORS[0] },
    { id: 'review', title: 'Design review', start: '2026-07-18T14:00:00', color: CK_E_COLORS[1] },
  ];
  const tasks = [
    { id: 'brief', title: 'Brief approved', owner: 'Mara' },
    { id: 'prototype', title: 'Prototype', owner: 'Noah' },
  ];

  return (
    <Box
      data-testid="probe-ck-e"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="sm" data-testid="probe-ck-e-patterns">
          <Text size="xs" color="secondary">Visualization patterns — normal, selected, empty-target and interactive anatomy ({engine})</Text>
          <PatternCalendarView
            engine={engine}
            currentDate={currentDate}
            view="month"
            events={calendarEvents}
            onDateChange={() => undefined}
            onViewChange={() => undefined}
          />
          <PatternKanbanBoard
            engine={engine}
            columns={[
              { id: 'todo', title: 'To do', color: CK_E_COLORS[0], items: tasks, limit: 3 },
              { id: 'doing', title: 'In progress', color: CK_E_COLORS[1], items: [tasks[1]], limit: 1 },
              { id: 'done', title: 'Done', color: CK_E_COLORS[3], items: [] },
            ]}
            renderCard={(item) => <Card title={item.title}><Text size="xs">{item.owner}</Text></Card>}
            itemKey={(item) => item.id}
            onItemMove={() => undefined}
            onItemClick={() => undefined}
            onAddItem={() => undefined}
          />
          <PatternMapView
            engine={engine}
            height={280}
            selectedMarkerId="miami"
            markers={[
              { id: 'miami', lat: 25.7617, lng: -80.1918, label: 'Miami', color: CK_E_COLORS[0] },
              { id: 'buenos-aires', lat: -34.6037, lng: -58.3816, label: 'Buenos Aires', color: CK_E_COLORS[1] },
            ]}
            toolbar={<Text size="sm">Venue coverage</Text>}
            sidebar={<Text size="sm">2 active regions</Text>}
          />
          <PatternTimeline
            engine={engine}
            mode="alternate"
            groupByDate
            showTimestamp
            onItemClick={() => undefined}
            items={[
              { key: 'one', timestamp: '2026-07-14T10:00:00', title: 'Campaign launched', description: 'First cohort enabled', type: 'info' },
              { key: 'two', timestamp: '2026-07-14T13:30:00', title: 'Goal reached', description: 'Conversion target crossed', type: 'success' },
              { key: 'three', timestamp: '2026-07-15T09:00:00', title: 'Review needed', description: 'One segment needs attention', type: 'warning' },
            ]}
          />
          <PatternTreeView
            engine={engine}
            searchable
            checkable
            draggable
            defaultExpandedKeys={['workspace', 'reports']}
            selectedKeys={['q3']}
            checkedKeys={['revenue']}
            data={[
              { key: 'workspace', label: 'Workspace', children: [
                { key: 'reports', label: 'Reports', children: [
                  { key: 'q3', label: 'Q3 forecast' },
                  { key: 'revenue', label: 'Revenue model' },
                ] },
                { key: 'archive', label: 'Archive', disabled: true },
              ] },
            ]}
          />
          <Box
            data-testid="probe-ck-e-loading"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}
          >
            <Box data-loading-fixture="calendar" style={CK_E_CHART_CELL_STYLE}>
              <PatternCalendarView engine={engine} events={[]} currentDate={currentDate} loading />
            </Box>
            <Box data-loading-fixture="kanban" style={CK_E_CHART_CELL_STYLE}>
              <PatternKanbanBoard
                engine={engine}
                columns={[]}
                renderCard={() => null}
                itemKey={() => 'loading'}
                onItemMove={() => undefined}
                loading
              />
            </Box>
            <Box data-loading-fixture="map" style={CK_E_CHART_CELL_STYLE}>
              <PatternMapView engine={engine} markers={[]} height={180} loading />
            </Box>
            <Box data-loading-fixture="timeline" style={CK_E_CHART_CELL_STYLE}>
              <PatternTimeline engine={engine} items={[]} loading />
            </Box>
            <Box data-loading-fixture="tree" style={CK_E_CHART_CELL_STYLE}>
              <PatternTreeView engine={engine} data={[]} loading />
            </Box>
          </Box>
        </Stack>

        <Stack spacing="sm" data-testid="probe-ck-e-charts">
          <Text size="xs" color="secondary">D3 and SVG chart catalog — fixed geometry, no animation</Text>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 12 }}>
            <Box data-chart-fixture="bar" style={CK_E_CHART_CELL_STYLE}><BarChart width="100%" height={260} title="Pipeline" data={CK_E_POINTS} legend showValues animate={false} tooltip /></Box>
            <Box data-chart-fixture="line" style={CK_E_CHART_CELL_STYLE}><LineChart width="100%" height={260} title="Velocity" series={CK_E_SERIES} legend showDots showArea animate={false} tooltip /></Box>
            <Box data-chart-fixture="area" style={CK_E_CHART_CELL_STYLE}><AreaChart width="100%" height={260} title="Capacity" series={CK_E_SERIES} legend stacked animate={false} tooltip /></Box>
            <Box data-chart-fixture="pie" style={CK_E_CHART_CELL_STYLE}><PieChart width="100%" height={260} title="Mix" data={CK_E_POINTS} donut legend showLabels showPercentage animate={false} tooltip /></Box>
            <Box data-chart-fixture="funnel" style={CK_E_CHART_CELL_STYLE}><FunnelChart width="100%" height={260} title="Conversion" data={CK_E_POINTS} legend showPercentage showConversion animate={false} tooltip /></Box>
            <Box data-chart-fixture="radar" style={CK_E_CHART_CELL_STYLE}><RadarChart width="100%" height={260} title="Readiness" data={[{ axis: 'Quality', value: 82 }, { axis: 'Speed', value: 68 }, { axis: 'Reach', value: 91 }, { axis: 'Trust', value: 76 }]} legend animate={false} /></Box>
            <Box data-chart-fixture="treemap" style={CK_E_CHART_CELL_STYLE}><TreeMap width="100%" height={260} title="Allocation" data={[{ name: 'Product', value: 42 }, { name: 'Growth', value: 28 }, { name: 'Ops', value: 19 }, { name: 'Risk', value: 11 }]} legend showLabels animate={false} /></Box>
            <Box data-chart-fixture="heatmap" style={CK_E_CHART_CELL_STYLE}><HeatMap width="100%" height={260} title="Demand" data={[{ x: 'Mon', y: 'AM', value: 12 }, { x: 'Tue', y: 'AM', value: 26 }, { x: 'Mon', y: 'PM', value: 33 }, { x: 'Tue', y: 'PM', value: 18 }]} animate={false} /></Box>
            <Box data-chart-fixture="calendar-heatmap" style={CK_E_CHART_CELL_STYLE}><CalendarHeatMap width="100%" height={260} title="Activity" startDate="2026-07-01" endDate="2026-07-28" data={[{ date: '2026-07-02', value: 3 }, { date: '2026-07-09', value: 7 }, { date: '2026-07-16', value: 11 }, { date: '2026-07-23', value: 5 }]} animate={false} /></Box>
            <Box data-chart-fixture="gantt" style={CK_E_CHART_CELL_STYLE}><GanttChart width="100%" height={260} title="Delivery" tasks={[{ id: 'research', name: 'Research', start: '2026-07-01', end: '2026-07-08', progress: 100, color: CK_E_COLORS[0] }, { id: 'build', name: 'Build', start: '2026-07-06', end: '2026-07-20', progress: 58, color: CK_E_COLORS[1] }, { id: 'ship', name: 'Ship', start: '2026-07-19', end: '2026-07-26', progress: 12, color: CK_E_COLORS[3] }]} animate={false} /></Box>
            <Box data-chart-fixture="gauge" style={CK_E_CHART_CELL_STYLE}><GaugeChart width="100%" height={260} title="Health" value={74} label="System score" legend animate={false} segments={[{ from: 0, to: 40, color: 'var(--ds-color-error)', label: 'Risk' }, { from: 40, to: 70, color: 'var(--ds-color-warning)', label: 'Watch' }, { from: 70, to: 100, color: 'var(--ds-color-success)', label: 'Healthy' }]} /></Box>
            <Box data-chart-fixture="histogram" style={CK_E_CHART_CELL_STYLE}><Histogram width="100%" height={260} title="Distribution" values={[2, 3, 3, 4, 5, 5, 5, 6, 7, 8, 8, 9, 10, 12]} bins={6} cumulativeLine showLabels legend animate={false} /></Box>
            <Box data-chart-fixture="scatter" style={CK_E_CHART_CELL_STYLE}><ScatterChart width="100%" height={260} title="Impact" data={[{ x: 2, y: 4, size: 8, label: 'A', color: CK_E_COLORS[0] }, { x: 5, y: 7, size: 16, label: 'B', color: CK_E_COLORS[1] }, { x: 8, y: 11, size: 22, label: 'C', color: CK_E_COLORS[2] }]} bubble trendLine legend animate={false} tooltip /></Box>
            <Box data-chart-fixture="waterfall" style={CK_E_CHART_CELL_STYLE}><WaterfallChart width="100%" height={260} title="Net change" data={[{ label: 'Start', value: 80, type: 'total' }, { label: 'Growth', value: 28 }, { label: 'Churn', value: -13 }, { label: 'End', value: 95, type: 'total' }]} legend animate={false} /></Box>
            <Box data-chart-fixture="bullet" style={CK_E_CHART_CELL_STYLE}><BulletChart width="100%" height={260} title="Targets" data={[{ label: 'Revenue', value: 78, target: 86, ranges: [45, 70, 100] }, { label: 'Retention', value: 91, target: 88, ranges: [55, 75, 100] }]} legend animate={false} /></Box>
            <Box data-chart-fixture="sankey" style={CK_E_CHART_CELL_STYLE}><SankeyChart width="100%" height={260} title="Flow" nodes={[{ id: 'visit', label: 'Visits', color: CK_E_COLORS[0] }, { id: 'trial', label: 'Trials', color: CK_E_COLORS[1] }, { id: 'paid', label: 'Paid', color: CK_E_COLORS[3] }]} links={[{ source: 'visit', target: 'trial', value: 64 }, { source: 'trial', target: 'paid', value: 37 }]} legend animate={false} /></Box>
            <Box data-chart-fixture="network" style={CK_E_CHART_CELL_STYLE}><NetworkGraph width="100%" height={260} title="Network" nodes={[{ id: 'core', label: 'Core', group: 'platform', color: CK_E_COLORS[0] }, { id: 'apps', label: 'Apps', group: 'product', color: CK_E_COLORS[1] }, { id: 'data', label: 'Data', group: 'platform', color: CK_E_COLORS[2] }]} links={[{ source: 'core', target: 'apps', value: 2 }, { source: 'core', target: 'data', value: 1 }]} legend animate={false} /></Box>
            <Box data-chart-fixture="sparkline-brush" style={CK_E_CHART_CELL_STYLE}>
              <Text size="sm" weight="semibold">Inline signals and brush</Text>
              <Sparkline data={[8, 12, 9, 18, 16, 24, 22]} width="100%" height={70} fill showMinMax animate={false} />
              <CkEBrushFixture />
            </Box>
            <Box data-chart-fixture="loading" style={CK_E_CHART_CELL_STYLE}>
              <BarChart width="100%" height={150} loading title="Loading chart" data={[]} animate={false} />
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
