'use client';

import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  Badge,
  Button,
  Input,
  DesignSystemProvider,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { useShowroom, useShowroomRuntime } from '@/components/showroom-context';

interface BrandInfo {
  slug: string;
  label: string;
  vertical: string;
  description: string;
}

const BRANDS: BrandInfo[] = [
  {
    slug: 'rottay',
    label: 'Rottay',
    vertical: 'Platform',
    description: 'Enterprise admin default. Balanced, professional palette.',
  },
  {
    slug: 'bithire',
    label: 'BitHire',
    vertical: 'Recruiting',
    description: 'Talent acquisition focused. Energetic, action-driven tones.',
  },
  {
    slug: 'evnto',
    label: 'Evnto',
    vertical: 'Events',
    description: 'Event management and ticketing. Bold, vibrant accents.',
  },
];

const THEME_PROOF_POINTS = [
  {
    label: 'Same components',
    detail: 'The preview uses the same inputs, buttons, and badges in every column.',
  },
  {
    label: 'Different tenant',
    detail: 'Only the tenantSlug changes, so the visual drift is easy to trust.',
  },
  {
    label: 'Variable-driven',
    detail: 'Color, radius, shadow, and chrome all move through runtime theme tokens.',
  },
] as const;

const THEME_COMPARE_LANES = [
  {
    label: 'Hold constant',
    title: 'Same component tree',
    detail:
      'Every column renders the same inputs, buttons, cards, and badges so the brand shift is easy to trust.',
  },
  {
    label: 'Inspect closely',
    title: 'Palette, surface depth, and chrome',
    detail:
      'Brand work should show up in neutral surfaces and controls, not just in obvious accent colors.',
  },
  {
    label: 'Why it matters',
    title: 'One system, multiple product voices',
    detail:
      'The DS should support Platform, BitHire, and Evnto without forcing teams into branch-specific components.',
  },
] as const;

const THEME_REVIEW_POINTS = [
  'Color ladders should diverge clearly without weakening state semantics.',
  'Surface depth and control chrome should feel intentional for each tenant.',
  'Typography and emphasis should support product posture instead of just tinting the same UI.',
] as const;

const CSS_VAR_CATEGORIES = [
  {
    title: 'Palette',
    count: '~40 vars',
    examples: ['--ds-color-primary-{50-900}', '--ds-color-secondary-*', '--ds-color-accent-*', '--ds-color-success/warning/error/info-*'],
  },
  {
    title: 'Typography',
    count: '~20 vars',
    examples: ['--ds-font-family-display', '--ds-font-family-heading', '--ds-font-family-body', '--ds-font-weight-bias', '--ds-letter-spacing-*'],
  },
  {
    title: 'Surfaces',
    count: '~15 vars',
    examples: ['--ds-border-radius-{sm,md,lg,xl}', '--ds-shadow-*', '--ds-glass-*', '--ds-gradient-*'],
  },
  {
    title: 'Motion',
    count: '~10 vars',
    examples: ['--ds-motion-entrance-type', '--ds-motion-spring-*', '--ds-motion-hover-lift', '--ds-motion-stagger'],
  },
  {
    title: 'Chrome (Controls)',
    count: '~30 vars',
    examples: ['--ds-button-primary-bg', '--ds-button-primary-color', '--ds-input-border', '--ds-input-focus-ring'],
  },
  {
    title: 'Chrome (Data)',
    count: '~25 vars',
    examples: ['--ds-table-header-bg', '--ds-table-row-hover', '--ds-card-shadow-rest', '--ds-modal-overlay-bg'],
  },
];

const ENGINE_LABELS = {
  classic: 'Classic',
  modern: 'Modern',
  rustic: 'Rustic',
} as const;

function BrandPreviewColumn({ brand }: { brand: BrandInfo }) {
  const { engine } = useShowroom();

  return (
    <DesignSystemProvider tenantSlug={brand.slug} forceEngine={engine}>
      <BrandPreviewContent brand={brand} engineLabel={ENGINE_LABELS[engine]} />
    </DesignSystemProvider>
  );
}

