'use client';

import { ShowroomLink as Link } from '@/components/navigation/link';
import { RuntimeFingerprint } from '@/components/runtime/fingerprint';
import { useShowroomRuntime } from '@/components/showroom-context';
import {
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
  useTokens,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

import {
  BORDER,
  CARD_SHADOW,
  PANEL_BACKGROUND,
  PANEL_SHADOW,
  SCENARIO_READING_GUIDE,
  SUBTLE_SURFACE,
  SURFACE,
  TEXT_MUTED,
  TEXT_SECONDARY,
  buildRuntimeChecks,
  formatTierMix,
  getTierMix,
  inferArchetype,
  type VerticalCategoryAppendixProps,
} from './foundation';
import { MetricTile } from './metric-tile';
import { ScenarioRow } from './scenario-row';

export type { VerticalDemoItem, VerticalCategoryAppendixProps } from './foundation';

export function VerticalCategoryAppendix({
  backHref,
  backLabel,
  label,
  headline,
  summary,
  operators,
  tempo,
  principles,
  demos,
}: VerticalCategoryAppendixProps) {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  const aggregateTierMix = demos.reduce(
    (accumulator, demo) => {
      const tierMix = getTierMix(demo.components);
      accumulator.patterns += tierMix.patterns;
      accumulator.structures += tierMix.structures;
      accumulator.primitives += tierMix.primitives;
      return accumulator;
    },
    { patterns: 0, structures: 0, primitives: 0 },
  );

  const uniqueComponentCount = new Set(
    demos.flatMap((demo) => demo.components),
  ).size;

  const archetypeCounts = demos.reduce<Record<string, number>>((accumulator, demo) => {
    const archetype = inferArchetype(demo.components);
    accumulator[archetype] = (accumulator[archetype] ?? 0) + 1;
    return accumulator;
  }, {});

  const dominantArchetype =
    Object.entries(archetypeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    'Task module';
  const runtimeChecks = buildRuntimeChecks({
    label,
    tempo,
    operators,
    dominantArchetype,
  });

  return (
    <Stack spacing="lg" fullWidth>
      <Link href={backHref} style={{ textDecoration: 'none' }}>
        <Box
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 999,
            background: PANEL_BACKGROUND,
            border: `1px solid ${BORDER}`,
            boxShadow: PANEL_SHADOW,
          }}
        >
          <Icon name="navigation.back" decorative size={16} />
          <Text size="sm" color="primary">
            {backLabel}
          </Text>
        </Box>
      </Link>

      <Card
        style={{
          padding: tokens.spacing[5],
          border: `1px solid ${BORDER}`,
          background: `linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent 28%), ${SURFACE}`,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: CARD_SHADOW,
        }}
      >
        <Box
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 26%), linear-gradient(180deg, rgba(148, 163, 184, 0.08), transparent 30%)',
            pointerEvents: 'none',
          }}
        />

        <Stack spacing="lg" style={{ position: 'relative' }}>
          <Box
            style={{
              paddingBottom: tokens.spacing[3],
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">{label}</Badge>
              <Badge variant="secondary">{demos.length} scenario rows</Badge>
              <Badge variant="secondary">
                Tier mix {formatTierMix(aggregateTierMix)}
              </Badge>
            </Flex>
          </Box>

          <Box
            className="showroom-vertical-category-hero"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
              gap: tokens.spacing[4],
              alignItems: 'start',
            }}
          >
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Scenario summary
                </Text>
                <Text
                  as={"h1" as any}
                  size="2xl"
                  weight="bold"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  {headline}
                </Text>
                <Text size="md" style={{ color: TEXT_SECONDARY, maxWidth: 780, lineHeight: 1.65 }}>
                  {summary}
                </Text>
              </Stack>

              <Box
                style={{
                  paddingTop: tokens.spacing[1],
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                <MetricTile
                  label="Scenario rows"
                  value={`${demos.length}`}
                  detail="Named modules that anchor this category's product story."
                />
                <MetricTile
                  label="Unique parts"
                  value={`${uniqueComponentCount}`}
                  detail="Distinct structures, patterns, and primitives in this category."
                />
                <MetricTile
                  label="Dominant archetype"
                  value={dominantArchetype}
                  detail="The prevailing interaction shape across these modules."
                />
              </Box>

              <Box
                style={{
                  marginTop: tokens.spacing[1],
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                <Box
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background: PANEL_BACKGROUND,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Stack spacing="sm">
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Operators
                    </Text>
                    <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                      {operators.map((operator) => (
                        <Badge key={operator} variant="secondary">
                          {operator}
                        </Badge>
                      ))}
                    </Flex>
                    <Text size="sm" style={{ color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                      The category has to stay legible for these roles even when
                      a different tenant runtime shifts density or contrast.
                    </Text>
                  </Stack>
                </Box>

                <Box
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background: PANEL_BACKGROUND,
                    border: `1px solid ${BORDER}`,
                    boxShadow: PANEL_SHADOW,
                  }}
                >
                  <Stack spacing="sm">
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Tempo and pressure
                    </Text>
                    <Badge variant="secondary">{tempo}</Badge>
                    <Text size="sm" style={{ color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                      Use the scenario rows below to verify that hierarchy and
                      control placement still hold up at this pace.
                    </Text>
                  </Stack>
                </Box>
              </Box>

              <Box
              style={{
                marginTop: tokens.spacing[1],
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.xl,
                background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
                <Stack spacing="sm">
                  <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: TEXT_MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Design principles
                    </Text>
                    <Badge variant="secondary">{principles.length} guardrails</Badge>
                  </Flex>
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: tokens.spacing[3],
                    }}
                  >
                    {principles.map((principle, index) => (
                      <Box
                        key={principle}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                          boxShadow: PANEL_SHADOW,
                        }}
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            color: TEXT_MUTED,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          Principle {String(index + 1).padStart(2, '0')}
                        </Text>
                        <Text
                          size="sm"
                          style={{ marginTop: 8, color: TEXT_SECONDARY, lineHeight: 1.5 }}
                        >
                          {principle}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Box>
            </Stack>

            <Card
              style={{
                padding: tokens.spacing[4],
                background: `linear-gradient(180deg, rgba(99, 102, 241, 0.12), transparent 34%), ${PANEL_BACKGROUND}`,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="md">
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    width: 'fit-content',
                  }}
                >
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: 'var(--ds-color-primary)',
                      boxShadow: '0 0 0 4px rgba(148, 163, 184, 0.12)',
                      flexShrink: 0,
                    }}
                  />
                  <Text size="xs" weight="semibold">
                    Active provider
                  </Text>
                </Box>

                <Stack spacing="xs">
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: TEXT_MUTED,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Runtime audit
                  </Text>
                  <Text as={"h2" as any} size="lg" weight="semibold">
                    {runtime.tenantName} is rendering this appendix.
                  </Text>
                  <Text size="sm" style={{ color: TEXT_SECONDARY }}>
                    Use this page as a reference sheet: the scenario modules stay
                    constant, while contrast, shell tone, and component
                    personality respond to the active docs runtime.
                  </Text>
                </Stack>

                <Box style={{ height: 1, background: BORDER }} />
                <RuntimeFingerprint compact itemLimit={6} showHeader={false} />

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: tokens.spacing[3],
                  }}
                >
                  {runtimeChecks.map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          color: TEXT_MUTED,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {item.label}
                      </Text>
                      <Text
                        size="sm"
                        style={{ marginTop: 8, color: TEXT_SECONDARY, lineHeight: 1.5 }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Card>
          </Box>
        </Stack>
      </Card>

      <Stack spacing="sm">
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: TEXT_MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Scenario rows
            </Text>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Scenario modules
            </Text>
            <Text size="sm" style={{ color: TEXT_SECONDARY }}>
              Each row below captures a product-grade module, the component
              spread behind it, and what to scrutinize when the runtime changes.
            </Text>
          </Box>
          <Badge variant="secondary">{demos.length} dense rows</Badge>
        </Flex>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {SCENARIO_READING_GUIDE.map((item) => (
            <Box
              key={item.label}
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: TEXT_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {item.label}
              </Text>
              <Text size="sm" style={{ marginTop: 8, color: TEXT_SECONDARY, lineHeight: 1.55 }}>
                {item.detail}
              </Text>
            </Box>
          ))}
        </Box>

        <Stack spacing="sm" style={{ paddingTop: tokens.spacing[1] }}>
          {demos.map((demo, index) => (
            <ScenarioRow key={demo.title} demo={demo} index={index} />
          ))}
        </Stack>
      </Stack>

      <style>{`
        @container showroom-content (max-width: 1120px) {
          .showroom-vertical-category-hero {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
