import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { charts, chartFamilies, type ChartFamily } from '@/data/registry';
import { ChartDemo } from './chart-demo';

// ---------------------------------------------------------------------------
// SSG
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return charts.map((c) => ({ type: c.slug }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function familyLabel(slug: ChartFamily): string {
  const entry = chartFamilies.find((f) => f.slug === slug);
  return entry?.label ?? slug;
}

// ---------------------------------------------------------------------------
// Usage snippets per chart type
// ---------------------------------------------------------------------------

const USAGE_SNIPPETS: Record<string, string> = {
  'bar-chart': `<BarChart
  data={[
    { label: 'Engineering', value: 45 },
    { label: 'Sales', value: 32 },
    { label: 'Marketing', value: 28 },
  ]}
  height={300}
  animate
  title="Team Headcount"
/>`,
  'line-chart': `<LineChart
  series={[{
    name: 'Users',
    data: [
      { x: 'Jan', y: 120 },
      { x: 'Feb', y: 180 },
      { x: 'Mar', y: 250 },
    ],
  }]}
  height={300}
  curved
  showDots
  animate
/>`,
  'pie-chart': `<PieChart
  data={[
    { label: 'Desktop', value: 55 },
    { label: 'Mobile', value: 30 },
    { label: 'Tablet', value: 15 },
  ]}
  height={300}
  donut
  showPercentage
  animate
/>`,
  'area-chart': `<AreaChart
  series={[{
    name: 'Revenue',
    data: [
      { x: 'Q1', y: 45000 },
      { x: 'Q2', y: 52000 },
      { x: 'Q3', y: 61000 },
    ],
  }]}
  height={300}
  animate
/>`,
  'radar-chart': `<RadarChart
  data={[
    { axis: 'Speed', value: 80 },
    { axis: 'Quality', value: 90 },
    { axis: 'Cost', value: 60 },
  ]}
  maxValue={100}
  height={300}
  animate
/>`,
  'funnel-chart': `<FunnelChart
  data={[
    { label: 'Visitors', value: 5000 },
    { label: 'Leads', value: 2500 },
    { label: 'Closed', value: 250 },
  ]}
  showPercentage
  showConversion
  height={300}
  animate
/>`,
  'treemap': `<TreeMap
  data={[
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 32 },
    { name: 'Design', value: 19 },
  ]}
  showLabels
  height={300}
  animate
/>`,
  'heatmap': `<HeatMap
  data={[
    { x: 'Mon', y: '9am', value: 12 },
    { x: 'Tue', y: '9am', value: 20 },
    { x: 'Wed', y: '9am', value: 5 },
  ]}
  cellRadius={4}
  height={300}
  animate
/>`,
  'gantt-chart': `<GanttChart
  tasks={[
    { id: '1', name: 'Design', start: '2026-01-01', end: '2026-02-15', progress: 80 },
    { id: '2', name: 'Build', start: '2026-02-01', end: '2026-04-01', progress: 30 },
  ]}
  showProgress
  showToday
  height={300}
  animate
/>`,
  'network-graph': `<NetworkGraph
  nodes={[
    { id: 'auth', label: 'Auth', group: 'core' },
    { id: 'users', label: 'Users', group: 'core' },
    { id: 'billing', label: 'Billing', group: 'payments' },
  ]}
  links={[
    { source: 'auth', target: 'users' },
    { source: 'users', target: 'billing', value: 2 },
  ]}
  directed
  height={350}
  animate
/>`,
  'gauge': `<GaugeChart
  value={73}
  label="Score"
  segments={[
    { from: 0, to: 33, color: 'var(--ds-color-error)', label: 'Poor' },
    { from: 33, to: 66, color: 'var(--ds-color-warning)', label: 'Fair' },
    { from: 66, to: 100, color: 'var(--ds-color-success)', label: 'Good' },
  ]}
  height={250}
  animate
/>`,
  'sparkline': `<Sparkline
  data={[12, 18, 15, 22, 28, 25, 30, 35, 32, 38]}
  height={32}
  width={200}
  showEndDot
  fill
/>`,
  'waterfall': `<WaterfallChart
  data={[
    { label: 'Revenue', value: 420 },
    { label: 'COGS', value: -200 },
    { label: 'Net Profit', value: 140, type: 'total' },
  ]}
  showValues
  showConnectors
  height={300}
  animate
/>`,
  'scatter': `<ScatterChart
  data={[
    { x: 10, y: 20, label: 'A', size: 40 },
    { x: 25, y: 35, label: 'B', size: 80 },
    { x: 40, y: 15, label: 'C', size: 120 },
  ]}
  xLabel="Revenue ($K)"
  yLabel="Growth (%)"
  bubble
  trendLine
  height={300}
  animate
/>`,
  'calendar-heatmap': `<CalendarHeatMap
  data={[
    { date: '2025-06-01', value: 3 },
    { date: '2025-06-15', value: 12 },
    { date: '2025-07-04', value: 8 },
  ]}
  startDate="2025-06-01"
  endDate="2025-09-30"
  height={180}
  animate
/>`,
  'bullet': `<BulletChart
  data={[
    { label: 'Revenue', value: 275, target: 300, ranges: [150, 225, 300] },
    { label: 'Profit', value: 22, target: 25, ranges: [10, 18, 30] },
  ]}
  showLabels
  height={180}
  animate
/>`,
  'histogram': `<Histogram
  values={[12, 15, 22, 28, 31, 35, 42, 55, 60]}
  bins={8}
  xLabel="Response Time (ms)"
  showLabels
  cumulativeLine
  height={300}
  animate
/>`,
  'sankey': `<SankeyChart
  nodes={[
    { id: 'applied', label: 'Applied' },
    { id: 'screening', label: 'Screening' },
    { id: 'hired', label: 'Hired' },
  ]}
  links={[
    { source: 'applied', target: 'screening', value: 500 },
    { source: 'screening', target: 'hired', value: 300 },
  ]}
  height={350}
  animate
/>`,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ChartDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const chart = charts.find((c) => c.slug === type);

  if (!chart) {
    return (
      <Stack spacing="md">
        <Text as={"h1" as any} size="2xl" weight="bold">
          Chart Not Found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          No chart matches &quot;{type}&quot;.
        </Text>
        <Link
          href="/patterns/visualization/charts"
          style={{ color: 'var(--ds-color-primary)', textDecoration: 'none' }}
        >
          ← Back to Charts
        </Link>
      </Stack>
    );
  }

  const importPath = `import { ${chart.name} } from '@rottay/design-system';`;
  const usageSnippet = USAGE_SNIPPETS[chart.slug];

  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/patterns/visualization/charts"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Charts
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {chart.name}
          </Text>
          <Badge variant="primary">{familyLabel(chart.family)}</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {chart.description}
          </Text>
        </Box>
      </Box>

      {/* Variants */}
      {chart.variants && chart.variants.length > 0 && (
        <Card>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Variants
            </Text>
            <Flex gap={8}>
              {chart.variants.map((v) => (
                <Badge key={v} variant="default">
                  {v}
                </Badge>
              ))}
            </Flex>
          </Stack>
        </Card>
      )}

      {/* Live demo */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Live Demo
          </Text>
          <ChartDemo slug={chart.slug} />
        </Stack>
      </Card>

      {/* Import snippet */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Import
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.8125rem',
              padding: 16,
              borderRadius: 8,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {importPath}
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Usage snippet */}
      {usageSnippet && (
        <Card>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Usage
            </Text>
            <Box
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.8125rem',
                padding: 16,
                borderRadius: 8,
                background: 'var(--ds-color-neutral-900)',
                color: 'var(--ds-color-neutral-100)',
                overflowX: 'auto',
                whiteSpace: 'pre',
                lineHeight: 1.6,
              }}
            >
              {usageSnippet}
            </Box>
          </Stack>
        </Card>
      )}

      {/* Hooks */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Related Hooks
          </Text>
          <Flex gap={4} style={{ flexWrap: 'wrap' }}>
            {[
              'useChartTheme',
              'useChartPersonality',
              'useChartDimensions',
              'useChartCompact',
            ].map((hook) => (
              <Box
                key={hook}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: 'var(--ds-color-neutral-100)',
                  fontSize: '0.75rem',
                  color: 'var(--ds-color-text-secondary)',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                {hook}
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