function ThemeInsightCard({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  const tokens = useTokens();

  return (
    <Box
      style={{
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.xl,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 88%, var(--ds-color-primary-500) 12%) 0%, var(--ds-color-bg-primary) 100%)',
        border: '1px solid var(--ds-color-border-secondary)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 8%, transparent)',
      }}
    >
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: 'var(--ds-color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
        <Badge variant="secondary">Insight</Badge>
      </Flex>
      <Box
        style={{
          height: 1,
          marginTop: 8,
          background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
        }}
      />
      <Text
        size="sm"
        weight="semibold"
        style={{ display: 'block', marginTop: 10, color: 'var(--ds-color-text-primary)', lineHeight: 1.2 }}
      >
        {title}
      </Text>
      <Text
        size="xs"
        style={{
          display: 'block',
          marginTop: 8,
          color: 'var(--ds-color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        {detail}
      </Text>
    </Box>
  );
}

function BrandPreviewContent({
  brand,
  engineLabel,
}: {
  brand: BrandInfo;
  engineLabel: string;
}) {
  const tokens = useTokens();

  return (
    <Card
      style={{
        padding: tokens.spacing[4],
        height: '100%',
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 8%, transparent)',
      }}
    >
      <Stack spacing="md">
        <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {brand.label}
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {brand.vertical}
            </Text>
          </Stack>
          <Flex gap={6} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Badge variant="primary">{brand.slug}</Badge>
            <Badge variant="secondary">{engineLabel}</Badge>
          </Flex>
        </Flex>
        <Box
          style={{
            height: 1,
            background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
          }}
        />

        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 9%, var(--ds-color-bg-overlay)) 0%, var(--ds-color-bg-primary) 100%)',
            border: '1px solid var(--ds-color-border-secondary)',
            boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary-500) 10%, transparent)',
          }}
        >
          <Stack spacing="sm">
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55, maxWidth: 260 }}>
                {brand.description}
              </Text>
              <Badge variant="secondary">Live tenant</Badge>
            </Flex>
            <Box
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
              }}
            />

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: tokens.spacing[2],
              }}
            >
              {[
                { label: 'Scope', value: 'Tenant theme' },
                { label: 'Signal', value: 'Same markup' },
                { label: 'Inspect', value: 'Color + chrome' },
              ].map((item) => (
                  <Box
                    key={item.label}
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.lg,
                      background: 'var(--ds-color-bg-surface)',
                      border: '1px solid var(--ds-color-border-secondary)',
                    }}
                  >
                  <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.label}
                  </Text>
                  <Text size="sm" weight="semibold" style={{ marginTop: tokens.spacing[1] }}>
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Box>
          </Stack>
        </Box>

        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 90%, var(--ds-color-primary-500) 10%) 0%, var(--ds-color-bg-primary) 100%)',
            border: '1px solid var(--ds-color-border-secondary)',
          }}
        >
          <Text
            size="xs"
            weight="semibold"
            style={{ color: 'var(--ds-color-text-muted)', marginBottom: tokens.spacing[2] }}
          >
            Primary Scale
          </Text>
          <Flex gap={2}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <Box
                key={shade}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: shade === 50 ? '6px 0 0 6px' : shade === 900 ? '0 6px 6px 0' : 0,
                  background: `var(--ds-color-primary-${shade})`,
                }}
                title={`primary-${shade}`}
              />
            ))}
          </Flex>
        </Box>

        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
          }}
        >
          <Stack spacing="md">
            <Text
              size="sm"
              weight="semibold"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Interface Sample
            </Text>

            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Button variant="primary">Primary</Button>
              <Button>Default</Button>
              <Button variant="ghost">Ghost</Button>
            </Flex>

            <Input placeholder="Search..." />

            <Card
              style={{
                padding: tokens.spacing[3],
                border: '1px solid var(--ds-color-border-secondary)',
                background: 'var(--ds-color-bg-overlay)',
              }}
            >
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Text size="sm" weight="medium">Record Item</Text>
                  <Badge variant="success">Active</Badge>
                </Flex>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Rendered with {brand.label} brand theme
                </Text>
              </Stack>
            </Card>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: tokens.spacing[2],
              }}
            >
              {[
                { label: 'Primary', badge: 'primary' as const },
                { label: 'Success', badge: 'success' as const },
                { label: 'Warning', badge: 'warning' as const },
                { label: 'Error', badge: 'error' as const },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-surface)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Badge variant={item.badge}>{item.label}</Badge>
                </Box>
              ))}
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

