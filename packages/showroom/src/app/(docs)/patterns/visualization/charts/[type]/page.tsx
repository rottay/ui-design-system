import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/composition/components/playground/surface-tokens';
import {
  CodeBlock,
  PropTable,
  type PropDefinition,
} from '@/composition/components/playground';
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

function chartProp(
  name: string,
  type: string,
  description: string,
  options: { required?: boolean; defaultValue?: string } = {},
): PropDefinition {
  return {
    name,
    type,
    required: options.required ?? false,
    description,
    ...(options.defaultValue === undefined
      ? {}
      : { defaultValue: options.defaultValue }),
  };
}

const CHART_BASE_PROPS: PropDefinition[] = [
  chartProp('width', 'number | string', 'Chart container width; falls back to the family default.'),
  chartProp('height', 'number', 'Chart height; falls back to the family default.'),
  chartProp('className', 'string', 'Additional class name applied to the chart wrapper.'),
  chartProp('style', 'CSSProperties', 'Inline styles applied to the chart wrapper.'),
  chartProp('loading', 'boolean', 'Displays the governed loading state.', { defaultValue: 'false' }),
  chartProp('title', 'string', 'Accessible chart title displayed above the plot.'),
  chartProp('subtitle', 'string', 'Supporting text displayed below the title.'),
  chartProp('animate', 'boolean', 'Overrides the active tenant animation personality.'),
  chartProp('responsive', 'boolean', 'Measures and follows the container width.', { defaultValue: 'true' }),
  chartProp('tooltip', 'boolean', 'Enables the family tooltip behavior.'),
];

const SPARKLINE_SURFACE_PROPS = CHART_BASE_PROPS.filter(({ name }) =>
  ['width', 'height', 'className', 'style'].includes(name),
);

type ChartCapability =
  | 'legend'
  | 'colors'
  | 'colorScheme'
  | 'margin'
  | 'compactCore'
  | 'compactCartesian'
  | 'compactSeriesLabels';

const CHART_CAPABILITIES: Record<string, ChartCapability[]> = {
  'bar-chart': ['legend', 'colors', 'colorScheme', 'margin', 'compactCartesian'],
  'line-chart': ['legend', 'colors', 'colorScheme', 'margin', 'compactCartesian'],
  'area-chart': ['legend', 'colors', 'colorScheme', 'margin', 'compactCartesian'],
  'pie-chart': ['legend', 'colors', 'colorScheme', 'compactSeriesLabels'],
  scatter: ['legend', 'colors', 'margin', 'compactCartesian'],
  'radar-chart': ['legend', 'colors', 'colorScheme'],
  gauge: ['legend', 'compactCore'],
  histogram: ['legend', 'margin', 'compactCartesian'],
  'funnel-chart': ['legend', 'colors', 'margin'],
  waterfall: ['legend', 'margin', 'compactCartesian'],
  sankey: ['legend', 'colors', 'margin'],
  'gantt-chart': ['colors', 'margin'],
  sparkline: [],
  'calendar-heatmap': ['colorScheme'],
  heatmap: ['margin'],
  treemap: ['legend', 'colors', 'colorScheme'],
  'network-graph': ['legend', 'colors'],
  bullet: ['legend', 'compactCore'],
};

function getCapabilityProps(chart: ChartEntry): PropDefinition[] {
  const capabilities = CHART_CAPABILITIES[chart.slug] ?? [];
  const props: PropDefinition[] = [];

  if (capabilities.includes('legend')) {
    props.push(chartProp('legend', 'boolean', 'Displays the family legend.'));
  }
  if (capabilities.includes('colors')) {
    props.push(chartProp('colors', 'string[]', 'Explicit palette; otherwise inherits the active tenant chart personality.'));
  }
  if (capabilities.includes('colorScheme')) {
    props.push(chartProp('colorScheme', 'ChartColorScheme', 'Named palette overriding the active tenant chart personality.'));
  }
  if (capabilities.includes('margin')) {
    props.push(chartProp('margin', 'ChartMargin', 'Insets around the SVG drawing area.'));
  }

  const compactCapability = capabilities.find((capability) => capability.startsWith('compact'));
  if (compactCapability) {
    const compactType = compactCapability === 'compactCartesian'
      ? 'ChartCartesianCompactConfig'
      : compactCapability === 'compactSeriesLabels'
        ? 'ChartSeriesLabelCompactConfig'
        : 'ChartCompactCoreConfig';
    props.push(
      chartProp('compact', compactType, 'Configures compact rendering but does not activate it.'),
      chartProp('compactMode', 'boolean', 'Activates compact rendering explicitly.', { defaultValue: 'false' }),
      chartProp('autoCompact', 'boolean', 'Activates compact rendering below compactBreakpoint.', { defaultValue: 'false' }),
      chartProp('compactBreakpoint', 'number', 'Container-width threshold for autoCompact.', { defaultValue: '640' }),
    );
  }

  return props;
}

