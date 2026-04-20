'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

const SPACING_STEPS = [
  { index: 0, label: '0', px: 0 },
  { index: 1, label: '1', px: 4 },
  { index: 2, label: '2', px: 8 },
  { index: 3, label: '3', px: 12 },
  { index: 4, label: '4', px: 16 },
  { index: 5, label: '5', px: 20 },
  { index: 6, label: '6', px: 24 },
  { index: 7, label: '7', px: 32 },
  { index: 8, label: '8', px: 40 },
  { index: 9, label: '9', px: 48 },
  { index: 10, label: '10', px: 64 },
  { index: 11, label: '11', px: 80 },
  { index: 12, label: '12', px: 96 },
];

function SpacingRow({
  index,
  label,
  basePx,
  actualPx,
}: {
  index: number;
  label: string;
  basePx: number;
  actualPx: number;
}) {
  return (
    <Box
      style={{
        padding: '12px 0',
        borderBottom: '1px solid var(--ds-color-neutral-100)',
      }}
    >
      <Flex align="center" gap={16}>
        {/* Index label */}
        <Box style={{ width: 32, flexShrink: 0 }}>
          <Text
            size="sm"
            weight="semibold"
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              color: 'var(--ds-color-text-primary)',
            }}
          >
            {label}
          </Text>
        </Box>

        {/* Pixel value */}
        <Box style={{ width: 60, flexShrink: 0 }}>
          <Text
            size="xs"
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              color: 'var(--ds-color-text-muted)',
            }}
          >
            {actualPx}px
          </Text>
        </Box>

        {/* Visual bar */}
        <Box style={{ flex: 1, position: 'relative' }}>
          <Box
            style={{
              width: Math.max(actualPx, 2),
              height: 20,
              borderRadius: 4,
              background:
                index <= 3
                  ? 'var(--ds-color-primary-200)'
                  : index <= 6
                    ? 'var(--ds-color-primary-400)'
                    : index <= 9
                      ? 'var(--ds-color-primary-600)'
                      : 'var(--ds-color-primary-800)',
              transition: 'width 300ms ease',
            }}
          />
        </Box>

        {/* CSS variable */}
        <Box style={{ flexShrink: 0 }}>
          <Text
            size="xs"
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              color: 'var(--ds-color-text-muted)',
            }}
          >
            tokens.spacing[{index}]
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default function SpacingPage() {
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
            Spacing
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            A consistent spacing scale from 0 to 96px. Values are
            density-scaled at runtime based on the active engine and tenant
            configuration. Classic is slightly compact (0.9375x), Modern is
            baseline (1x), and Rustic is spacious (1.125x).
          </Text>
        </Box>
      </Box>

      {/* Density indicator */}
      <Card>
        <Flex align="center" gap={12}>
          <Text size="sm" weight="semibold">
            Active density scale:
          </Text>
          <Text
            size="sm"
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              color: 'var(--ds-color-primary-600)',
            }}
          >
            {tokens.spacing[4]}px / 16px base ={' '}
            {(tokens.spacing[4] / 16).toFixed(4)}x
          </Text>
        </Flex>
      </Card>

      {/* Spacing scale */}
      <Card>
        <Stack spacing="sm">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="md" weight="semibold">
              Scale
            </Text>
            <Text
              size="xs"
              style={{ color: 'var(--ds-color-text-muted)' }}
            >
              13 steps
            </Text>
          </Flex>
          <Box>
            {SPACING_STEPS.map((step) => (
              <SpacingRow
                key={step.index}
                index={step.index}
                label={step.label}
                basePx={step.px}
                actualPx={tokens.spacing[step.index]}
              />
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Usage examples */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Common usage
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {[
              { step: 1, use: 'Tight gap between inline elements' },
              { step: 2, use: 'Icon-to-text spacing' },
              { step: 3, use: 'Stack spacing (sm)' },
              { step: 4, use: 'Card padding, component gap' },
              { step: 5, use: 'Section spacing' },
              { step: 6, use: 'Card padding (lg)' },
              { step: 8, use: 'Page section gap' },
              { step: 10, use: 'Page margin / large gaps' },
            ].map((item) => (
              <Box
                key={item.step}
                style={{
                  padding: 12,
                  borderRadius: tokens.borderRadius.md,
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    color: 'var(--ds-color-primary-600)',
                  }}
                >
                  spacing[{item.step}] = {tokens.spacing[item.step]}px
                </Text>
                <Box style={{ marginTop: 4 }}>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    {item.use}
                  </Text>
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
              {`// Spacing values are numeric (pixels)`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<Box style={{ padding: tokens.spacing[4] }} />  // 16px`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<Stack spacing={tokens.spacing[3]} />           // 12px`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
