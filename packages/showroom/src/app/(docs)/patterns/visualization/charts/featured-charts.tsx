'use client';

import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
} from '@rottay/design-system';
import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/composition/components/playground/surface-tokens';

const CARD_SURFACE = SHOWROOM_SURFACES.surface;
const PANEL_SURFACE = SHOWROOM_SURFACES.subtle;
const SUBTLE_BORDER = `1px solid ${SHOWROOM_SURFACES.border}`;
const SHADOW = SHOWROOM_SURFACES.shadow;
const SNAPSHOT_OVERLAY =
  'radial-gradient(circle at top right, color-mix(in srgb, var(--ds-color-primary-500) 16%, transparent), transparent 30%), radial-gradient(circle at left bottom, color-mix(in srgb, var(--ds-color-success-500) 8%, transparent), transparent 34%)';

const FEATURED_ITEMS = [
  {
    slug: 'bar-chart',
    name: 'Bar Chart',
    family: 'Basic',
    description: 'Best when category comparison is the main question and exact differences matter.',
    preview: (
      <BarChart
        data={[
          { label: 'Engineering', value: 45 },
          { label: 'Sales', value: 32 },
          { label: 'Marketing', value: 28 },
          { label: 'Design', value: 19 },
          { label: 'Support', value: 15 },
        ]}
        height={200}
        animate
      />
    ),
  },
  {
    slug: 'line-chart',
    name: 'Line Chart',
    family: 'Basic',
    description: 'Use when trend and continuity matter more than isolated categorical comparison.',
    preview: (
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
        height={200}
        curved
        showDots
        animate
      />
    ),
  },
  {
    slug: 'pie-chart',
    name: 'Pie Chart',
    family: 'Basic',
    description: 'Use sparingly for a few parts of a whole where visual proportion is more useful than precision.',
    preview: (
      <PieChart
        data={[
          { label: 'Desktop', value: 55 },
          { label: 'Mobile', value: 30 },
          { label: 'Tablet', value: 15 },
        ]}
        height={200}
        donut
        showPercentage
        animate
      />
    ),
  },
  {
    slug: 'area-chart',
    name: 'Area Chart',
    family: 'Basic',
    description: 'Useful when cumulative volume should feel present while the trend line remains readable.',
    preview: (
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
        height={200}
        animate
      />
    ),
  },
  {
    slug: 'scatter',
    name: 'Scatter Chart',
    family: 'Basic',
    description: 'Use when the relationship between two measures matters and size can add a third dimension.',
    preview: (
      <ScatterChart
        data={[
          { x: 10, y: 20, label: 'A', size: 40 },
          { x: 25, y: 35, label: 'B', size: 80 },
          { x: 40, y: 15, label: 'C', size: 120 },
          { x: 55, y: 45, label: 'D', size: 60 },
          { x: 70, y: 30, label: 'E', size: 100 },
          { x: 30, y: 50, label: 'F', size: 50 },
        ]}
        xLabel="Revenue ($K)"
        yLabel="Growth (%)"
        bubble
        trendLine
        height={220}
        animate
      />
    ),
  },
];

export function FeaturedCharts() {
  const runtime = useShowroomRuntime();

  return (
    <Stack spacing="lg">
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <Box>
          <Text as={"h2" as any} size="xl" weight="bold">
            Featured charts
          </Text>
          <Text
            size="sm"
            style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}
          >
            A quick visual audit lane for the most common chart decisions.
          </Text>
        </Box>
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          <Badge variant="secondary">Live runtime previews</Badge>
          <Badge variant="secondary">{runtime.tenantName}</Badge>
          <Badge variant="secondary">{runtime.engine}</Badge>
        </Flex>
      </Flex>
      <Box
        style={{
          height: 1,
          background: 'linear-gradient(90deg, var(--ds-color-border), transparent)',
        }}
      />

      <Card
        style={{
          border: SUBTLE_BORDER,
          background: `linear-gradient(180deg, ${CARD_SURFACE} 0%, ${mixWithCanvas(
            'var(--ds-color-primary, #60a5fa)',
            4,
          )} 100%)`,
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Text size="sm" weight="semibold" style={{ display: 'block' }}>
              Runtime check
            </Text>
            <Badge variant="secondary">Provider-aligned</Badge>
          </Flex>
          <Box
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--ds-color-border), transparent)',
            }}
          />
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
            These cards render through the same provider as the rest of the docs.
            If engine or tenant changes do not show up here, the charts are not
            proving real runtime behavior.
          </Text>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {FEATURED_ITEMS.map((item) => (
          <Link
            key={item.slug}
            href={`/patterns/visualization/charts/${item.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <Card
              hoverable
              style={{
                position: 'relative',
                height: '100%',
                padding: 18,
                border: SUBTLE_BORDER,
                background: `linear-gradient(180deg, ${mixWithSurface(
                  'var(--ds-color-primary-500)',
                  4,
                  PANEL_SURFACE,
                )} 0%, ${CARD_SURFACE} 100%)`,
                overflow: 'hidden',
                boxShadow: SHADOW,
              }}
            >
              <Box
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: SNAPSHOT_OVERLAY,
                  pointerEvents: 'none',
                }}
              />
              <Stack spacing="md" style={{ position: 'relative', height: '100%' }}>
                <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                  <Box>
                    <Text as={"h3" as any} size="md" weight="semibold">
                      {item.name}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        marginTop: 4,
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.family}
                    </Text>
                  </Box>
                  <Badge variant="primary">Preview</Badge>
                </Flex>
                <Box
                  style={{
                    height: 1,
                    background: 'linear-gradient(90deg, var(--ds-color-border), transparent)',
                  }}
                />

                <Box
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: SUBTLE_BORDER,
                    background: `linear-gradient(180deg, ${PANEL_SURFACE} 0%, ${mixWithCanvas(
                      'var(--ds-color-primary, #60a5fa)',
                      4,
                    )} 100%)`,
                    boxShadow: `inset 0 1px 0 ${mixWithSurface(
                      'var(--ds-color-primary, #60a5fa)',
                      10,
                      'transparent',
                    )}`,
                  }}
                >
                  {item.preview}
                </Box>

                <Box
                  style={{
                    height: 1,
                    background: 'linear-gradient(90deg, var(--ds-color-border), transparent)',
                  }}
                />

                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                >
                  {item.description}
                </Text>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>
    </Stack>
  );
}
