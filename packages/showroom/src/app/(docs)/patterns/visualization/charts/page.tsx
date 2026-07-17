import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import {
  SHOWROOM_SURFACES,
  mixWithSurface,
} from '@/components/playground/surface-tokens';
import {
  chartFamilies,
  charts,
  chartsByFamily,
  type ChartFamily,
} from '@/data/registry';
import { FeaturedCharts } from './featured-charts';

const FAMILY_GUIDANCE: Record<
  ChartFamily,
  { summary: string; bestFor: string[] }
> = {
  basic: {
    summary: 'Core charts for comparisons, trends, and part-to-whole stories.',
    bestFor: ['simple decisions', 'dashboard modules', 'high-frequency reporting'],
  },
  statistical: {
    summary: 'Charts for distributions, multivariate shape, and target tracking.',
    bestFor: ['performance review', 'quality analysis', 'benchmarking'],
  },
  flow: {
    summary: 'Charts that explain movement across stages, deltas, and weighted transitions.',
    bestFor: ['pipelines', 'financial storytelling', 'process analysis'],
  },
  temporal: {
    summary: 'Charts that foreground time, cadence, continuity, and schedule.',
    bestFor: ['planning', 'activity monitoring', 'trend compression'],
  },
  spatial: {
    summary: 'Charts that use position and intensity to explain concentration.',
    bestFor: ['occupancy', 'response time grids', 'usage matrices'],
  },
  hierarchical: {
    summary: 'Charts for nested proportions and parent-child relationships.',
    bestFor: ['portfolio mix', 'category analysis', 'taxonomy insight'],
  },
  relational: {
    summary: 'Charts that reveal connections between entities, services, or actors.',
    bestFor: ['system maps', 'network effects', 'dependency analysis'],
  },
  kpi: {
    summary: 'Charts that compress targets, thresholds, and actuals into fast executive reads.',
    bestFor: ['scorecards', 'performance snapshots', 'goal tracking'],
  },
};

const CARD_SURFACE =
  SHOWROOM_SURFACES.surface;
const PANEL_SURFACE =
  SHOWROOM_SURFACES.subtle;
const SUBTLE_BORDER =
  `1px solid ${SHOWROOM_SURFACES.border}`;
const SHADOW = SHOWROOM_SURFACES.shadow;

