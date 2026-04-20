'use client';

import { Box, Flex, Stack, Text, Card, Badge, Button, Input } from '@rottay/design-system';
import { DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface TenantTheme {
  slug: string;
  label: string;
  description: string;
  vertical: string;
  primaryColor: string;
}

const TENANT_THEMES: TenantTheme[] = [
  {
    slug: 'rottay',
    label: 'Rottay',
    description: 'The platform default. A balanced, professional palette suited for enterprise admin interfaces.',
    vertical: 'Platform',
    primaryColor: 'var(--ds-color-primary-500)',
  },
  {
    slug: 'bithire',
    label: 'BitHire',
    description: 'A recruiting-focused theme with energetic tones designed for talent acquisition workflows.',
    vertical: 'Recruiting',
    primaryColor: 'var(--ds-color-primary-500)',
  },
  {
    slug: 'evnto',
    label: 'Evnto',
    description: 'An events-oriented theme with vibrant accents for event management and ticketing.',
    vertical: 'Events',
    primaryColor: 'var(--ds-color-primary-500)',
  },
];

function ThemePreviewCard({ theme }: { theme: TenantTheme }) {
  return (
    <DesignSystemProvider tenantSlug={theme.slug}>
      <ThemePreviewContent theme={theme} />
    </DesignSystemProvider>
  );
}

function ThemePreviewContent({ theme }: { theme: TenantTheme }) {
  const tokens = useTokens();

  return (
    <Card style={{ height: '100%' }}>
      <Stack spacing="md">
        {/* Theme header */}
        <Flex align="center" justify="between">
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {theme.label}
            </Text>
            <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{theme.vertical}</Text>
          </Stack>
          <Badge variant="primary">{theme.slug}</Badge>
        </Flex>

        <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
          {theme.description}
        </Text>

        {/* Color palette preview */}
        <Box>
          <Text size="xs" weight="semibold" style={{ color: "var(--ds-color-text-muted)", marginBottom: tokens.spacing[2] }}>
            Primary Scale
          </Text>
          <Flex gap={2}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <Box
                key={shade}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: shade === 50 ? '6px 0 0 6px' : shade === 900 ? '0 6px 6px 0' : 0,
                  background: `var(--ds-color-primary-${shade})`,
                }}
                title={`primary-${shade}`}
              />
            ))}
          </Flex>
        </Box>

        {/* Semantic colors */}
        <Box>
          <Text size="xs" weight="semibold" style={{ color: "var(--ds-color-text-muted)", marginBottom: tokens.spacing[2] }}>
            Semantic Colors
          </Text>
          <Flex gap={6}>
            {[
              { label: 'Success', color: 'var(--ds-color-success-500)' },
              { label: 'Warning', color: 'var(--ds-color-warning-500)' },
              { label: 'Error', color: 'var(--ds-color-error-500)' },
              { label: 'Info', color: 'var(--ds-color-info-500)' },
            ].map((item) => (
              <Flex key={item.label} align="center" gap={6}>
                <Box
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: item.color,
                  }}
                />
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{item.label}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Divider */}
        <Box style={{ height: 1, background: 'var(--ds-color-neutral-200)' }} />

        {/* Sample components */}
        <Stack spacing="md">
          <Text size="sm" weight="semibold" style={{ color: "var(--ds-color-text-secondary)" }}>
            Component Samples
          </Text>

          <Flex gap={8} style={{ flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Action</Button>
            <Button>Default</Button>
          </Flex>

          <Input placeholder="Example input..." />

          <Card style={{ background: 'var(--ds-color-neutral-50)' }}>
            <Flex align="center" justify="between">
              <Stack spacing={1}>
                <Text size="sm" weight="medium">Sample Record</Text>
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>Rendered with tenant theme</Text>
              </Stack>
              <Badge variant="success">Active</Badge>
            </Flex>
          </Card>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function ThemesPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Themes
          </Text>
          <Badge variant="secondary">3 tenants</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Themes are tenant-specific visual configurations. Each tenant can
            customize colors, typography, surfaces, and chrome via BrandTheme or
            legacy tokenOverrides. All token values are expressed as CSS custom
            properties so they can be swapped at runtime without re-rendering.
          </Text>
        </Box>
      </Box>

      {/* Theme gallery */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: tokens.spacing[5],
          alignItems: 'stretch',
        }}
      >
        {TENANT_THEMES.map((theme) => (
          <ThemePreviewCard key={theme.slug} theme={theme} />
        ))}
      </Box>

      {/* Theming architecture */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            Theme Resolution Chain
          </Text>
          <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            Tokens are resolved through a layered merge chain. Each layer can
            override values from the previous one:
          </Text>
          <Stack spacing="xs">
            {[
              { step: '1', label: 'DS base', description: 'Default token values defined in the design system core' },
              { step: '2', label: 'Engine overrides', description: 'borderRadius, shadows, surface, motion differentiated by classic/modern/rustic' },
              { step: '3', label: 'Vertical baseline', description: 'Industry-specific presets (platform, bithire, evnto) with structural + personality overrides' },
              { step: '4', label: 'BrandTheme / tokenOverrides', description: 'Tenant-specific customization (~140 CSS variables) for full white-label control' },
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
                  <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{item.description}</Text>
                </Box>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
