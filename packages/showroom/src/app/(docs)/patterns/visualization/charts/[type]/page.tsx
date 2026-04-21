import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import {
  CodeBlock,
  PropTable,
  type PropDefinition,
} from '@/components/playground';
import {
  chartFamilies,
  charts,
  chartsByFamily,
  type ChartEntry,
  type ChartFamily,
} from '@/data/registry';
import { ChartDemoLazy } from './chart-demo-lazy';

const FAMILY_GUIDANCE: Record<
  ChartFamily,
  {
    chooseWhen: string[];
    inspect: string[];
    compareAgainst: string[];
    dataContract: string;
  }
> = {
  basic: {
    chooseWhen: [
      'comparing categories',
      'tracking trends',
      'showing proportions',
    ],
    inspect: ['axis clarity', 'label density', 'at-a-glance story'],
    compareAgainst: ['more advanced statistical charts', 'flow charts'],
    dataContract:
      'Clean categorical or time-series values with a clear primary measure.',
  },
  statistical: {
    chooseWhen: [
      'explaining distributions',
      'tracking thresholds',
      'showing multivariate shape',
    ],
    inspect: ['baseline meaning', 'range legibility', 'target context'],
    compareAgainst: ['basic charts', 'KPI charts'],
    dataContract:
      'Quantitative values with ranges, targets, or several dimensions worth comparing.',
  },
  flow: {
    chooseWhen: [
      'explaining stages',
      'showing deltas',
      'mapping transitions',
    ],
    inspect: ['step continuity', 'loss visibility', 'cumulative reasoning'],
    compareAgainst: ['basic charts', 'temporal charts'],
    dataContract:
      'Ordered transitions or stage weights where movement matters more than isolated points.',
  },
  temporal: {
    chooseWhen: [
      'showing schedules',
      'compressing long histories',
      'mapping activity over time',
    ],
    inspect: ['time pacing', 'range readability', 'cadence recognition'],
    compareAgainst: ['basic charts', 'flow charts'],
    dataContract:
      'Continuous or scheduled time data where sequence and cadence are essential.',
  },
  spatial: {
    chooseWhen: [
      'showing intensity by position',
      'scanning activity matrices',
    ],
    inspect: ['color scale clarity', 'density', 'hotspot discoverability'],
    compareAgainst: ['scatter plots', 'calendar heatmaps'],
    dataContract:
      'Matrix-like coordinates with a meaningful intensity measure.',
  },
  hierarchical: {
    chooseWhen: ['showing proportions within nested categories'],
    inspect: ['parent-child clarity', 'label fit', 'relative area reading'],
    compareAgainst: ['pie charts', 'bar charts'],
    dataContract:
      'Nested groups with values that roll up into visible totals.',
  },
  relational: {
    chooseWhen: ['showing dependencies', 'mapping entity relationships'],
    inspect: ['node legibility', 'edge meaning', 'cluster separation'],
    compareAgainst: ['flow charts', 'hierarchical charts'],
    dataContract:
      'Node and edge sets with enough meaning to justify a relationship view.',
  },
  kpi: {
    chooseWhen: [
      'showing target vs actual',
      'compressing executive snapshots',
    ],
    inspect: ['threshold contrast', 'target visibility', 'compact readability'],
    compareAgainst: ['gauges', 'bar charts'],
    dataContract:
      'A small number of measures with targets and performance bands.',
  },
};

const SPECIFIC_COMPARISONS: Record<string, string[]> = {
  'bar-chart': [
    'LineChart when time is continuous',
    'BulletChart for target-based compact reads',
  ],
  'line-chart': [
    'AreaChart for magnitude emphasis',
    'Sparkline for micro-trends',
  ],
  'pie-chart': [
    'BarChart when precise comparison matters',
    'TreeMap for many categories',
  ],
  'radar-chart': [
    'BarChart when exact comparison matters',
    'ScatterChart for correlation',
  ],
  'funnel-chart': [
    'SankeyChart for branching flow',
    'WaterfallChart for contribution deltas',
  ],
  'gantt-chart': [
    'CalendarHeatMap for activity density',
    'LineChart for continuous progress',
  ],
  gauge: [
    'BulletChart for tighter dashboards',
    'BarChart for clearer exact comparison',
  ],
};

