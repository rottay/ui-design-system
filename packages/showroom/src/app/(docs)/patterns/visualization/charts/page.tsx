import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import {
  chartsByFamily,
  chartFamilies,
  charts,
} from '@/data/registry';
import { FeaturedCharts } from './featured-charts';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChartsOverviewPage() {
  return (
    <Stack spacing="lg">
      {/* Back link */}
      <Box>
        <Link
          href="/patterns/visualization"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--ds-color-primary)',
            textDecoration: 'none',
          }}
        >
          ← Back to Visualization Patterns
        </Link>
      </Box>

      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Charts
          </Text>
          <Badge variant="primary">{charts.length} types</Badge>
        </Flex>
        <Box style={{ marginTop: 8 }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            All charts are D3-backed, engine-agnostic, token-aware,
            personality-driven, and accessible. They read CSS variables natively
            and adapt to the active BrandTheme.
          </Text>
        </Box>
      </Box>

      {/* Featured Charts - live previews */}
      <FeaturedCharts />

      {/* Charts by family */}
      {chartFamilies.map((family) => {
        const familyCharts = chartsByFamily[family.slug];
        if (!familyCharts?.length) return null;

        return (
          <Stack key={family.slug} spacing="md">
            <Flex align="center" gap={8}>
              <Text as={"h2" as any} size="lg" weight="semibold">
                {family.label}
              </Text>
              <Badge>{family.count}</Badge>
            </Flex>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {familyCharts.map((chart) => (
                <Link
                  key={chart.slug}
                  href={`/patterns/visualization/charts/${chart.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      transition:
                        'box-shadow 200ms ease, transform 200ms ease',
                    }}
                  >
                    <Stack spacing="sm">
                      <Flex align="center" justify="between">
                        <Text as={"h3" as any} size="md" weight="semibold">
                          {chart.name}
                        </Text>
                        <Badge variant="default">{family.label}</Badge>
                      </Flex>

                      <Text
                        size="sm"
                        style={{
                          color: 'var(--ds-color-text-secondary)',
                        }}
                      >
                        {chart.description}
                      </Text>

                      {chart.variants && chart.variants.length > 0 && (
                        <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                          {chart.variants.map((v) => (
                            <Box
                              key={v}
                              style={{
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--ds-color-neutral-100)',
                                fontSize: '0.6875rem',
                                color: 'var(--ds-color-text-muted)',
                                fontFamily: 'var(--font-geist-mono)',
                              }}
                            >
                              {v}
                            </Box>
                          ))}
                        </Flex>
                      )}
                    </Stack>
                  </Card>
                </Link>
              ))}
            </Box>
          </Stack>
        );
      })}

      {/* Theming card */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Chart Theming
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Charts use CSS variables natively in SVG fill and stroke.
            useChartTheme resolves vars to hex when needed (Canvas,
            interpolation). BrandTheme.charts controls personality tokens
            such as animateOnMount, lineStyle, showDots, and colorScheme.
          </Text>
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            {['default', 'pastel', 'vibrant', 'monochrome', 'accessible'].map(
              (palette) => (
                <Badge key={palette} variant="default">
                  {palette}
                </Badge>
              ),
            )}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
