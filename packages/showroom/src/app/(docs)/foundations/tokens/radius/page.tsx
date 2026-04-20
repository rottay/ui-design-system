'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

const RADIUS_DESCRIPTIONS: Record<string, string> = {
  none: 'No rounding. Used for sharp-edged elements.',
  sm: 'Subtle rounding. Inputs, badges, small elements.',
  md: 'Standard rounding. Cards, dropdowns, panels.',
  lg: 'Generous rounding. Modals, large containers.',
  xl: 'Heavy rounding. Emphasis containers, hero sections.',
  full: 'Fully circular. Avatars, pills, toggle tracks.',
};

export default function RadiusPage() {
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
            Border Radius
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Six border radius levels differentiated by engine. Classic is sharp
            and corporate, Modern is generously rounded, and Rustic is minimal.
            Values are resolved through useTokens() and can be overridden per
            tenant.
          </Text>
        </Box>
      </Box>

      {/* Radius showcase */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {RADIUS_STEPS.map((step) => {
          const value = tokens.borderRadius[step];
          return (
            <Card key={step}>
              <Stack spacing="md">
                {/* Visual preview */}
                <Flex justify="center">
                  <Box
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: value,
                      border: '2px solid var(--ds-color-primary-400)',
                      background: 'var(--ds-color-primary-50)',
                      transition: 'border-radius 300ms ease',
                    }}
                  />
                </Flex>

                {/* Label */}
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
                    <Badge variant="secondary">{value}</Badge>
                  </Flex>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        fontFamily: 'var(--font-geist-mono, monospace)',
                      }}
                    >
                      tokens.borderRadius.{step}
                    </Text>
                  </Box>
                </Box>

                {/* Description */}
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-secondary)' }}
                >
                  {RADIUS_DESCRIPTIONS[step]}
                </Text>
              </Stack>
            </Card>
          );
        })}
      </Box>

      {/* Comparison across engines */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Engine comparison (current engine values)
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: tokens.spacing[3],
                minWidth: 500,
              }}
            >
              {RADIUS_STEPS.map((step) => (
                <Box key={step} style={{ textAlign: 'center' }}>
                  <Box
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      maxWidth: 80,
                      margin: '0 auto',
                      borderRadius: tokens.borderRadius[step],
                      background: 'var(--ds-color-primary-100)',
                      border: '1px solid var(--ds-color-primary-300)',
                    }}
                  />
                  <Box style={{ marginTop: tokens.spacing[2] }}>
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
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}
                  >
                    {tokens.borderRadius[step]}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Card>

      {/* Applied examples */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Applied examples
          </Text>
          <Flex gap={16} style={{ flexWrap: 'wrap' }}>
            {/* Badge-like */}
            <Box
              style={{
                padding: '4px 12px',
                borderRadius: tokens.borderRadius.full,
                background: 'var(--ds-color-primary-100)',
                color: 'var(--ds-color-primary-700)',
              }}
            >
              <Text size="xs" weight="medium">
                Pill (full)
              </Text>
            </Box>
            {/* Input-like */}
            <Box
              style={{
                padding: '8px 16px',
                borderRadius: tokens.borderRadius.sm,
                border: '1px solid var(--ds-color-neutral-300)',
              }}
            >
              <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
                Input (sm)
              </Text>
            </Box>
            {/* Card-like */}
            <Box
              style={{
                padding: '12px 20px',
                borderRadius: tokens.borderRadius.md,
                border: '1px solid var(--ds-color-neutral-200)',
                boxShadow: tokens.shadows.sm,
              }}
            >
              <Text size="sm">Card (md)</Text>
            </Box>
            {/* Modal-like */}
            <Box
              style={{
                padding: '12px 20px',
                borderRadius: tokens.borderRadius.lg,
                border: '1px solid var(--ds-color-neutral-200)',
                boxShadow: tokens.shadows.md,
              }}
            >
              <Text size="sm">Modal (lg)</Text>
            </Box>
          </Flex>
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
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.borderRadius.none  // '0'`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.borderRadius.sm    // engine-specific ('4px' / '8px' / '2px')`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.borderRadius.md    // engine-specific ('6px' / '12px' / '4px')`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.borderRadius.full  // '9999px' (same across engines)`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