const SPECIFIC_PROPS: Record<string, PropDefinition[]> = {
  'bar-chart': [
    {
      name: 'data',
      type: '{ label: string; value: number }[]',
      required: true,
      description: 'Categorical values rendered into each bar.',
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      description: 'Canvas height used for chart layout and axis spacing.',
    },
    {
      name: 'variant',
      type: '"simple" | "grouped" | "stacked"',
      required: false,
      description: 'Layout strategy for single, grouped, or stacked bar series.',
    },
    {
      name: 'title',
      type: 'string',
      required: false,
      description: 'Optional heading displayed above the chart.',
    },
  ],
  'line-chart': [
    {
      name: 'series',
      type: 'ChartSeries[]',
      required: true,
      description: 'One or more ordered data series rendered across the x-axis.',
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      description: 'Canvas height for the line chart.',
    },
    {
      name: 'curved',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Uses smoothed line interpolation for softer trend motion.',
    },
    {
      name: 'showDots',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Renders visible points for each series value.',
    },
  ],
  'pie-chart': [
    {
      name: 'data',
      type: '{ label: string; value: number }[]',
      required: true,
      description: 'Slice labels and values for the part-to-whole chart.',
    },
    {
      name: 'donut',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Switches the chart from pie to donut presentation.',
    },
    {
      name: 'showPercentage',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Displays percentages alongside labels or inside slices.',
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      description: 'Canvas height for the chart and legend layout.',
    },
  ],
  gauge: [
    {
      name: 'value',
      type: 'number',
      required: true,
      description: 'Current metric value represented by the gauge.',
    },
    {
      name: 'segments',
      type: 'GaugeSegment[]',
      required: false,
      description: 'Threshold bands and labels that define the gauge ranges.',
    },
    {
      name: 'label',
      type: 'string',
      required: false,
      description: 'Primary metric label shown with the gauge.',
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      description: 'Canvas height for the gauge chart.',
    },
  ],
  'gantt-chart': [
    {
      name: 'tasks',
      type: 'GanttTask[]',
      required: true,
      description: 'Task records with dates, labels, and optional dependencies.',
    },
    {
      name: 'showToday',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Renders a marker for the current day in the schedule.',
    },
    {
      name: 'showProgress',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Displays completion state within each scheduled bar.',
    },
    {
      name: 'onSelectTask',
      type: '(task) => void',
      required: false,
      description: 'Runs when a task bar is selected.',
    },
  ],
  sankey: [
    {
      name: 'nodes',
      type: 'SankeyNode[]',
      required: true,
      description: 'Node definitions used as the source and target entities.',
    },
    {
      name: 'links',
      type: 'SankeyLink[]',
      required: true,
      description: 'Weighted connections rendered between nodes.',
    },
    {
      name: 'height',
      type: 'number',
      required: true,
      description: 'Canvas height for the chart.',
    },
    {
      name: 'nodePadding',
      type: 'number',
      required: false,
      description: 'Vertical space between nodes in the same column.',
    },
  ],
};

const HERO_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 28%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

function familyLabel(slug: ChartFamily): string {
  const entry = chartFamilies.find((family) => family.slug === slug);
  return entry?.label ?? slug;
}

function getAlternatives(chart: ChartEntry) {
  return (
    SPECIFIC_COMPARISONS[chart.slug] ??
    FAMILY_GUIDANCE[chart.family].compareAgainst
  );
}

