'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import { RuntimeFingerprint } from '@/components/runtime/runtime-fingerprint';
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
import { ChevronLeftIcon } from '@rottay/design-system/icons';

export interface VerticalDemoItem {
  title: string;
  description: string;
  components: string[];
}

interface TierMix {
  patterns: number;
  structures: number;
  primitives: number;
}

export interface VerticalCategoryAppendixProps {
  backHref: string;
  backLabel: string;
  label: string;
  headline: string;
  summary: string;
  operators: string[];
  tempo: string;
  principles: string[];
  demos: VerticalDemoItem[];
}

const STRUCTURE_COMPONENTS = new Set([
  'CollectionHeader',
  'TableToolbar',
  'RecordFieldGrid',
  'DetailHeader',
  'FormHeader',
  'StatsHeader',
]);

const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
const TEXT_MUTED = 'var(--ds-color-text-muted)';
const FEATURED_COMPONENT_LIMIT = 4;
const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 90%, var(--ds-color-bg-secondary, #f1f5f9) 10%) 0%, ${SURFACE} 100%)`;

const SCENARIO_READING_GUIDE = [
  {
    label: 'Read order',
    detail:
      'Start with the title and archetype, then inspect composition balance and the part sample.',
  },
  {
    label: 'Proof check',
    detail:
      'Confirm the lane still reads like one product module after the runtime changes tone, density, and contrast.',
  },
];

function inferArchetype(components: string[]) {
  if (
    components.some(
      (component) =>
        component.includes('Chart') ||
        component.includes('Statistic') ||
        component.includes('HeatMap'),
    )
  ) {
    return 'Analytics surface';
  }

  if (
    components.some(
      (component) =>
        component.includes('Form') ||
        component.includes('Builder') ||
        component.includes('Editor'),
    )
  ) {
    return 'Configuration flow';
  }

  if (
    components.some(
      (component) =>
        component.includes('Table') ||
        component.includes('List') ||
        component.includes('Kanban') ||
        component.includes('DataTable'),
    )
  ) {
    return 'Operational index';
  }

  if (
    components.some(
      (component) =>
        component.includes('Timeline') ||
        component.includes('Calendar') ||
        component.includes('Steps'),
    )
  ) {
    return 'Process workspace';
  }

  return 'Task module';
}

function getTierMix(components: string[]): TierMix {
  return components.reduce(
    (accumulator, component) => {
      if (component.startsWith('Pattern')) {
        accumulator.patterns += 1;
      } else if (STRUCTURE_COMPONENTS.has(component)) {
        accumulator.structures += 1;
      } else {
        accumulator.primitives += 1;
      }

      return accumulator;
    },
    { patterns: 0, structures: 0, primitives: 0 },
  );
}

function formatTierMix(tierMix: TierMix) {
  return `${tierMix.patterns}P / ${tierMix.structures}S / ${tierMix.primitives}Pr`;
}

function buildInspectionNote(components: string[]) {
  const archetype = inferArchetype(components);

  if (archetype === 'Analytics surface') {
    return 'Check whether chart emphasis, contrast, and labels stay legible under the active provider.';
  }

  if (archetype === 'Configuration flow') {
    return 'Check whether grouping, spacing, and field hierarchy still feel calm when the runtime changes.';
  }

  if (archetype === 'Operational index') {
    return 'Check whether scanning rhythm, action placement, and row density still feel safe and fast.';
  }

  if (archetype === 'Process workspace') {
    return 'Check whether sequence, progress cues, and handoff points remain easy to follow.';
  }

  return 'Check whether the module still feels product-grade rather than like an isolated component demo.';
}

function describeTierMix(tierMix: TierMix) {
  if (
    tierMix.patterns >= tierMix.structures &&
    tierMix.patterns >= tierMix.primitives
  ) {
    return 'Pattern-led composition';
  }

  if (
    tierMix.structures >= tierMix.patterns &&
    tierMix.structures >= tierMix.primitives
  ) {
    return 'Structure-led composition';
  }

  return 'Primitive-heavy assembly';
}

function buildRuntimeChecks({
  label,
  tempo,
  operators,
  dominantArchetype,
}: {
  label: string;
  tempo: string;
  operators: string[];
  dominantArchetype: string;
}) {
  const operatorSummary =
    operators.length > 2
      ? `${operators[0]}, ${operators[1]}, and ${operators.length - 2} more`
      : operators.join(' and ');

  return [
    {
      label: 'Keep stable',
      detail: `${label} still needs to feel native for ${operatorSummary} even while the provider changes the surrounding chrome.`,
    },
    {
      label: 'Stress point',
      detail: `${tempo} means hierarchy, action placement, and contrast cannot become ambiguous under a different runtime.`,
    },
    {
      label: 'Read as one lane',
      detail: `${dominantArchetype} should feel like one coherent chapter here rather than a stack of isolated component demos.`,
    },
  ];
}

function MetricTile({
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
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
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
        {label}
      </Text>
      <Text
        size="lg"
        weight="bold"
        style={{
          display: 'block',
          marginTop: 10,
          overflowWrap: 'anywhere',
          lineHeight: 1.15,
        }}
      >
        {value}
      </Text>
      <Text
        size="xs"
        style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function ComponentChip({ label }: { label: string }) {
  return (
    <Box
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      <Text
        size="xs"
        style={{
          color: TEXT_SECONDARY,
          fontFamily: 'var(--font-geist-mono, monospace)',
        }}
      >
        {label}
      </Text>
    </Box>
  );
}

function ScenarioRow({
  demo,
  index,
}: {
  demo: VerticalDemoItem;
  index: number;
}) {
  const tokens = useTokens();
  const archetype = inferArchetype(demo.components);
  const tierMix = getTierMix(demo.components);
  const compositionLabel = describeTierMix(tierMix);
  const featuredComponents = demo.components.slice(0, FEATURED_COMPONENT_LIMIT);
  const hiddenComponentCount = demo.components.length - featuredComponents.length;

  return (
    <Box
      style={{
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.xl,
        border: `1px solid ${BORDER}`,
        background:
          'linear-gradient(180deg, rgba(99, 102, 241, 0.1), transparent 34%), var(--ds-color-bg-container, #ffffff)',
        boxShadow: CARD_SHADOW,
      }}
    >
      <Stack spacing="md">
        <Flex
          align="start"
          justify="between"
          gap={16}
          style={{
            flexWrap: 'wrap',
            paddingBottom: tokens.spacing[3],
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Flex align="start" gap={14} style={{ minWidth: 0, flex: '1 1 420px' }}>
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: tokens.borderRadius.xl,
                background: PANEL_BACKGROUND,
                border: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text
                size="sm"
                weight="semibold"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              >
                {String(index + 1).padStart(2, '0')}
              </Text>
            </Box>

            <Stack spacing={4} style={{ minWidth: 0 }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: TEXT_MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Scenario module
              </Text>
              <Text as={"h3" as any} size="md" weight="semibold">
                {demo.title}
              </Text>
              <Text size="sm" style={{ color: TEXT_SECONDARY, lineHeight: 1.55 }}>
                {demo.description}
              </Text>
            </Stack>
          </Flex>

          <Stack spacing={6} style={{ minWidth: 0, flex: '0 1 auto' }}>
            <Badge variant="primary">{archetype}</Badge>
            <Badge variant="secondary">{demo.components.length} parts</Badge>
          </Stack>
        </Flex>

        <Box
          style={{
            paddingTop: tokens.spacing[3],
            borderTop: `1px solid ${BORDER}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          <Box
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.lg,
              background: PANEL_BACKGROUND,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
              Composition balance
            </Text>
            <Text size="sm" weight="semibold" style={{ marginTop: 6, lineHeight: 1.45 }}>
              {compositionLabel}
            </Text>
            <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
              A quick read on which layer is carrying most of the scenario weight.
            </Text>
          </Box>

          <Box
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.lg,
              background: PANEL_BACKGROUND,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
              Tier mix
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{
                marginTop: 6,
                fontFamily: 'var(--font-geist-mono, monospace)',
                lineHeight: 1.4,
              }}
            >
              {formatTierMix(tierMix)}
            </Text>
          </Box>

          <Box
            style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.lg,
              background: PANEL_BACKGROUND,
              border: `1px solid ${BORDER}`,
              boxShadow: PANEL_SHADOW,
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
              Inspect for
            </Text>
            <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.5 }}>
              {buildInspectionNote(demo.components)}
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            padding: tokens.spacing[3],
            borderRadius: tokens.borderRadius.lg,
            background: `linear-gradient(180deg, ${SUBTLE_SURFACE}, ${SURFACE})`,
            border: `1px solid ${BORDER}`,
          }}
        >
          <Stack spacing="sm">
            <Flex align="start" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Box style={{ minWidth: 0, maxWidth: 540 }}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: TEXT_MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Supporting parts
                </Text>
                <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY, lineHeight: 1.45 }}>
                  Representative pieces behind this scenario lane.
                </Text>
              </Box>
              <Badge variant="secondary">
                {featuredComponents.length}/{demo.components.length} shown
              </Badge>
            </Flex>

            <Box
              style={{
                marginTop: tokens.spacing[2],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.lg,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                {featuredComponents.map((component) => (
                  <ComponentChip key={component} label={component} />
                ))}
                {hiddenComponentCount > 0 ? (
                  <ComponentChip label={`+${hiddenComponentCount} more`} />
                ) : null}
              </Flex>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

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
          <ChevronLeftIcon size={16} />
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