export default function ThemeBuilderPage() {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Stack spacing="lg">
      <Card
        style={{
          position: 'relative',
          padding: tokens.spacing[5],
          overflow: 'hidden',
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          boxShadow: tokens.shadows.lg,
        }}
      >
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at top left, var(--ds-color-info-bg) 0%, transparent 34%),
              radial-gradient(circle at 84% 18%, var(--ds-color-warning-bg) 0%, transparent 26%),
              linear-gradient(180deg, transparent 0%, var(--ds-color-bg-surface) 100%)
            `,
            opacity: 0.7,
          }}
        />
        <Box
          className="showroom-theme-builder-hero-grid"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: tokens.spacing[5],
            alignItems: 'start',
          }}
        >
          <Stack spacing="md">
            <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="primary">Theme Builder</Badge>
              <Badge variant="secondary">3 brands, 1 component tree</Badge>
            </Flex>
            <Text as={"h1" as any} size="2xl" weight="bold" style={{ letterSpacing: '-0.04em' }}>
              Compare tenant identity the way a product team actually ships it: side
              by side, with the same markup and different runtime theme variables.
            </Text>
            <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Each column uses its own DesignSystemProvider and tenantSlug, so the
              difference you see is the brand system doing real work instead of a
              hand-edited mock.
            </Text>
            <Box
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
              }}
            />

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {THEME_COMPARE_LANES.map((lane) => (
                <ThemeInsightCard key={lane.label} {...lane} />
              ))}
            </Box>
          </Stack>

          <Stack
            spacing="sm"
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.xl,
              background: 'var(--ds-color-bg-overlay)',
              border: '1px solid var(--ds-color-border-secondary)',
            }}
          >
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Trust signals
              </Text>
              <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
                <Badge variant="secondary">{ENGINE_LABELS[runtime.engine]}</Badge>
                <Badge variant="secondary">{runtime.productProfileLabel}</Badge>
              </Flex>
            </Flex>
            <Box
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
              }}
            />

            <Box
              className="showroom-theme-builder-proof-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {THEME_PROOF_POINTS.map((point) => (
                <Box
                  key={point.label}
                  style={{
                    padding: tokens.spacing[4],
                    borderRadius: tokens.borderRadius.xl,
                    background: 'var(--ds-color-bg-surface)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {point.label}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      marginTop: tokens.spacing[1],
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {point.detail}
                  </Text>
                </Box>
              ))}
            </Box>

            <Card
              style={{
                padding: tokens.spacing[4],
                border: '1px solid var(--ds-color-border-secondary)',
                background: 'var(--ds-color-bg-overlay)',
              }}
            >
              <Stack spacing="sm">
                <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
                  <Box>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Current runtime
                    </Text>
                    <Text
                      size="sm"
                      weight="semibold"
                      style={{ marginTop: tokens.spacing[1], color: 'var(--ds-color-text-primary)' }}
                    >
                      Live provider chain
                    </Text>
                  </Box>
                  <Flex gap={6} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Badge variant="success">Live</Badge>
                    <Badge variant="secondary">{runtime.tenantName}</Badge>
                    <Badge variant="secondary">{ENGINE_LABELS[runtime.engine]}</Badge>
                  </Flex>
                </Flex>
                <Box
                  style={{
                    height: 1,
                    background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                  }}
                />
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: tokens.spacing[2],
                  }}
                >
                  {[
                    {
                      label: 'Tenant',
                      value: runtime.tenantName,
                      detail: runtime.tenantSlug,
                    },
                    {
                      label: 'Engine',
                      value: ENGINE_LABELS[runtime.engine],
                      detail: 'shape + density',
                    },
                    {
                      label: 'Profile',
                      value: runtime.productProfileLabel,
                      detail: runtime.verticalLabel,
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.lg,
                        background: 'var(--ds-color-bg-surface)',
                        border: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {item.label}
                      </Text>
                      <Text size="sm" weight="semibold" style={{ marginTop: tokens.spacing[1], lineHeight: 1.2 }}>
                        {item.value}
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          display: 'block',
                          marginTop: 4,
                          color: 'var(--ds-color-text-secondary)',
                          lineHeight: 1.5,
                        }}
                      >
                        {item.detail}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Card>

      <Box
        style={{
          padding: tokens.spacing[4],
          borderRadius: tokens.borderRadius.xl,
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-primary) 100%)',
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ maxWidth: 760 }}>
              <Text as={"h2" as any} size="xl" weight="semibold">
                Side-by-side brand lane
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Compare three tenants in the same engine so the brand differences are
                visible without catalog noise.
              </Text>
            </Box>
            <Badge variant="secondary">{BRANDS.length} isolated providers</Badge>
          </Flex>
          <Box
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
            }}
          />

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: tokens.spacing[5],
              alignItems: 'stretch',
            }}
          >
            {BRANDS.map((brand) => (
              <BrandPreviewColumn key={brand.slug} brand={brand} />
            ))}
          </Box>
        </Stack>
      </Box>

      <Box
        className="showroom-theme-builder-system-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(280px, 0.92fr)',
          gap: tokens.spacing[4],
          alignItems: 'start',
        }}
      >
        <Card
          style={{
            padding: tokens.spacing[4],
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
          }}
        >
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              The BrandTheme System
            </Text>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
              Each tenant can define a BrandTheme that controls approximately 140 CSS
              custom properties. These variables are organized into categories and
              injected at runtime by the ThemeProvider. The merge chain is:
            </Text>
            <Box
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
              }}
            />
            <Stack spacing="xs">
              {[
                { step: '1', label: 'DS base tokens', desc: 'Default values for all ~140 CSS variables' },
                { step: '2', label: 'Engine overrides', desc: 'Classic/Modern/Rustic adjust radius, shadows, motion' },
                { step: '3', label: 'Vertical baseline', desc: 'Platform, BitHire, or Evnto preset overrides' },
                { step: '4', label: 'BrandTheme', desc: 'Tenant-specific customization of all ~140 variables' },
              ].map((item) => (
                <Flex key={item.step} align="baseline" gap={12}>
                  <Box
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--ds-color-info-bg)',
                      color: 'var(--ds-color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Box>
                    <Text size="sm" weight="medium">{item.label}</Text>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                      {item.desc}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card
          style={{
            padding: tokens.spacing[4],
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated) 90%, var(--ds-color-primary-500) 10%) 0%, var(--ds-color-bg-primary) 100%)',
          }}
        >
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Review lens
            </Text>
            <Box
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
              }}
            />
            <Stack spacing="xs">
              {THEME_REVIEW_POINTS.map((point) => (
                <Box
                  key={point}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-surface)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
                    {point}
                  </Text>
                </Box>
              ))}
            </Stack>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: tokens.spacing[2],
              }}
            >
              {[
                {
                  label: 'Tenant',
                  value: runtime.tenantName,
                  detail: runtime.tenantSlug,
                },
                {
                  label: 'Engine',
                  value: ENGINE_LABELS[runtime.engine],
                  detail: 'shape + density',
                },
                {
                  label: 'Profile',
                  value: runtime.productProfileLabel,
                  detail: runtime.verticalLabel,
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    background: 'var(--ds-color-bg-surface)',
                    border: '1px solid var(--ds-color-border-secondary)',
                  }}
                >
                  <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                    {item.label}
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ marginTop: tokens.spacing[1] }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: 'var(--ds-color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.detail}
                  </Text>
                </Box>
              ))}
            </Box>
          </Stack>
        </Card>
      </Box>

      <Card
        style={{
          padding: tokens.spacing[4],
          border: '1px solid var(--ds-color-border-secondary)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary-500) 4%, var(--ds-color-bg-elevated)) 0%, var(--ds-color-bg-primary) 100%)',
        }}
      >
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box style={{ maxWidth: 760 }}>
              <Text as={"h3" as any} size="lg" weight="semibold">
                CSS Variable Categories (~140 total)
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                These categories are the levers that let a tenant feel distinct without
                changing component APIs or route structure.
              </Text>
            </Box>
            <Badge variant="secondary">{CSS_VAR_CATEGORIES.length} variable groups</Badge>
          </Flex>
          <Box
            style={{
              height: 1,
              background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
            }}
          />

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {CSS_VAR_CATEGORIES.map((cat) => (
              <Card
                key={cat.title}
                style={{
                  border: '1px solid var(--ds-color-border-secondary)',
                  background:
                    'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" justify="between">
                    <Text size="sm" weight="semibold">{cat.title}</Text>
                    <Badge>{cat.count}</Badge>
                  </Flex>
                  <Box
                    style={{
                      height: 1,
                      background: 'linear-gradient(90deg, var(--ds-color-border-secondary), transparent)',
                    }}
                  />
                  <Stack spacing="xs">
                    {cat.examples.map((ex, i) => (
                      <Box
                        key={i}
                        style={{
                          padding: '8px 10px',
                          borderRadius: tokens.borderRadius.lg,
                          background: 'var(--ds-color-bg-surface)',
                          border: '1px solid var(--ds-color-border-secondary)',
                        }}
                      >
                        <Text
                          size="xs"
                          style={{
                            fontFamily: 'var(--ds-font-mono, monospace)',
                            color: 'var(--ds-color-text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {ex}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Box>
        </Stack>
      </Card>

      <style>{`
        @container showroom-content (max-width: 1120px) {
          .showroom-theme-builder-hero-grid,
          .showroom-theme-builder-system-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Stack>
  );
}
