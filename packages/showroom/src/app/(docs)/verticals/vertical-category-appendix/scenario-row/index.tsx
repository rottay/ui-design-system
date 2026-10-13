'use client';

import { Badge, Box, Flex, Stack, Text, useTokens } from '@rottay/design-system';

import {
  BORDER,
  CARD_SHADOW,
  FEATURED_COMPONENT_LIMIT,
  PANEL_BACKGROUND,
  PANEL_SHADOW,
  SUBTLE_SURFACE,
  SURFACE,
  TEXT_MUTED,
  TEXT_SECONDARY,
  buildInspectionNote,
  describeTierMix,
  formatTierMix,
  getTierMix,
  inferArchetype,
  type VerticalDemoItem,
} from '../foundation';

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

export function ScenarioRow({
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
