'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

const FONT_SIZES = [
  { key: 'xs', label: 'xs', rem: '0.75rem' },
  { key: 'sm', label: 'sm', rem: '0.875rem' },
  { key: 'md', label: 'md', rem: '1rem' },
  { key: 'lg', label: 'lg', rem: '1.125rem' },
  { key: 'xl', label: 'xl', rem: '1.25rem' },
  { key: '2xl', label: '2xl', rem: '1.5rem' },
  { key: '3xl', label: '3xl', rem: '1.875rem' },
] as const;

const FONT_WEIGHTS = [
  { key: 'normal', label: 'Normal', value: 400 },
  { key: 'medium', label: 'Medium', value: 500 },
  { key: 'semibold', label: 'Semibold', value: 600 },
  { key: 'bold', label: 'Bold', value: 700 },
] as const;

const LINE_HEIGHTS = [
  { key: 'tight', label: 'Tight', value: 1.25 },
  { key: 'normal', label: 'Normal', value: 1.5 },
  { key: 'relaxed', label: 'Relaxed', value: 1.75 },
] as const;

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

export default function TypographyPage() {
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
            Typography
          </Text>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Font sizes from xs (0.75rem) through 3xl (1.875rem), four font
            weights, three line heights, and two font families. All values are
            available through useTokens() and the Text component.
          </Text>
        </Box>
      </Box>

      {/* Font families */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Font families
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: tokens.spacing[4],
            }}
          >
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                border: '1px solid var(--ds-color-neutral-200)',
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-primary-600)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}
              >
                Sans (default)
              </Text>
              <Box style={{ marginTop: tokens.spacing[2] }}>
                <Text
                  size="lg"
                  style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}
                >
                  {SAMPLE_TEXT}
                </Text>
              </Box>
              <Box style={{ marginTop: tokens.spacing[1] }}>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  var(--font-geist-sans)
                </Text>
              </Box>
            </Box>

            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                border: '1px solid var(--ds-color-neutral-200)',
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: 'var(--ds-color-primary-600)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}
              >
                Mono
              </Text>
              <Box style={{ marginTop: tokens.spacing[2] }}>
                <Text
                  size="lg"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {SAMPLE_TEXT}
                </Text>
              </Box>
              <Box style={{ marginTop: tokens.spacing[1] }}>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  var(--font-geist-mono)
                </Text>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Card>

      {/* Font sizes */}
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="md" weight="semibold">
              Font sizes
            </Text>
            <Badge>{FONT_SIZES.length} sizes</Badge>
          </Flex>
          <Box>
            {FONT_SIZES.map((size) => (
              <Box
                key={size.key}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid var(--ds-color-neutral-100)',
                }}
              >
                <Flex align="baseline" gap={16}>
                  <Box style={{ width: 48, flexShrink: 0 }}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--ds-color-primary-600)',
                      }}
                    >
                      {size.label}
                    </Text>
                  </Box>
                  <Box style={{ width: 80, flexShrink: 0 }}>
                    <Text
                      size="xs"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--ds-color-text-muted)',
                      }}
                    >
                      {size.rem}
                    </Text>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size={size.key}>{SAMPLE_TEXT}</Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Font weights */}
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="md" weight="semibold">
              Font weights
            </Text>
            <Badge>{FONT_WEIGHTS.length} weights</Badge>
          </Flex>
          <Box>
            {FONT_WEIGHTS.map((w) => (
              <Box
                key={w.key}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid var(--ds-color-neutral-100)',
                }}
              >
                <Flex align="baseline" gap={16}>
                  <Box style={{ width: 80, flexShrink: 0 }}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--ds-color-primary-600)',
                      }}
                    >
                      {w.key}
                    </Text>
                  </Box>
                  <Box style={{ width: 40, flexShrink: 0 }}>
                    <Text
                      size="xs"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--ds-color-text-muted)',
                      }}
                    >
                      {w.value}
                    </Text>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="lg" weight={w.key as any}>
                      {SAMPLE_TEXT}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Line heights */}
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="md" weight="semibold">
              Line heights
            </Text>
            <Badge>{LINE_HEIGHTS.length} values</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: tokens.spacing[4],
            }}
          >
            {LINE_HEIGHTS.map((lh) => (
              <Box
                key={lh.key}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.md,
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Flex align="center" gap={8} style={{ marginBottom: tokens.spacing[2] }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--ds-color-primary-600)',
                    }}
                  >
                    {lh.key}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    {lh.value}
                  </Text>
                </Flex>
                <Text
                  size="sm"
                  style={{ lineHeight: lh.value }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua. Ut enim ad minim veniam.
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      {/* Size x Weight matrix */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="md" weight="semibold">
            Size / Weight matrix
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '80px repeat(4, 1fr)',
                gap: '1px',
                background: 'var(--ds-color-neutral-100)',
                borderRadius: tokens.borderRadius.md,
                overflow: 'hidden',
                minWidth: 600,
              }}
            >
              {/* Header row */}
              <Box
                style={{
                  padding: '8px 12px',
                  background: 'var(--ds-color-neutral-50)',
                }}
              />
              {FONT_WEIGHTS.map((w) => (
                <Box
                  key={w.key}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--ds-color-neutral-50)',
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    {w.value}
                  </Text>
                </Box>
              ))}

              {/* Data rows */}
              {FONT_SIZES.map((size) => (
                <>
                  <Box
                    key={`label-${size.key}`}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--ds-color-white)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        color: 'var(--ds-color-primary-600)',
                      }}
                    >
                      {size.label}
                    </Text>
                  </Box>
                  {FONT_WEIGHTS.map((w) => (
                    <Box
                      key={`${size.key}-${w.key}`}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--ds-color-white)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Text size={size.key} weight={w.key as any}>
                        Aa
                      </Text>
                    </Box>
                  ))}
                </>
              ))}
            </Box>
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
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// With the Text component`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<Text size="lg" weight="bold">Heading</Text>`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`<Text size="sm" weight="normal">Body</Text>`}
            </Text>
            <br />
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-400)' }}>
              {`// With useTokens()`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.typography.fontSize.lg   // '1.125rem'`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.typography.fontWeight.bold  // 700`}
            </Text>
            <br />
            <Text size="sm" style={{ color: 'var(--ds-color-neutral-100)' }}>
              {`tokens.typography.lineHeight.normal  // 1.5`}
            </Text>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
