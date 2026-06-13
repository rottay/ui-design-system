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

const SHADOW_STEPS = ['sm', 'md', 'lg', 'xl'] as const;

const SHADOW_DESCRIPTIONS: Record<(typeof SHADOW_STEPS)[number], string> = {
  sm: 'Cards at rest, low-emphasis modules, and contained utility chrome.',
  md: 'Default elevation for active cards, menus, and common overlays.',
  lg: 'Prominent lift for modals, drawers, and command surfaces.',
  xl: 'Maximum emphasis for spotlight or high-focus overlay layers.',
};

function EngineShadowPreview({
  engine,
  label,
}: {
  engine: 'classic' | 'modern' | 'rustic';
  label: string;
}) {
  const { tenantSlug } = useShowroom();

  return (
    <DesignSystemProvider tenantSlug={tenantSlug} forceEngine={engine}>
      <EngineShadowPreviewContent label={label} />
    </DesignSystemProvider>
  );
}

function EngineShadowPreviewContent({ label }: { label: string }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[4], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Badge variant="secondary">md shadow</Badge>
        </Flex>
        <Box
          style={{
            padding: tokens.spacing[5],
            borderRadius: tokens.borderRadius.xl,
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.02), rgba(0,102,204,0.06))',
          }}
        >
          <Stack spacing="sm">
            {[tokens.shadows.sm, tokens.shadows.md, tokens.shadows.lg].map((shadow, index) => (
              <Box
                key={`${label}-${index}`}
                style={{
                  height: 48,
                  borderRadius: tokens.borderRadius.lg,
                  background: 'var(--ds-color-white)',
                  boxShadow: shadow,
                  transform: `translateY(-${index * 3}px)`,
                }}
              />
            ))}
          </Stack>
        </Box>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Elevation gets interpreted through each engine&apos;s tone, not only by blur size.
        </Text>
      </Stack>
    </Card>
  );
}

export default function ShadowsPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Box
        style={{
          padding: tokens.spacing[5],
          borderRadius: tokens.borderRadius.xl,
          background:
            'radial-gradient(circle at top left, rgba(0,102,204,0.14), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
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
              <Badge variant="secondary">Elevation</Badge>
            </Flex>
            <Stack spacing="sm">
              <Text as={"h1" as any} size="2xl" weight="bold" style={{ letterSpacing: '-0.04em' }}>
                Shadows define hierarchy, but the real work is separation and focus.
              </Text>
              <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Premium documentation needs depth that clarifies layers instead
                of adding mud. Our engines keep the same elevation semantics,
                while each one interprets them differently.
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
                  label: 'Default active',
                  value: 'md',
                  detail: 'Panels, dropdowns, and card focus states.',
                },
                {
                  label: 'Maximum lift',
                  value: 'xl',
                  detail: 'Used sparingly for high-attention overlays.',
                },
                {
                  label: 'Engine-aware',
                  value: 'Tone shifted',
                  detail: 'Corporate, bold, or whisper-light depth.',
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
                Elevation ladder
              </Text>
              <Flex gap={12} align="end" justify="center">
                {SHADOW_STEPS.map((step, index) => (
                  <Box
                    key={step}
                    style={{
                      width: 58,
                      height: 56 + index * 10,
                      borderRadius: tokens.borderRadius.lg,
                      background: 'var(--ds-color-white)',
                      boxShadow: tokens.shadows[step],
                    }}
                  />
                ))}
              </Flex>
        <Text size="xs" style={{ color: 'rgba(255,255,255,0.66)', textAlign: 'center', lineHeight: 1.55 }}>
          Use contrast in small doses; clarity comes from progression.
        </Text>
            </Stack>
          </Card>
        </Box>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {SHADOW_STEPS.map((step) => (
          <Card key={step} style={{ padding: tokens.spacing[5] }}>
            <Stack spacing="md">
              <Box
                style={{
                  aspectRatio: '4 / 3',
                  borderRadius: tokens.borderRadius.lg,
                  background: 'linear-gradient(180deg, rgba(248,250,252,0.92), rgba(226,232,240,0.76))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  style={{
                    width: '72%',
                    height: '70%',
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-white)',
                    boxShadow: tokens.shadows[step],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    size="lg"
                    weight="bold"
                    style={{ color: 'var(--ds-color-neutral-300)' }}
                  >
                    {step}
                  </Text>
                </Box>
              </Box>
              <Flex align="center" justify="between">
                <Text
                  size="md"
                  weight="semibold"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {step}
                </Text>
                <Badge variant="secondary">tokens.shadows.{step}</Badge>
              </Flex>
              <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                {SHADOW_DESCRIPTIONS[step]}
              </Text>
              <Text
                size="xs"
                style={{
                  color: 'var(--ds-color-text-muted)',
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tokens.shadows[step]}
              </Text>
            </Stack>
          </Card>
        ))}
      </Box>

      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={"h2" as any} size="lg" weight="semibold">
            Engine comparison
          </Text>
          <Badge variant="secondary">Same elevation semantics</Badge>
        </Flex>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          <EngineShadowPreview engine="classic" label="Classic" />
          <EngineShadowPreview engine="modern" label="Modern" />
          <EngineShadowPreview engine="rustic" label="Rustic" />
        </Box>
      </Stack>

      <Card style={{ padding: tokens.spacing[5] }}>
        <Stack spacing="md">
          <Text as={"h2" as any} size="lg" weight="semibold">
            Shadow heuristics
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {[
              'Prefer border + subtle shadow for dense admin tables.',
              'Lift interactives from sm to md on hover instead of inventing custom values.',
              'Use lg and xl for modal families, command palettes, and editorial spotlight modules.',
              'Dark or colorful backgrounds may need stronger surface contrast before stronger shadows.',
            ].map((rule) => (
              <Box
                key={rule}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.lg,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px solid var(--ds-color-neutral-200)',
                }}
              >
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  {rule}
                </Text>
              </Box>
            ))}
          </Box>
        </Stack>
      </Card>

      <CodeBlock
        title="Shadow usage"
        language="tsx"
        code={`const tokens = useTokens();

<Card style={{ boxShadow: tokens.shadows.sm }} />

<Box
  style={{
    boxShadow: isActive ? tokens.shadows.lg : tokens.shadows.md,
  }}
/>`}
      />
    </Stack>
  );
}