const SPECIFIC_PROPS: Record<string, PropDefinition[]> = {
  'bar-chart': [
    chartProp('data', 'DataPoint[]', 'Single-series categorical values; ignored when series is provided.'),
    chartProp('series', 'Series[]', 'Grouped or stacked multi-series values; takes precedence over data.'),
    chartProp('orientation', '"vertical" | "horizontal"', 'Bar direction.', { defaultValue: '"vertical"' }),
    chartProp('stacked', 'boolean', 'Stacks multi-series bars instead of grouping them.', { defaultValue: 'false' }),
    chartProp('barRadius', 'number', 'Corner radius for each bar.', { defaultValue: '4' }),
    chartProp('barGap', 'number', 'Relative gap between bars.', { defaultValue: '0.2' }),
    chartProp('showValues', 'boolean', 'Displays values on the bars.', { defaultValue: 'false' }),
    chartProp('xAxisLabel', 'string', 'Horizontal-axis label.'),
    chartProp('yAxisLabel', 'string', 'Vertical-axis label.'),
  ],
  'line-chart': [
    chartProp('series', 'Series[]', 'Ordered series rendered across the x-axis.', { required: true }),
    chartProp('curved', 'boolean', 'Overrides the active chart personality line mode.'),
    chartProp('showDots', 'boolean', 'Overrides the active chart personality point treatment.'),
    chartProp('showArea', 'boolean', 'Fills the area below each line.', { defaultValue: 'false' }),
    chartProp('xAxisLabel', 'string', 'Horizontal-axis label.'),
    chartProp('yAxisLabel', 'string', 'Vertical-axis label.'),
    chartProp('xType', '"category" | "time" | "linear"', 'Scale used by the x-axis.', { defaultValue: '"category"' }),
  ],
  'area-chart': [
    chartProp('series', 'Series[]', 'Ordered series rendered as filled areas.', { required: true }),
    chartProp('curved', 'boolean', 'Overrides the active chart personality line mode.'),
    chartProp('stacked', 'boolean', 'Stacks areas cumulatively.', { defaultValue: 'false' }),
    chartProp('opacity', 'number', 'Area-fill opacity.', { defaultValue: '0.3' }),
    chartProp('xAxisLabel', 'string', 'Horizontal-axis label.'),
    chartProp('yAxisLabel', 'string', 'Vertical-axis label.'),
  ],
  'pie-chart': [
    chartProp('data', 'DataPoint[]', 'Slice labels and values.', { required: true }),
    chartProp('donut', 'boolean', 'Switches from pie to donut presentation.', { defaultValue: 'false' }),
    chartProp('innerRadius', 'number', 'Inner-radius ratio used in donut mode.', { defaultValue: '0.6' }),
    chartProp('showLabels', 'boolean', 'Displays slice labels.', { defaultValue: 'true' }),
    chartProp('showPercentage', 'boolean', 'Displays slice percentages.', { defaultValue: 'false' }),
  ],
  scatter: [
    chartProp('data', 'ScatterDataPoint[]', 'Numeric x/y points, with optional size metadata.', { required: true }),
    chartProp('xLabel', 'string', 'Horizontal-axis label.'),
    chartProp('yLabel', 'string', 'Vertical-axis label.'),
    chartProp('pointRadius', 'number', 'Default point radius.', { defaultValue: '5' }),
    chartProp('bubble', 'boolean', 'Maps data.size to point radius.', { defaultValue: 'false' }),
    chartProp('sizeRange', '[number, number]', 'Minimum and maximum bubble radius.', { defaultValue: '[4, 30]' }),
    chartProp('grid', 'boolean', 'Displays grid lines.', { defaultValue: 'true' }),
    chartProp('opacity', 'number', 'Point fill opacity.', { defaultValue: '0.7' }),
    chartProp('trendLine', 'boolean', 'Displays a least-squares trend line.', { defaultValue: 'false' }),
  ],
  'radar-chart': [
    chartProp('data', 'RadarDataPoint[]', 'Primary axis/value polygon.', { required: true }),
    chartProp('series', 'RadarSeries[]', 'Optional named polygons for multi-series comparison.'),
    chartProp('maxValue', 'number', 'Explicit radial-domain maximum; inferred when omitted.'),
    chartProp('levels', 'number', 'Number of concentric grid levels.', { defaultValue: '5' }),
    chartProp('showLabels', 'boolean', 'Displays axis labels.', { defaultValue: 'true' }),
  ],
  gauge: [
    chartProp('value', 'number', 'Current metric value.', { required: true }),
    chartProp('min', 'number', 'Lower domain bound.', { defaultValue: '0' }),
    chartProp('max', 'number', 'Upper domain bound.', { defaultValue: '100' }),
    chartProp('segments', 'GaugeSegment[]', 'Threshold bands and their colors.'),
    chartProp('showValue', 'boolean', 'Displays the current value.', { defaultValue: 'true' }),
    chartProp('formatValue', '(value: number) => string', 'Formats the displayed value.'),
    chartProp('label', 'string', 'Metric label displayed below the value.'),
    chartProp('startAngle', 'number', 'Arc start angle in degrees.', { defaultValue: '-120' }),
    chartProp('endAngle', 'number', 'Arc end angle in degrees.', { defaultValue: '120' }),
    chartProp('innerRadius', 'number', 'Inner-radius ratio.', { defaultValue: '0.7' }),
    chartProp('showNeedle', 'boolean', 'Displays the needle indicator.', { defaultValue: 'true' }),
    chartProp('needleColor', 'string', 'Needle color.'),
  ],
  histogram: [
    chartProp('values', 'number[]', 'Raw values to distribute into bins.', { required: true }),
    chartProp('bins', 'number', 'Bin count; Sturges formula is used when omitted.'),
    chartProp('thresholds', 'number[]', 'Explicit bin thresholds.'),
    chartProp('xLabel', 'string', 'Horizontal-axis label.'),
    chartProp('yLabel', 'string', 'Vertical-axis label.', { defaultValue: '"Frequency"' }),
    chartProp('color', 'string', 'Bar color.'),
    chartProp('showLabels', 'boolean', 'Displays frequency labels.', { defaultValue: 'false' }),
    chartProp('cumulativeLine', 'boolean', 'Displays a cumulative-frequency line.', { defaultValue: 'false' }),
    chartProp('cumulativeColor', 'string', 'Cumulative-line color.'),
    chartProp('formatValue', '(value: number) => string', 'Formats x-axis values.'),
    chartProp('density', 'boolean', 'Normalizes frequencies to 0–1.', { defaultValue: 'false' }),
  ],
  'funnel-chart': [
    chartProp('data', 'DataPoint[]', 'Ordered funnel stages.', { required: true }),
    chartProp('showPercentage', 'boolean', 'Displays each stage share.', { defaultValue: 'true' }),
    chartProp('showConversion', 'boolean', 'Displays stage-to-stage conversion.', { defaultValue: 'false' }),
    chartProp('orientation', '"vertical" | "horizontal"', 'Funnel direction.', { defaultValue: '"vertical"' }),
  ],
  waterfall: [
    chartProp('data', 'WaterfallDataPoint[]', 'Ordered increases, decreases, and totals.', { required: true }),
    chartProp('increaseColor', 'string', 'Color for increase bars.'),
    chartProp('decreaseColor', 'string', 'Color for decrease bars.'),
    chartProp('totalColor', 'string', 'Color for total bars.'),
    chartProp('showConnectors', 'boolean', 'Displays connectors between bars.', { defaultValue: 'true' }),
    chartProp('showValues', 'boolean', 'Displays values on bars.', { defaultValue: 'true' }),
    chartProp('formatValue', '(value: number) => string', 'Formats displayed values.'),
    chartProp('orientation', '"vertical" | "horizontal"', 'Chart direction.', { defaultValue: '"vertical"' }),
  ],
  sankey: [
    chartProp('nodes', 'SankeyNode[]', 'Source and target entities.', { required: true }),
    chartProp('links', 'SankeyLink[]', 'Weighted directed connections.', { required: true }),
    chartProp('nodeWidth', 'number', 'Node width in pixels.', { defaultValue: '20' }),
    chartProp('nodePadding', 'number', 'Vertical gap between nodes.', { defaultValue: '16' }),
    chartProp('linkOpacity', 'number', 'Base link opacity.', { defaultValue: '0.4' }),
    chartProp('linkHoverOpacity', 'number', 'Hovered-link opacity.', { defaultValue: '0.7' }),
    chartProp('align', '"left" | "right" | "center" | "justify"', 'Node-column alignment.', { defaultValue: '"justify"' }),
    chartProp('showLinkValues', 'boolean', 'Displays values on links.', { defaultValue: 'false' }),
    chartProp('showNodeLabels', 'boolean', 'Displays node labels.', { defaultValue: 'true' }),
    chartProp('formatValue', '(value: number) => string', 'Formats link values.'),
    chartProp('onNodeClick', '(node: SankeyNode) => void', 'Runs when a node is clicked.'),
    chartProp('onLinkClick', '(link: SankeyLink) => void', 'Runs when a link is clicked.'),
  ],
  'gantt-chart': [
    chartProp('tasks', 'GanttTask[]', 'Scheduled tasks with start/end dates and optional progress.', { required: true }),
    chartProp('showProgress', 'boolean', 'Displays completion within task bars.', { defaultValue: 'true' }),
    chartProp('showToday', 'boolean', 'Displays a marker for the current day.', { defaultValue: 'true' }),
  ],
  sparkline: [
    chartProp('data', 'number[]', 'Ordered values rendered as a micro-trend.', { required: true }),
    chartProp('color', 'string', 'Line color.'),
    chartProp('fill', 'boolean', 'Fills the area below the line.', { defaultValue: 'false' }),
    chartProp('fillOpacity', 'number', 'Area-fill opacity.', { defaultValue: '0.15' }),
    chartProp('strokeWidth', 'number', 'Line width.', { defaultValue: '1.5' }),
    chartProp('curve', '"sharp" | "smooth" | "step"', 'Interpolation strategy.', { defaultValue: '"smooth"' }),
    chartProp('showEndDot', 'boolean', 'Displays the last point.', { defaultValue: 'true' }),
    chartProp('showMinMax', 'boolean', 'Displays minimum and maximum points.', { defaultValue: 'false' }),
    chartProp('animate', 'boolean', 'Animates the line on mount.', { defaultValue: 'true' }),
    chartProp('colorScheme', 'ChartColorScheme', 'Named palette from the active tenant chart personality.'),
  ],
  'calendar-heatmap': [
    chartProp('data', 'CalendarHeatMapDataPoint[]', 'Dated activity values.', { required: true }),
    chartProp('startDate', 'Date | string', 'Visible range start; defaults to one year ago.'),
    chartProp('endDate', 'Date | string', 'Visible range end; defaults to today.'),
    chartProp('colorRange', '[string, string]', 'Low/high intensity colors.'),
    chartProp('colorSteps', 'number', 'Number of discrete color steps.', { defaultValue: '5' }),
    chartProp('cellSize', 'number', 'Day-cell size in pixels.', { defaultValue: '14' }),
    chartProp('cellGap', 'number', 'Gap between day cells.', { defaultValue: '2' }),
    chartProp('showMonthLabels', 'boolean', 'Displays month labels.', { defaultValue: 'true' }),
    chartProp('showDayLabels', 'boolean', 'Displays weekday labels.', { defaultValue: 'true' }),
    chartProp('formatTooltip', '(date: Date, value: number) => string', 'Formats cell tooltips.'),
    chartProp('onCellClick', '(date: Date, value: number) => void', 'Runs when a day cell is clicked.'),
  ],
  heatmap: [
    chartProp('data', '{ x: string; y: string; value: number }[]', 'Matrix coordinates and intensities.', { required: true }),
    chartProp('xLabels', 'string[]', 'Explicit horizontal-axis order.'),
    chartProp('yLabels', 'string[]', 'Explicit vertical-axis order.'),
    chartProp('colorRange', '[string, string]', 'Low/high intensity colors.'),
    chartProp('cellRadius', 'number', 'Cell corner radius.', { defaultValue: '2' }),
  ],
  treemap: [
    chartProp('data', 'TreeMapNode[]', 'Nested nodes with roll-up values.', { required: true }),
    chartProp('showLabels', 'boolean', 'Displays labels when cells have room.', { defaultValue: 'true' }),
    chartProp('padding', 'number', 'Gap between cells.', { defaultValue: '2' }),
  ],
  'network-graph': [
    chartProp('nodes', 'NetworkNode[]', 'Graph nodes.', { required: true }),
    chartProp('links', 'NetworkLink[]', 'Edges between graph nodes.', { required: true }),
    chartProp('directed', 'boolean', 'Adds directional markers to edges.', { defaultValue: 'false' }),
  ],
  bullet: [
    chartProp('data', 'BulletDataPoint | BulletDataPoint[]', 'Metrics whose target and ranges live inside each data item.', { required: true }),
    chartProp('orientation', '"horizontal" | "vertical"', 'Bullet direction.', { defaultValue: '"horizontal"' }),
    chartProp('barHeight', 'number', 'Bar height in horizontal mode.', { defaultValue: '28' }),
    chartProp('gap', 'number', 'Gap between bullet items.', { defaultValue: '16' }),
    chartProp('showLabels', 'boolean', 'Displays values and labels.', { defaultValue: 'true' }),
    chartProp('formatValue', '(value: number) => string', 'Formats displayed values.'),
    chartProp('rangeColors', '[string, string, string]', 'Colors for poor, satisfactory, and good ranges.'),
    chartProp('valueColor', 'string', 'Actual-value bar color.'),
    chartProp('targetColor', 'string', 'Target-marker color.'),
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
  const surfaceProps = chart.slug === 'sparkline'
    ? SPARKLINE_SURFACE_PROPS
    : CHART_BASE_PROPS;

  return [
    ...(SPECIFIC_PROPS[chart.slug] ?? []),
    ...getCapabilityProps(chart),
    ...surfaceProps,
  ];
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