function getPlaceholderProps(chart: ChartEntry): PropDefinition[] {
  const sharedProps: PropDefinition[] = [
    {
      name: 'className',
      type: 'string',
      required: false,
      description:
        'Additional class names for layout or product-specific extension points.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      required: false,
      description:
        'Inline overrides for one-off sizing or diagnostic rendering changes.',
    },
  ];

  const specific = SPECIFIC_PROPS[chart.slug];
  if (specific) {
    return [...specific, ...sharedProps];
  }

  const familyProps: Record<ChartFamily, PropDefinition[]> = {
    basic: [
      {
        name: 'data',
        type: 'ChartDatum[]',
        required: true,
        description: 'Primary data set rendered by the chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height used for chart sizing.',
      },
      {
        name: 'xLabel',
        type: 'string',
        required: false,
        description: 'Optional label for the horizontal axis.',
      },
      {
        name: 'yLabel',
        type: 'string',
        required: false,
        description: 'Optional label for the vertical axis.',
      },
    ],
    statistical: [
      {
        name: 'data',
        type: 'number[] | StatisticalDatum[]',
        required: true,
        description: 'Distribution or multi-axis values used by the chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the statistical chart.',
      },
      {
        name: 'thresholds',
        type: 'number[]',
        required: false,
        description: 'Target values or threshold bands used to interpret the chart.',
      },
      {
        name: 'animate',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Enables animated transitions when data changes.',
      },
    ],
    flow: [
      {
        name: 'data',
        type: 'FlowDatum[]',
        required: true,
        description: 'Stage values or link weights for the flow visualization.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the chart.',
      },
      {
        name: 'showLabels',
        type: 'boolean',
        defaultValue: 'true',
        required: false,
        description: 'Controls visibility of labels alongside the flow.',
      },
      {
        name: 'animate',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Animates updates between flow states.',
      },
    ],
    temporal: [
      {
        name: 'data',
        type: 'TemporalDatum[]',
        required: true,
        description: 'Time-based values or tasks rendered by the chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the temporal chart.',
      },
      {
        name: 'startDate',
        type: 'string | Date',
        required: false,
        description: 'Optional lower bound for the visible time range.',
      },
      {
        name: 'endDate',
        type: 'string | Date',
        required: false,
        description: 'Optional upper bound for the visible time range.',
      },
    ],
    spatial: [
      {
        name: 'data',
        type: 'SpatialDatum[]',
        required: true,
        description: 'Matrix or coordinate values rendered into the chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the heatmap or spatial view.',
      },
      {
        name: 'colorScale',
        type: 'string[]',
        required: false,
        description: 'Optional token-aware color scale for the intensity ramp.',
      },
      {
        name: 'cellRadius',
        type: 'number',
        required: false,
        description: 'Rounding applied to each rendered heatmap cell.',
      },
    ],
    hierarchical: [
      {
        name: 'data',
        type: 'HierarchyDatum[]',
        required: true,
        description: 'Nested input structure rendered into the hierarchy chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the chart.',
      },
      {
        name: 'valueKey',
        type: 'string',
        required: false,
        description: 'Field used to calculate area or weight within the hierarchy.',
      },
      {
        name: 'showLabels',
        type: 'boolean',
        defaultValue: 'true',
        required: false,
        description: 'Displays labels within chart segments when space allows.',
      },
    ],
    relational: [
      {
        name: 'nodes',
        type: 'GraphNode[]',
        required: true,
        description: 'Node entities rendered by the relationship graph.',
      },
      {
        name: 'links',
        type: 'GraphLink[]',
        required: true,
        description: 'Edges connecting nodes in the graph.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the graph.',
      },
      {
        name: 'directed',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Adds directional indicators to graph edges.',
      },
    ],
    kpi: [
      {
        name: 'data',
        type: 'KpiDatum[]',
        required: true,
        description: 'Metric values and targets rendered by the chart.',
      },
      {
        name: 'height',
        type: 'number',
        required: true,
        description: 'Canvas height for the compact KPI chart.',
      },
      {
        name: 'target',
        type: 'number',
        required: false,
        description: 'Single target value highlighted by the chart.',
      },
      {
        name: 'ranges',
        type: 'number[]',
        required: false,
        description: 'Threshold bands used to interpret performance.',
      },
    ],
  };

  return [...familyProps[chart.family], ...sharedProps];
}

function MetaCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          4,
          SHOWROOM_SURFACES.surface,
        )} 0%, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          7,
          SHOWROOM_SURFACES.subtle,
        )} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 136,
        boxShadow: `inset 0 1px 0 ${mixWithSurface('var(--ds-color-primary, #60a5fa)', 10, 'transparent')}`,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          color: SHOWROOM_SURFACES.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Text
        size="sm"
        weight="semibold"
        style={{
          display: 'block',
          lineHeight: 1.15,
          overflowWrap: 'anywhere',
          color: SHOWROOM_SURFACES.text,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          color: SHOWROOM_SURFACES.textSecondary,
          lineHeight: 1.45,
          overflowWrap: 'anywhere',
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function GuidanceCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card
      style={{
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          4,
        )} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
        minHeight: 184,
      }}
    >
      <Stack spacing="sm">
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Text
            as={"h2" as any}
            size="md"
            weight="semibold"
            style={{ display: 'block', color: SHOWROOM_SURFACES.text, lineHeight: 1.3 }}
          >
            {title}
          </Text>
          <Badge variant="secondary">{items.length} items</Badge>
        </Flex>
        <Box
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${SHOWROOM_SURFACES.border}, transparent)`,
          }}
        />
        {items.map((item) => (
          <Box
            key={item}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: 'linear-gradient(180deg, var(--ds-color-bg-container) 0%, var(--ds-color-bg-secondary) 100%)',
            }}
          >
            <Text
              size="sm"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.textSecondary,
                lineHeight: 1.5,
                overflowWrap: 'anywhere',
              }}
            >
              {item}
            </Text>
          </Box>
        ))}
      </Stack>
    </Card>
  );
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
  treemap: `<TreeMap
  data={[
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 32 },
    { name: 'Design', value: 19 },
  ]}
  showLabels
  height={300}
  animate
