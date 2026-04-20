'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const;

const SHADOW_DESCRIPTIONS: Record<string, string> = {
  sm: 'Subtle elevation. Cards at rest, dropdown triggers, secondary surfaces.',
  md: 'Standard elevation. Active cards, dropdowns, popovers, toasts.',
  lg: 'Prominent elevation. Modals, drawers, floating panels.',
  xl: 'Maximum elevation. Command palettes, full-screen overlays, focus traps.',
};

export default function ShadowsPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Box>
        <Flex align="center" gap={8}>
          <Link
            href="/foundations/tokens"
            style={{
              textDecoration: 'none',
              color: 'var(--ds-color-text-muted)',
              fontSize: '0.875rem',
            }}
          >
            Tokens
          </Link>
          <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
            /
          </Text>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Shadows
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Four shadow levels differentiated by engine. Classic uses multi-layer
            corporate shadows, Modern uses color-tinted bold shadows, and Rustic
            uses barely-there whisper shadows.
          </Text>
        </Box>
      </Box>

      {/* Shadow cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: tokens.spacing[6],
        }}
      >
        {SHADOW_STEPS.map((step) => {
          const value = tokens.shadows[step];
          return (
            <Box key={step}>
              <Stack spacing="md">
                {/* Visual preview */}
                <Box
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-white)',
                    boxShadow: value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'box-shadow 300ms ease',
                  }}
                >
                  <Text
                    size="2xl"
                    weight="bold"
                    style={{ color: 'var(--ds-color-neutral-200)' }}
                  >
                    {step}
                  </Text>
                </Box>

                {/* Info */}
                <Box>
                  <Flex align="center" justify="between">
                    <Text
                      size="md"
                      weight="semibold"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                      }}
                    >
                      {step}
                    </Text>
                    <Badge variant="secondary">
                      tokens.shadows.{step}
                    </Badge>
                  </Flex>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text
                      size="xs"
                      style={{ color: 'var(--ds-color-text-secondary)' }}
                    >
                      {SHADOW_DESCRIPTIONS[step]}
                    </Text>
                  </Box>
                </Box>

                {/* Raw value */}
                <Box
                  style={{
                    padding: '8px 12px',
                    borderRadius: tokens.borderRadius.sm,
                    background: 'var(--ds-color-neutral-50)',
                    overflowX: 'auto',
                  }}
                >
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--ds-color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value}
                  </Text>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      {/* Interactive comparison */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Elevation progression
          </Text>
          <Text
            size="sm"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            Shadows create visual hierarchy through elevation. Higher shadows
            bring elements closer to the viewer.
          </Text>
          <Flex gap={24} align="end" style={{ padding: `${tokens.spacing[4]}px 0` }}>
            {SHADOW_STEPS.map((step, i) => (
              <Box key={step} style={{ textAlign: 'center' }}>
                <Box
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: tokens.borderRadius.md,
                    background: 'var(--ds-color-white)',
                    boxShadow: tokens.shadows[step],
                    marginBottom: tokens.spacing[2],
                    transform: `translateY(-${i * 4}px)`,
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                  }}
                />
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  {step}
                </Text>
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>

      {/* On colored backgrounds */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            On colored surfaces
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {[
              { bg: 'var(--ds-color-neutral-50)', label: 'Neutral bg' },
              { bg: 'var(--ds-color-primary-50)', label: 'Primary bg' },
              { bg: 'var(--ds-color-neutral-900)', label: 'Dark bg' },
            ].map((surface) => (
              <Box
                key={surface.label}
                style={{
                  padding: tokens.spacing[5],
                  borderRadius: tokens.borderRadius.md,
                  background: surface.bg,
                }}
              >
                <Text
                  size="xs"
                  weight="medium"
                  style={{
                    color:
                      surface.label === 'Dark bg'
                        ? 'var(--ds-color-neutral-400)'
                        : 'var(--ds-color-text-muted)',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {surface.label}
                </Text>
                <Box
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    background: 'var(--ds-color-white)',
                    boxShadow: tokens.shadows.md,
                  }}
                >
                  <Text size="sm">Shadow md</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Code */}
      <Card>
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Usage
          </Text>
          <Box
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontSize: '0.8125rem',
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              background: 'var(--ds-color-neutral-900)',
              color: 'var(--ds-color-neutral-100)',
              lineHeight: 1.6,
              overflowX: 'auto',
            }}
          >
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`const tokens = useTokens();`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Apply directly to style objects`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<Box style={{ boxShadow: tokens.shadows.md }} />`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// Combine with hover for interactive elevation`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`style={{ boxShadow: isHovered ? tokens.shadows.lg : tokens.shadows.sm }}`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
