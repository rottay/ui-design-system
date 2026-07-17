'use client';

import type { ReactNode } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  RadarChart,
  FunnelChart,
  TreeMap,
  HeatMap,
  GanttChart,
  NetworkGraph,
  GaugeChart,
  Sparkline,
  WaterfallChart,
  ScatterChart,
  CalendarHeatMap,
  BulletChart,
  Histogram,
  SankeyChart,
} from '@rottay/design-system';
import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';
import { charts } from '@/data/registry';
import { useShowroomRuntime } from '@/components/showroom-context';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';

const PREVIEW_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

// ---------------------------------------------------------------------------
// Sample data for each chart type
// ---------------------------------------------------------------------------

const CHART_DEMOS: Record<string, ReactNode> = {
  'bar-chart': (
    <BarChart
      data={[
        { label: 'Engineering', value: 45 },
        { label: 'Sales', value: 32 },
        { label: 'Marketing', value: 28 },
        { label: 'Design', value: 19 },
        { label: 'Support', value: 15 },
      ]}
      height={300}
      animate
      title="Team Headcount"
    />
  ),

  'line-chart': (
    <LineChart
      series={[
        {
          name: 'Users',
          data: [
            { x: 'Jan', y: 120 },
            { x: 'Feb', y: 180 },
            { x: 'Mar', y: 250 },
            { x: 'Apr', y: 310 },
            { x: 'May', y: 420 },
            { x: 'Jun', y: 380 },
          ],
        },
      ]}
      height={300}
      curved
      showDots
      animate
      title="Monthly Active Users"
    />
  ),

  'pie-chart': (
    <PieChart
      data={[
        { label: 'Desktop', value: 55 },
        { label: 'Mobile', value: 30 },
        { label: 'Tablet', value: 15 },
      ]}
      height={300}
      donut
      showPercentage
      animate
      title="Traffic by Device"
    />
  ),

  'area-chart': (
    <AreaChart
      series={[
        {
          name: 'Revenue',
          data: [
            { x: 'Q1', y: 45000 },
            { x: 'Q2', y: 52000 },
            { x: 'Q3', y: 61000 },
            { x: 'Q4', y: 73000 },
          ],
        },
      ]}
      height={300}
      animate
      title="Quarterly Revenue"
    />
  ),

  'radar-chart': (
    <RadarChart
      data={[
        { axis: 'Speed', value: 80 },
        { axis: 'Quality', value: 90 },
        { axis: 'Cost', value: 60 },
        { axis: 'Support', value: 75 },
        { axis: 'UX', value: 85 },
      ]}
      height={300}
      maxValue={100}
      animate
      title="Product Assessment"
    />
  ),

  'funnel-chart': (
    <FunnelChart
      data={[
        { label: 'Visitors', value: 5000 },
        { label: 'Leads', value: 2500 },
        { label: 'Qualified', value: 1200 },
        { label: 'Proposals', value: 600 },
        { label: 'Closed', value: 250 },
      ]}
      height={300}
      showPercentage
      showConversion
      animate
      title="Sales Funnel"
    />
  ),

  'treemap': (
    <TreeMap
      data={[
        { name: 'Engineering', value: 45 },
        { name: 'Sales', value: 32 },
        { name: 'Marketing', value: 28 },
        { name: 'Design', value: 19 },
      ]}
      height={300}
      showLabels
      animate
      title="Team Allocation"
    />
  ),

  'heatmap': (
    <HeatMap
      data={[
        { x: 'Mon', y: '9am', value: 12 },
        { x: 'Mon', y: '12pm', value: 8 },
        { x: 'Mon', y: '3pm', value: 18 },
        { x: 'Tue', y: '9am', value: 20 },
        { x: 'Tue', y: '12pm', value: 15 },
        { x: 'Tue', y: '3pm', value: 10 },
        { x: 'Wed', y: '9am', value: 5 },
        { x: 'Wed', y: '12pm', value: 22 },
        { x: 'Wed', y: '3pm', value: 14 },
        { x: 'Thu', y: '9am', value: 16 },
        { x: 'Thu', y: '12pm', value: 11 },
        { x: 'Thu', y: '3pm', value: 9 },
        { x: 'Fri', y: '9am', value: 7 },
        { x: 'Fri', y: '12pm', value: 19 },
        { x: 'Fri', y: '3pm', value: 3 },
      ]}
      height={300}
      cellRadius={4}
      animate
      title="Weekly Activity"
    />
  ),

  'gantt-chart': (
    <GanttChart
      tasks={[
        { id: '1', name: 'Research', start: '2026-01-01', end: '2026-01-31', progress: 100 },
        { id: '2', name: 'Design', start: '2026-01-15', end: '2026-02-28', progress: 80 },
        { id: '3', name: 'Development', start: '2026-02-01', end: '2026-04-30', progress: 45 },
        { id: '4', name: 'Testing', start: '2026-03-15', end: '2026-05-15', progress: 10 },
        { id: '5', name: 'Launch', start: '2026-05-01', end: '2026-05-31', progress: 0 },
      ]}
      showProgress
      showToday
      height={300}
      animate
      title="Project Timeline"
    />
  ),

  'network-graph': (
    <NetworkGraph
      nodes={[
        { id: 'auth', label: 'Auth', group: 'core' },
        { id: 'users', label: 'Users', group: 'core' },
        { id: 'billing', label: 'Billing', group: 'payments' },
        { id: 'tenancy', label: 'Tenancy', group: 'core' },
        { id: 'perms', label: 'Permissions', group: 'security' },
        { id: 'events', label: 'Events', group: 'domain' },
      ]}
      links={[
        { source: 'auth', target: 'users' },
        { source: 'users', target: 'billing', value: 2 },
        { source: 'users', target: 'tenancy' },
        { source: 'auth', target: 'perms', value: 3 },
        { source: 'tenancy', target: 'billing' },
        { source: 'events', target: 'users' },
      ]}
      directed
      height={350}
      animate
      title="Service Dependencies"
    />
  ),

  'gauge': (
    <GaugeChart
      value={73}
      title="System Health"
      label="Score"
      segments={[
        { from: 0, to: 33, color: 'var(--ds-color-error)', label: 'Poor' },
        { from: 33, to: 66, color: 'var(--ds-color-warning)', label: 'Fair' },
        { from: 66, to: 100, color: 'var(--ds-color-success)', label: 'Good' },
      ]}
      height={250}
      animate
    />
  ),

  'sparkline': (
    <Box style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', minWidth: 80 }}>Revenue</Text>
        <Sparkline data={[12, 18, 15, 22, 28, 25, 30, 35, 32, 38]} height={32} width={200} showEndDot fill />
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', minWidth: 80 }}>Users</Text>
        <Sparkline data={[5, 8, 12, 10, 15, 18, 14, 20, 25, 22]} height={32} width={200} curve="smooth" showEndDot fill />
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', minWidth: 80 }}>Errors</Text>
        <Sparkline data={[8, 6, 9, 4, 3, 5, 2, 3, 1, 2]} height={32} width={200} color="var(--ds-color-error)" showEndDot fill />
      </Box>
    </Box>
  ),

  'waterfall': (
    <WaterfallChart
      data={[
        { label: 'Revenue', value: 420 },
        { label: 'COGS', value: -200 },
        { label: 'Gross Profit', value: 220, type: 'total' },
        { label: 'Expenses', value: -80 },
        { label: 'Tax', value: -35 },
        { label: 'Net Profit', value: 105, type: 'total' },
      ]}
      showValues
      showConnectors
      height={300}
      animate
      title="Profit Waterfall"
    />
  ),

  'scatter': (
    <ScatterChart
      data={[
        { x: 10, y: 20, label: 'A', size: 40 },
        { x: 25, y: 35, label: 'B', size: 80 },
        { x: 40, y: 15, label: 'C', size: 120 },
        { x: 55, y: 45, label: 'D', size: 60 },
        { x: 70, y: 30, label: 'E', size: 100 },
        { x: 30, y: 50, label: 'F', size: 50 },
        { x: 60, y: 25, label: 'G', size: 90 },
      ]}
      xLabel="Revenue ($K)"
      yLabel="Growth (%)"
      bubble
      trendLine
      height={300}
      animate
      title="Revenue vs Growth"
    />
  ),

  'calendar-heatmap': (
    <CalendarHeatMap
      data={Array.from({ length: 120 }, (_, i) => {
        const date = new Date('2025-06-01');
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 15),
        };
      })}
      startDate="2025-06-01"
      endDate="2025-09-30"
      height={180}
      animate
      title="Contribution Activity"
    />
  ),

  'bullet': (
    <BulletChart
      data={[
        { label: 'Revenue', value: 275, target: 300, ranges: [150, 225, 300] },
        { label: 'Profit', value: 22, target: 25, ranges: [10, 18, 30] },
        { label: 'Orders', value: 140, target: 160, ranges: [80, 120, 200] },
      ]}
      showLabels
      height={180}
      animate
      title="Q2 KPI Dashboard"
    />
  ),

  'histogram': (
    <Histogram
      values={[12, 15, 22, 28, 28, 31, 35, 42, 42, 42, 55, 60, 18, 25, 33, 38, 45, 50, 27, 36, 41, 48, 52, 29, 34]}
      bins={8}
      xLabel="Response Time (ms)"
      showLabels
      cumulativeLine
      height={300}
      animate
      title="Response Time Distribution"
    />
  ),

  'sankey': (
    <SankeyChart
      nodes={[
        { id: 'applied', label: 'Applied' },
        { id: 'screening', label: 'Screening' },
        { id: 'interview', label: 'Interview' },
        { id: 'offer', label: 'Offer' },
        { id: 'hired', label: 'Hired' },
        { id: 'rejected', label: 'Rejected' },
      ]}
      links={[
        { source: 'applied', target: 'screening', value: 500 },
        { source: 'screening', target: 'interview', value: 300 },
        { source: 'screening', target: 'rejected', value: 200 },
        { source: 'interview', target: 'offer', value: 180 },
        { source: 'interview', target: 'rejected', value: 120 },
        { source: 'offer', target: 'hired', value: 150 },
        { source: 'offer', target: 'rejected', value: 30 },
      ]}
      height={350}
      animate
      title="Candidate Pipeline"
    />
  ),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartDemo({ slug }: { slug: string }) {
  const runtime = useShowroomRuntime();
  const chart = charts.find((item) => item.slug === slug);
  const demo = CHART_DEMOS[slug];

  if (!demo) {
    return (
      <Box
        style={{
          minHeight: 240,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          border: '1px dashed var(--ds-color-border, #d1d5db)',
          background: 'var(--ds-color-bg-container, #ffffff)',
        }}
      >
        <Box style={{ textAlign: 'center' }}>
          <Text size="sm" weight="semibold">
            Demo coming soon
          </Text>
          <Text
            size="xs"
            style={{
              marginTop: 8,
              color: 'var(--ds-color-text-secondary)',
            }}
          >
            No live chart demo is registered for <strong>{slug}</strong> yet.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      style={{
        position: 'relative',
        minHeight: 240,
        borderRadius: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          4,
        )} 100%)`,
        padding: 14,
        overflow: 'hidden',
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: PREVIEW_OVERLAY,
          pointerEvents: 'none',
        }}
      />
      <Stack spacing="sm" style={{ position: 'relative' }}>
        <Box
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              9,
            )} 0%, ${SHOWROOM_SURFACES.subtle} 100%)`,
            boxShadow: `inset 0 1px 0 ${mixWithSurface(
              'var(--ds-color-primary, #60a5fa)',
              10,
              'transparent',
            )}`,
          }}
        >
          <Flex align="center" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box>
              <Text size="xs" weight="semibold" style={{ display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Live runtime preview
              </Text>
              <Text size="sm" style={{ marginTop: 4, color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45, maxWidth: 640 }}>
                This chart is rendered by the active docs provider rather than a page-local mock frame.
              </Text>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">{runtime.tenantName}</Badge>
              <Badge variant="secondary">{runtime.engine}</Badge>
              <Badge variant="secondary">{runtime.productProfileLabel}</Badge>
              {chart ? <Badge variant="secondary">{chart.family} family</Badge> : null}
            </Flex>
          </Flex>
        </Box>
        <Box
          style={{
            minWidth: 0,
            padding: 12,
            borderRadius: 16,
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
              'var(--ds-color-primary, #60a5fa)',
              6,
              SHOWROOM_SURFACES.subtle,
            )} 100%)`,
            overflowX: 'auto',
          }}
        >
          {demo}
        </Box>
      </Stack>
    </Box>
  );
}