export default function ChartsOverviewPage() {
  const spotlightFamilies = chartFamilies.slice(0, 3);

  return (
    <Stack spacing="xl">
      <Card
        style={{
          padding: 28,
          border: SUBTLE_BORDER,
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary-500) 8%, var(--ds-color-bg-secondary)) 0%, var(--ds-color-bg-elevated) 48%, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-tertiary)) 100%)',
          boxShadow: SHADOW,
        }}
      >
        <Stack spacing="lg">
          <Flex
            align="center"
            justify="between"
            gap={16}
            style={{ flexWrap: 'wrap' }}
          >
            <Link
              href="/patterns/visualization"
              style={{ textDecoration: 'none' }}
            >
              <Flex align="center" gap={8}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Visualization patterns
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  /
                </Text>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{ color: 'var(--ds-color-text-primary)' }}
                >
                  Charts
                </Text>
              </Flex>
            </Link>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{charts.length} chart types</Badge>
              <Badge variant="secondary">D3-backed</Badge>
              <Badge variant="success">Token-aware</Badge>
            </Flex>
          </Flex>

          <Stack spacing="sm">
            <Text
              as={"h1" as any}
              size="2xl"
              weight="bold"
            >
              Charts should prove runtime behavior before they try to look cinematic
            </Text>
            <Text
              size="md"
              style={{ maxWidth: 860, color: 'var(--ds-color-text-secondary)' }}
            >
              These chart pages should help teams choose the right shape for the
              story, validate behavior under the active docs provider, and
              understand which data contract each chart expects.
            </Text>
            <Text size="sm" style={{ maxWidth: 860, color: 'var(--ds-color-text-secondary)' }}>
              The live previews below inherit the current showroom runtime. The
              guidance cards are here to frame the decision, not to simulate a
              separate charts brand.
            </Text>
            <Box
              style={{
                height: 1,
                marginTop: 4,
                background:
                  'linear-gradient(90deg, var(--ds-color-border), transparent)',
              }}
            />
          </Stack>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
            }}
          >
            {spotlightFamilies.map((family) => {
              const guidance = FAMILY_GUIDANCE[family.slug];

              return (
                <Box
                  key={family.slug}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    border: SUBTLE_BORDER,
                    background: PANEL_SURFACE,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    minHeight: 168,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {family.label} family
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ lineHeight: 1.35, overflowWrap: 'anywhere' }}
                  >
                    {family.count} chart types
                  </Text>
                  <Box
                    style={{
                      height: 1,
                      background:
                        'linear-gradient(90deg, var(--ds-color-border), transparent)',
                    }}
                  />
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {guidance.summary}
                  </Text>
                  <Flex gap={6} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                    {guidance.bestFor.slice(0, 2).map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Card>

      <FeaturedCharts />

      <Card style={{ padding: 22, border: SUBTLE_BORDER, background: CARD_SURFACE, boxShadow: SHADOW }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Chart selection rubric
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {[
              [
                'Start with the question',
                'Is the user comparing categories, tracking time, spotting outliers, or understanding flow?',
              ],
              [
                'Then inspect the data shape',
                'Cardinality, continuity, hierarchy, and target-vs-actual all point toward different chart families.',
              ],
              [
                'Then judge readability',
                'A premium chart is not just animated. It makes the story clearer at a glance.',
              ],
            ].map(([title, description]) => (
              <Box
                key={title}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: PANEL_SURFACE,
                  border: SUBTLE_BORDER,
                  minHeight: 132,
                }}
              >
                <Text as={"h3" as any} size="md" weight="semibold" style={{ lineHeight: 1.3 }}>
                  {title}
                </Text>
                <Box
                  style={{
                    height: 1,
                    marginTop: 8,
                    background:
                      'linear-gradient(90deg, var(--ds-color-border), transparent)',
                  }}
                />
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  {description}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {chartFamilies.map((family) => {
        const familyCharts = chartsByFamily[family.slug];
        if (!familyCharts?.length) {
          return null;
        }

        const guidance = FAMILY_GUIDANCE[family.slug];

        return (
          <Stack key={family.slug} spacing="md">
            <Flex
              align="center"
              justify="between"
              gap={12}
              style={{ flexWrap: 'wrap' }}
            >
              <Box>
                <Flex align="center" gap={8}>
                  <Text as={"h2" as any} size="lg" weight="semibold">
                    {family.label}
                  </Text>
                  <Badge variant="primary">{family.count}</Badge>
                </Flex>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  {guidance.summary}
                </Text>
                <Box
                  style={{
                    height: 1,
                    background:
                      'linear-gradient(90deg, var(--ds-color-border), transparent)',
                  }}
                />
              </Box>
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                {guidance.bestFor.map((item) => (
                  <Badge key={item} variant="default">
                    {item}
                  </Badge>
                ))}
              </Flex>
            </Flex>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                      padding: 20,
                      border: SUBTLE_BORDER,
                      background: `linear-gradient(180deg, ${mixWithSurface(
                        'var(--ds-color-primary-500)',
                        4,
                        SHOWROOM_SURFACES.subtle,
                      )} 0%, ${CARD_SURFACE} 100%)`,
                      boxShadow: SHADOW,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      minHeight: 270,
                    }}
                  >
                    <Stack spacing="md" style={{ height: '100%' }}>
                      <Flex align="center" justify="between" gap={12}>
                        <Text
                          as={"h3" as any}
                          size="md"
                          weight="semibold"
                          style={{ lineHeight: 1.25, overflowWrap: 'anywhere' }}
                        >
                          {chart.name}
                        </Text>
                        <Badge variant="secondary">{family.label}</Badge>
                      </Flex>
                      <Box
                        style={{
                          height: 1,
                          background:
                            'linear-gradient(90deg, var(--ds-color-border), transparent)',
                        }}
                      />

                      <Text
                        size="sm"
                        style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55, overflowWrap: 'anywhere' }}
                      >
                        {chart.description}
                      </Text>

                      {chart.variants && chart.variants.length > 0 && (
                        <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                          {chart.variants.map((variant) => (
                            <Box
                              key={variant}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: 'var(--ds-color-neutral-100)',
                                fontSize: '0.75rem',
                                color: 'var(--ds-color-text-secondary)',
                                fontFamily: 'var(--font-geist-mono)',
                              }}
                            >
                              {variant}
                            </Box>
                          ))}
                        </Flex>
                      )}

                      <Text
                        size="xs"
                        style={{
                          marginTop: 'auto',
                          color: 'var(--ds-color-text-muted)',
                          lineHeight: 1.45,
                        }}
                      >
                        Best for
                      </Text>
                      <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                        {guidance.bestFor.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </Flex>
                    </Stack>
                  </Card>
                </Link>
              ))}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
