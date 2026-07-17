'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Flex,
  getKnownTenantConfig,
  Input,
  Stack,
  Text,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  getShowroomVerticalKey,
  type ShowroomTheme,
  useShowroom,
} from '@/composition/components/showroom-context';

interface TenantTheme {
  slug: ShowroomTheme;
  label: string;
  description: string;
  vertical: string;
  mood: string;
}

const TENANT_THEMES: TenantTheme[] = [
  {
    slug: 'rottay',
    label: 'Rottay',
    description:
      'The enterprise default: balanced, credible, and dense enough for admin-heavy workflows.',
    vertical: 'Platform',
    mood: 'Professional and stable',
  },
  {
    slug: 'bithire',
    label: 'BitHire',
    description:
      'Recruiting-first styling with stronger action cues and more energetic primary accents.',
    vertical: 'Recruiting',
    mood: 'Motivated and action-forward',
  },
  {
    slug: 'evnto',
    label: 'Evnto',
    description:
      'Event-oriented styling with bolder contrast and a more atmospheric marketing edge.',
    vertical: 'Events',
    mood: 'Atmospheric and premium',
  },
];

function ThemePreviewCard({ theme }: { theme: TenantTheme }) {
  const { engine } = useShowroom();
  const tenantConfig =
    getKnownTenantConfig(theme.slug) ?? getKnownTenantConfig('rottay');

  if (!tenantConfig) {
    return null;
  }

  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig}
      vertical={getShowroomVerticalKey(theme.slug)}
      forceEngine={engine}
    >
      <ThemePreviewContent theme={theme} />
    </DesignSystemProvider>
  );
}

function ThemePreviewContent({ theme }: { theme: TenantTheme }) {
  const tokens = useTokens();

  return (
    <Card style={{ padding: tokens.spacing[5], height: '100%' }}>
      <Stack spacing="md">
        <Flex align="center" justify="between">
          <Stack spacing={1}>
            <Text as={"h3" as any} size="lg" weight="bold">
              {theme.label}
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {theme.vertical}
            </Text>
          </Stack>
          <Badge variant="primary">{theme.slug}</Badge>
        </Flex>

        <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
          {theme.description}
        </Text>

        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.xl,
            background: 'var(--ds-color-bg-elevated, #f8fafc)',
            border: '1px solid var(--ds-color-border, #e5e7eb)',
          }}
        >
          <Stack spacing="md">
            <Flex gap={2}>
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <Box
                  key={shade}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius:
                      shade === 50
                        ? '6px 0 0 6px'
                        : shade === 900
                          ? '0 6px 6px 0'
                          : 0,
                    background: `var(--ds-color-primary-${shade})`,
                  }}
                />
              ))}
            </Flex>

            <Card style={{ padding: tokens.spacing[4], background: 'var(--ds-color-white)' }}>
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Text size="sm" weight="semibold">
                    Tenant overview
                  </Text>
                  <Badge variant="success">Active</Badge>
                </Flex>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Mood: {theme.mood}
                </Text>
                <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                  <Button variant="primary">Primary action</Button>
                  <Button>Default</Button>
                </Flex>
                <Input placeholder="Search records..." />
              </Stack>
            </Card>
          </Stack>
        </Box>

        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Same API surface, different visual personality through tenant variables.
        </Text>
      </Stack>
    </Card>
  );
}

export function ThemePreviewGrid() {
  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 20,
      }}
    >
      {TENANT_THEMES.map((theme) => (
        <ThemePreviewCard key={theme.slug} theme={theme} />
      ))}
    </Box>
  );
}