/>`,
  heatmap: `<HeatMap
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
  gauge: `<GaugeChart
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
  sparkline: `<Sparkline
  data={[12, 18, 15, 22, 28, 25, 30, 35, 32, 38]}
  height={32}
  width={200}
  showEndDot
  fill
/>`,
  waterfall: `<WaterfallChart
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
  scatter: `<ScatterChart
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
  bullet: `<BulletChart
  data={[
    { label: 'Revenue', value: 275, target: 300, ranges: [150, 225, 300] },
    { label: 'Profit', value: 22, target: 25, ranges: [10, 18, 30] },
  ]}
  showLabels
  height={180}
  animate
/>`,
  histogram: `<Histogram
  values={[12, 15, 22, 28, 31, 35, 42, 55, 60]}
  bins={8}
  xLabel="Response Time (ms)"
  showLabels
  cumulativeLine
  height={300}
  animate
/>`,
  sankey: `<SankeyChart
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

export function generateStaticParams() {
  return charts.map((chart) => ({ type: chart.slug }));
}

export default async function ChartDetailPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const chart = charts.find((chartEntry) => chartEntry.slug === type);

  if (!chart) {
    return (
      <Card
        style={{
          padding: 28,
          border: '1px dashed var(--ds-color-border, #d1d5db)',
          background: 'var(--ds-color-bg-container, #ffffff)',
        }}
      >
        <Stack spacing="md">
          <Text as={"h1" as any} size="2xl" weight="bold">
            Chart not found
          </Text>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            No chart matches &quot;{type}&quot;.
          </Text>
          <Link
            href="/patterns/visualization/charts"
            style={{
              color: 'var(--ds-color-primary)',
              textDecoration: 'none',
            }}
          >
            Back to charts
          </Link>
        </Stack>
      </Card>
    );
  }

  const familyGuidance = FAMILY_GUIDANCE[chart.family];
  const usageSnippet = USAGE_SNIPPETS[chart.slug];
  const importPath = `import { ${chart.name} } from '@rottay/design-system';`;
  const alternatives = getAlternatives(chart);
  const placeholderProps = getPlaceholderProps(chart);
  const siblingCharts = (chartsByFamily[chart.family] ?? [])
    .filter((chartEntry) => chartEntry.slug !== chart.slug)
    .slice(0, 4);

  return (
    <Stack spacing="xl" fullWidth>
      <Card
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
        }}
      >
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: HERO_OVERLAY,
            pointerEvents: 'none',
          }}
        />
        <Stack spacing="lg">
          <Box style={{ position: 'relative' }}>
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Link href="/patterns" style={{ textDecoration: 'none' }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Patterns
                  </Text>
                </Link>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  /
                </Text>
                <Link href="/patterns/visualization/charts" style={{ textDecoration: 'none' }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Charts
                  </Text>
                </Link>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  /
                </Text>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: SHOWROOM_SURFACES.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {chart.name}
                </Text>
              </Flex>

              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="secondary">{familyLabel(chart.family)}</Badge>
                {chart.variants?.length ? (
                  <Badge variant="secondary">{chart.variants.length} variants</Badge>
                ) : null}
                <Badge variant="secondary">Runtime-driven docs</Badge>
              </Flex>
            </Flex>
          </Box>

          <Box
            className="chart-detail-header-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 18,
              alignItems: 'start',
              alignContent: 'start',
            }}
          >
            <Stack spacing="md" style={{ position: 'relative' }}>
              <Box>
                <Text as={"h1" as any} size="2xl" weight="bold" style={{ lineHeight: 1.08, maxWidth: 760 }}>
                  {chart.name}
                </Text>
                <Text
                  size="md"
                  style={{
                    marginTop: 8,
                    color: SHOWROOM_SURFACES.textSecondary,
                    lineHeight: 1.65,
                    maxWidth: 800,
                  }}
                >
                  {chart.description}
                </Text>
              </Box>

              <Text size="sm" style={{ color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.55, maxWidth: 780 }}>
                {familyGuidance.dataContract}
              </Text>

              <Box
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
                    'var(--ds-color-primary, #60a5fa)',
                    5,
                  )} 100%)`,
                }}
              >
                <Stack spacing="sm">
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    How to read this page
                  </Text>
                  <Box
                    style={{
                      height: 1,
                      background: `linear-gradient(90deg, ${SHOWROOM_SURFACES.border}, transparent)`,
                    }}
                  />
                  <Text
                    size="sm"
                    style={{
                      display: 'block',
                      color: SHOWROOM_SURFACES.textSecondary,
                      lineHeight: 1.55,
                    }}
                  >
                    Use the sidebar showroom controls to change engine and tenant,
                    then judge whether the chart still reads clearly without extra
                    editorial staging around it.
                  </Text>
                </Stack>
              </Box>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 12,
                alignContent: 'start',
              }}
            >
              <MetaCard
                label="Tier"
                value="Chart"
                detail="A specialized visualization pattern."
              />
              <MetaCard
                label="Family"
                value={familyLabel(chart.family)}
                detail={`Start with ${familyGuidance.inspect[0]}.`}
              />
              <MetaCard
                label="Best for"
                value={familyGuidance.chooseWhen[0]}
                detail={`Compare against ${alternatives[0]}.`}
              />
            </Box>
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <GuidanceCard title="Choose this when" items={familyGuidance.chooseWhen} />
            <GuidanceCard title="Review checklist" items={familyGuidance.inspect} />
            <GuidanceCard title="Compare against" items={alternatives} />
          </Box>
        </Stack>
      </Card>

      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ maxWidth: 760 }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Live preview
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block', lineHeight: 1.3 }}>
                Validate the chart in the active showroom runtime
              </Text>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">Sidebar engine and tenant drive this</Badge>
              <Badge variant="secondary">{familyLabel(chart.family)}</Badge>
            </Flex>
          </Flex>
          <Text size="sm" style={{ color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.55, maxWidth: 820 }}>
            This preview should stand on the chart itself: legibility, token use,
            spacing, and interaction rhythm all need to hold without extra local
            storytelling chrome.
          </Text>
          <ChartDemoLazy slug={chart.slug} />
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <CodeBlock code={importPath} language="tsx" title="Import" />
        {usageSnippet ? (
          <CodeBlock code={usageSnippet} language="tsx" title="Usage" />
        ) : null}
      </Box>

      <Card
        style={{
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
          background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHOWROOM_SURFACES.shadow,
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ maxWidth: 760 }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                API surface
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block', lineHeight: 1.3 }}>
                Props
              </Text>
            </Box>
            <Badge variant="secondary">{placeholderProps.length} rows</Badge>
          </Flex>
          <PropTable title={`${chart.name} props`} props={placeholderProps} />
        </Stack>
      </Card>

      {siblingCharts.length ? (
        <Card
          style={{
            border: `1px solid ${SHOWROOM_SURFACES.border}`,
            background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              4,
            )} 100%)`,
            boxShadow: SHOWROOM_SURFACES.shadow,
          }}
        >
          <Stack spacing="md">
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Box style={{ maxWidth: 760 }}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Related charts
                </Text>
                <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block', lineHeight: 1.3 }}>
                  Continue within {familyLabel(chart.family)}
                </Text>
              </Box>
              <Link href="/patterns/visualization/charts" style={{ textDecoration: 'none' }}>
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-primary)' }}>
                  Browse all
                </Text>
              </Link>
            </Flex>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {siblingCharts.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/patterns/visualization/charts/${sibling.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    style={{
                      height: '100%',
                      padding: 16,
                      borderRadius: 18,
                      border: `1px solid ${SHOWROOM_SURFACES.border}`,
                      background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
                        'var(--ds-color-primary, #60a5fa)',
                        5,
                      )} 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      minHeight: 126,
                      boxShadow: `inset 0 1px 0 ${mixWithSurface(
                        'var(--ds-color-primary, #60a5fa)',
                        10,
                        'transparent',
                      )}`,
                    }}
                  >
                    <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                      <Text size="sm" weight="semibold" style={{ display: 'block', lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                        {sibling.name}
                      </Text>
                      <Badge variant="secondary">
                        {familyLabel(sibling.family)}
                      </Badge>
                    </Flex>
                    <Text size="xs" style={{ marginTop: 8, display: 'block', color: SHOWROOM_SURFACES.textSecondary, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                      {sibling.description}
                    </Text>
                  </Box>
                </Link>
              ))}
            </Box>
          </Stack>
        </Card>
      ) : null}

      <style>{`
        @media (max-width: 980px) {
          .chart-detail-header-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Stack>
  );
}
