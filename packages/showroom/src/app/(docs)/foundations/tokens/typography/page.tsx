'use client';

import { Fragment } from 'react';
import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  Badge,
  Box,
  Card,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';

const FONT_SIZES = [
  { key: 'xs', label: 'xs', rem: '0.75rem', use: 'Meta, captions, helper text' },
  { key: 'sm', label: 'sm', rem: '0.875rem', use: 'Dense body copy, tables' },
  { key: 'md', label: 'md', rem: '1rem', use: 'Default application body' },
  { key: 'lg', label: 'lg', rem: '1.125rem', use: 'Section intros, stat labels' },
  { key: 'xl', label: 'xl', rem: '1.25rem', use: 'Module headings' },
  { key: '2xl', label: '2xl', rem: '1.5rem', use: 'Page headings' },
  { key: '3xl', label: '3xl', rem: '1.875rem', use: 'Editorial feature headlines' },
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

function SizeRampRow({ size }: { size: (typeof FONT_SIZES)[number] }) {
  return (
    <Box
      style={{
        padding: '12px 0',
        borderBottom: '1px solid var(--ds-color-neutral-100)',
      }}
    >
      <Stack spacing={8}>
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Flex align="center" gap={10} style={{ flexWrap: 'wrap' }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: 'var(--ds-color-primary-600)',
                fontFamily: 'var(--font-geist-mono, monospace)',
              }}
            >
              {size.label}
            </Text>
            <Text
              size="xs"
              style={{
                color: 'var(--ds-color-text-muted)',
                fontFamily: 'var(--font-geist-mono, monospace)',
              }}
            >
              {size.rem}
            </Text>
          </Flex>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {size.use}
          </Text>
        </Flex>
        <Text size={size.key}>{SAMPLE_TEXT}</Text>
      </Stack>
    </Box>
  );
}

