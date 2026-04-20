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

function BrandPreviewColumn({ brand }: { brand: BrandInfo }) {
  return (
    <DesignSystemProvider tenantSlug={brand.slug}>
      <BrandPreviewContent brand={brand} />
    </DesignSystemProvider>
  );
}

function BrandPreviewContent({ brand }: { brand: BrandInfo }) {
  const tokens = useTokens();

  return (
    <Card style={{ height: '100%' }}>
      <Stack spacing="md">
        {/* Brand header */}
        <Flex align="center" justify="between">
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {brand.label}
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {brand.vertical}
            </Text>
          </Stack>
          <Badge variant="primary">{brand.slug}</Badge>
        </Flex>

        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          {brand.description}
        </Text>

        {/* Color scale */}
        <Box>
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

        {/* Divider */}
        <Box style={{ height: 1, background: 'var(--ds-color-neutral-200)' }} />

        {/* Mini app preview */}
        <Stack spacing="md">
          <Text
            size="sm"
            weight="semibold"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            Component Samples
          </Text>

          {/* Buttons */}
          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button>Default</Button>
            <Button variant="ghost">Ghost</Button>
          </Flex>

          {/* Input */}
          <Input placeholder="Search..." />

          {/* Card */}
          <Card style={{ background: 'var(--ds-color-neutral-50)' }}>
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

          {/* Badges */}
          <Flex gap={6} style={{ flexWrap: 'wrap' }}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function ThemeBuilderPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Theme Builder
          </Text>
          <Badge variant="primary">3 brands</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Compare the three first-party brand themes side by side. Each column
            is wrapped in its own DesignSystemProvider with a different tenantSlug,
            showing how the same components adapt to each brand identity.
          </Text>
        </Box>
      </Box>

      {/* Side-by-side brand previews */}
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

      {/* BrandTheme explanation */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            The BrandTheme System
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Each tenant can define a BrandTheme that controls approximately 140 CSS
            custom properties. These variables are organized into categories and
            injected at runtime by the ThemeProvider. The merge chain is:
          </Text>
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
                    background: 'var(--ds-color-primary-100)',
                    color: 'var(--ds-color-primary-700)',
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

      {/* CSS variable categories */}
      <Box>
        <Text as={"h3" as any} size="lg" weight="semibold" style={{ marginBottom: tokens.spacing[4] }}>
          CSS Variable Categories (~140 total)
        </Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {CSS_VAR_CATEGORIES.map((cat) => (
            <Card key={cat.title}>
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Text size="sm" weight="semibold">{cat.title}</Text>
                  <Badge>{cat.count}</Badge>
                </Flex>
                <Stack spacing={4}>
                  {cat.examples.map((ex, i) => (
                    <Text
                      key={i}
                      size="xs"
                      style={{
                        fontFamily: 'var(--ds-font-mono, monospace)',
                        color: 'var(--ds-color-text-secondary)',
                      }}
                    >
                      {ex}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
