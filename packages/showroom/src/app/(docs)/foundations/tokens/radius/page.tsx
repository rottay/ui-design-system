'use client';

import { ShowroomLink as Link } from '@/components/showroom-link';
import {
  Badge,
  Box,
  Card,
  DesignSystemProvider,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';
import { useShowroom } from '@/components/showroom-context';

const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

const RADIUS_DESCRIPTIONS: Record<(typeof RADIUS_STEPS)[number], string> = {
  none: 'Hard edges for sharp containers and utilitarian framing.',
  sm: 'Minor rounding for inputs, pills, and low-emphasis controls.',
  md: 'Default radius for cards, panels, and common containers.',
  lg: 'Visible softness for elevated surfaces and focused modules.',
  xl: 'Hero-level framing for editorial or premium sections.',
  full: 'Circular and pill treatments for avatars, chips, and toggles.',
};

function EngineRadiusPreview({
  engine,
  label,
}: {
  engine: 'classic' | 'modern' | 'rustic';
  label: string;
}) {
  const { tenantSlug } = useShowroom();

  return (
    <DesignSystemProvider forceEngine={engine} tenantSlug={tenantSlug}>
      <EngineRadiusPreviewContent label={label} />
    </DesignSystemProvider>
  );
}

function EngineRadiusPreviewContent({ label }: { label: string }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[4], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Badge variant="secondary">{tokens.borderRadius.md}</Badge>
        </Flex>
        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            background: 'linear-gradient(135deg, rgba(0,102,204,0.07), rgba(255,255,255,0.96))',
            border: '1px solid rgba(0,102,204,0.1)',
          }}
        >
          <Stack spacing="sm">
            <Box
              style={{
                height: 14,
                width: '48%',
                borderRadius: tokens.borderRadius.full,
                background: 'var(--ds-color-primary-500)',
              }}
            />
            <Box
              style={{
                height: 72,
                borderRadius: tokens.borderRadius.lg,
                background: 'var(--ds-color-white)',
                border: '1px solid var(--ds-color-neutral-200)',
                boxShadow: tokens.shadows.sm,
              }}
            />
            <Flex gap={8}>
              <Box
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: tokens.borderRadius.sm,
                  background: 'var(--ds-color-neutral-200)',
                }}
              />
              <Box
                style={{
                  width: 72,
                  height: 28,
                  borderRadius: tokens.borderRadius.full,
                  background: 'var(--ds-color-primary-100)',
                }}
              />
            </Flex>
          </Stack>
        </Box>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
          The same composition feels more formal, softer, or quieter depending
          on engine radius values.
        </Text>
      </Stack>
    </Card>
  );
}

export default function RadiusPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Box
        style={{
          padding: tokens.spacing[5],
          borderRadius: tokens.borderRadius.xl,
          background:
            'radial-gradient(circle at top left, rgba(0,102,204,0.14), transparent 35%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
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
              <Badge variant="secondary">Corner language</Badge>
            </Flex>
            <Stack spacing="sm">
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ letterSpacing: '-0.04em' }}
              >
                Border radius is one of the fastest ways to feel an engine change.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Even when layout, components, and copy stay the same, corner
                treatment changes the emotional posture of the UI. Classic feels
                formal, Modern feels confident, and Rustic stays restrained.
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
                  label: 'Current md',
                  value: tokens.borderRadius.md,
                  detail: 'Default card and panel corner.',
                },
                {
                  label: 'Current full',
                  value: tokens.borderRadius.full,
                  detail: 'Chips, avatars, toggles, and pills.',
                },
                {
                  label: 'Token count',
                  value: `${RADIUS_STEPS.length} levels`,
                  detail: 'Enough range without ambiguity.',
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
                    <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                      {item.detail}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Box>
          </Stack>

          <Card style={{ padding: tokens.spacing[5], background: 'rgba(15,23,42,0.95)', color: 'var(--ds-color-white)' }}>
            <Stack spacing="md">
              <Text size="sm" weight="semibold">
                Radius stack
              </Text>
              <Flex gap={10} align="end" justify="center">
                {RADIUS_STEPS.map((step, index) => (
                  <Box
                    key={step}
                    style={{
                      width: 34 + index * 8,
                      height: 34 + index * 8,
                      borderRadius: tokens.borderRadius[step],
                      background: 'linear-gradient(135deg, rgba(94,176,255,0.3), rgba(255,255,255,0.85))',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </Flex>
              <Text
                size="xs"
                style={{ color: 'rgba(255,255,255,0.66)', textAlign: 'center' }}
              >
                `md` is usually the center of gravity.
              </Text>
            </Stack>
          </Card>
        </Box>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        {RADIUS_STEPS.map((step, index) => (
          <Card key={step} style={{ padding: tokens.spacing[5] }}>
            <Stack spacing="md">
              <Flex align="center" justify="between">
                <Text
                  size="md"
                  weight="semibold"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {step}
                </Text>
                <Badge variant="secondary">{tokens.borderRadius[step]}</Badge>
              </Flex>
              <Flex justify="center">
                <Box
                  style={{
                    width: 84 + index * 4,
                    height: 84,
                    borderRadius: tokens.borderRadius[step],
                    background: 'linear-gradient(135deg, var(--ds-color-primary-100), var(--ds-color-primary-300))',
                    border: '1px solid var(--ds-color-primary-300)',
                  }}
                />
              </Flex>
              <Box
                style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  background: 'var(--ds-color-bg-overlay)',
                  border: '1px solid var(--ds-color-border-secondary)',
                }}
              >
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  {RADIUS_DESCRIPTIONS[step]}
                </Text>
              </Box>
              <Text
                size="xs"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}
              >
                tokens.borderRadius.{step}
              </Text>
            </Stack>
          </Card>
        ))}
      </Box>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={"h2" as any} size="lg" weight="semibold">
            Same scene, three engine personalities
          </Text>
          <Badge variant="secondary">Engine comparison</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          <EngineRadiusPreview engine="classic" label="Classic" />
          <EngineRadiusPreview engine="modern" label="Modern" />
          <EngineRadiusPreview engine="rustic" label="Rustic" />
        </Box>
      </Stack>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Radius heuristics
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {[
              {
                title: 'Use `sm` on controls',
                detail: 'Inputs, segmented filters, and compact utility buttons.',
              },
              {
                title: 'Use `md` for default surfaces',
                detail: 'Cards, panels, popovers, and data modules.',
              },
              {
                title: 'Reserve `xl` for framing',
                detail: 'Hero bands, spotlight sections, and narrative cards.',
              },
              {
                title: 'Use `full` semantically',
                detail: 'Pills, avatars, badges, toggles, and circular affordances.',
              },
            ].map((item) => (
              <Box
                key={item.title}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  border: '1px solid var(--ds-color-neutral-200)',
                  background: 'var(--ds-color-neutral-50)',
                }}
              >
                <Stack spacing={4}>
                  <Text size="sm" weight="semibold">
                    {item.title}
                  </Text>
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                    {item.detail}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <CodeBlock
        title="Radius usage"
        language="tsx"
        code={`const tokens = useTokens();

<Card style={{ borderRadius: tokens.borderRadius.md }} />
<Box style={{ borderRadius: tokens.borderRadius.xl }} />
<Badge style={{ borderRadius: tokens.borderRadius.full }} />`}
      />
    </Stack>
  );
}