export default function TypographyPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Box
        style={{
          padding: tokens.spacing[5],
          borderRadius: tokens.borderRadius.xl,
          background:
            'radial-gradient(circle at top left, rgba(0,102,204,0.12), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
          border: '1px solid rgba(0, 102, 204, 0.1)',
        }}
      >
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'start',
          }}
        >
          <Stack spacing="lg">
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Link
                href="/foundations/tokens"
                style={{
                  textDecoration: 'none',
                  color: 'var(--ds-color-primary-600)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Tokens
              </Link>
              <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
                /
              </Text>
              <Badge variant="secondary">Hierarchy</Badge>
            </Flex>

            <Stack spacing="sm">
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ letterSpacing: '-0.04em', maxWidth: 720 }}
              >
                Typography gives the system its voice before color or motion ever shows up.
              </Text>
              <Text
                size="md"
                style={{
                  color: 'var(--ds-color-text-secondary)',
                  maxWidth: 760,
                }}
              >
                The showroom needs more than a ramp of font sizes. It needs a
                hierarchy model: headline, supporting copy, diagnostics, dense
                tables, and callouts that remain readable across tenants,
                engines, and screen densities.
              </Text>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {[
                {
                  label: 'Primary family',
                  value: 'Geist Sans',
                  detail: 'Body and interface text.',
                },
                {
                  label: 'Diagnostic family',
                  value: 'Geist Mono',
                  detail: 'Code, tokens, and measurements.',
                },
                {
                  label: 'Scale shape',
                  value: `${FONT_SIZES.length} sizes / ${FONT_WEIGHTS.length} weights`,
                  detail: 'Enough range without noise.',
                },
              ].map((item) => (
                <Card key={item.label} style={{ padding: tokens.spacing[4] }}>
                  <Stack spacing={4}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text size="lg" weight="bold">
                      {item.value}
                    </Text>
                    <Text
                      size="xs"
                      style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                    >
                      {item.detail}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Stack>

          <Card
            style={{
              padding: tokens.spacing[5],
              background: 'rgba(15,23,42,0.95)',
              color: 'var(--ds-color-white)',
            }}
          >
            <Stack spacing="md">
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.62)' }}>
                Specimen
              </Text>
              <Text
                size="3xl"
                weight="bold"
                style={{ letterSpacing: '-0.05em', lineHeight: 1.05 }}
              >
                Clear hierarchy makes premium docs feel trustworthy.
              </Text>
              <Text
                size="sm"
                style={{ color: 'rgba(255,255,255,0.74)', lineHeight: 1.6 }}
              >
                Use bold contrast for headlines, comfortable body rhythm for
                explanation, and mono only where measurement matters.
              </Text>
              <Text
                size="xs"
                style={{
                  color: 'rgba(255,255,255,0.58)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}
              >
                tokens.typography.fontSize + fontWeight + lineHeight
              </Text>
            </Stack>
          </Card>
        </Box>
      </Box>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
            <Text as={"h2" as any} size="xl" weight="semibold">
              Font families and roles
            </Text>
            <Badge variant="secondary">Sans + mono</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.lg,
                border: '1px solid var(--ds-color-neutral-200)',
                background: 'var(--ds-color-white)',
              }}
            >
              <Stack spacing="md">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-primary-600)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  UI / editorial
                </Text>
                <Text
                  size="2xl"
                  weight="bold"
                  style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}
                >
                  {SAMPLE_TEXT}
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  Headings, body, lists, metrics, labels, and narrative content.
                </Text>
              </Stack>
            </Box>

            <Box
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.lg,
                border: '1px solid var(--ds-color-neutral-200)',
                background: 'var(--ds-color-neutral-50)',
              }}
            >
              <Stack spacing="md">
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: 'var(--ds-color-primary-600)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  Measurement / code
                </Text>
                <Text
                  size="xl"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {SAMPLE_TEXT}
                </Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  Token values, snippets, diagnostics, data labels, and compact technical readouts.
                </Text>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Card>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h2" as any} size="lg" weight="semibold">
              Size ramp
            </Text>
            <Badge variant="secondary">{FONT_SIZES.length} sizes</Badge>
          </Flex>
          <Stack spacing={0}>
            {FONT_SIZES.map((size) => (
              <SizeRampRow key={size.key} size={size} />
            ))}
          </Stack>
        </Stack>
      </Card>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
          gap: tokens.spacing[5],
        }}
      >
        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Flex align="center" justify="between">
              <Text as={"h2" as any} size="lg" weight="semibold">
                Weight ladder
              </Text>
              <Badge variant="secondary">{FONT_WEIGHTS.length} weights</Badge>
            </Flex>
            {FONT_WEIGHTS.map((weight) => (
              <Box
                key={weight.key}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--ds-color-neutral-100)',
                }}
              >
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(64px, auto) minmax(0, 1fr) auto',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                  >
                    {weight.key}
                  </Text>
                  <Text size="lg" weight={weight.key as any} style={{ minWidth: 0 }}>
                    {SAMPLE_TEXT}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                    }}
                  >
                    {weight.value}
                  </Text>
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>

        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Flex align="center" justify="between">
              <Text as={"h2" as any} size="lg" weight="semibold">
                Line-height behavior
              </Text>
              <Badge variant="secondary">Reading rhythm</Badge>
            </Flex>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {LINE_HEIGHTS.map((lineHeight) => (
                <Box
                  key={lineHeight.key}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.lg,
                    border: '1px solid var(--ds-color-neutral-200)',
                    background: 'var(--ds-color-neutral-50)',
                  }}
                >
                  <Stack spacing={8}>
                    <Flex align="center" justify="between">
                      <Text size="sm" weight="semibold">
                        {lineHeight.label}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          color: 'var(--ds-color-text-muted)',
                          fontFamily: 'var(--font-geist-mono, monospace)',
                        }}
                      >
                        {lineHeight.value}
                      </Text>
                    </Flex>
                    <Text size="sm" style={{ lineHeight: lineHeight.value }}>
                      Premium documentation depends on stable reading rhythm,
                      not just bigger headings.
                    </Text>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        </Card>
      </Box>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Size / weight matrix
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '80px repeat(4, minmax(72px, 1fr))',
                gap: '1px',
                background: 'var(--ds-color-neutral-100)',
                borderRadius: tokens.borderRadius.lg,
                overflow: 'hidden',
                minWidth: 520,
              }}
            >
              <Box style={{ padding: '10px 12px', background: 'var(--ds-color-neutral-50)' }} />
              {FONT_WEIGHTS.map((weight) => (
                <Box
                  key={weight.key}
                  style={{
                    padding: '10px 12px',
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
                    {weight.value}
                  </Text>
                </Box>
              ))}

              {FONT_SIZES.map((size) => (
                <Fragment key={size.key}>
                  <Box
                    style={{
                      padding: '12px',
                      background: 'var(--ds-color-white)',
                      display: 'flex',
                      alignItems: 'center',
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
                      {size.label}
                    </Text>
                  </Box>
                  {FONT_WEIGHTS.map((weight) => (
                    <Box
                      key={`${size.key}-${weight.key}`}
                      style={{
                        padding: '12px',
                        background: 'var(--ds-color-white)',
                      }}
                    >
                      <Text size={size.key} weight={weight.key as any}>
                        Aa
                      </Text>
                    </Box>
                  ))}
                </Fragment>
              ))}
            </Box>
          </Box>
        </Stack>
      </Card>

      <CodeBlock
        title="Typography usage"
        language="tsx"
        code={`<Text as={"h2" as any} size="xl" weight="bold">
  Dashboard overview
</Text>

<Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
  Supporting copy uses semantic text aliases.
</Text>

<Text
  size="xs"
  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
>
  tokens.typography.fontSize.sm
</Text>`}
      />
    </Stack>
  );
}
