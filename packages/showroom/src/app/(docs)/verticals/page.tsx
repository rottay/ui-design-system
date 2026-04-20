'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  SettingsIcon,
  BriefcaseIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';

interface VerticalCard {
  name: string;
  slug: string;
  description: string;
  engine: string;
  theme: string;
  density: string;
  themeColor: string;
  demoCount: number;
  icon: React.ReactNode;
}

const VERTICALS: VerticalCard[] = [
  {
    name: 'Platform',
    slug: 'platform',
    description:
      'Admin control plane for multi-tenant SaaS. Identity management, tenancy, permissions, feature flags, and system configuration.',
    engine: 'classic',
    theme: 'rottay',
    density: 'compact',
    themeColor: 'var(--ds-color-primary-500)',
    demoCount: 7,
    icon: <SettingsIcon size={28} />,
  },
  {
    name: 'BitHire',
    slug: 'bithire',
    description:
      'AI-powered recruiting and talent acquisition. Pipeline management, interviews, AI agents, and hiring analytics.',
    engine: 'modern',
    theme: 'bithire',
    density: 'comfortable',
    themeColor: '#6366f1',
    demoCount: 7,
    icon: <BriefcaseIcon size={28} />,
  },
  {
    name: 'Evnto',
    slug: 'evnto',
    description:
      'Events, nightlife, and venue management. Ticketing, operations, staff coordination, and engagement analytics.',
    engine: 'modern',
    theme: 'evnto',
    density: 'spacious',
    themeColor: '#f43f5e',
    demoCount: 8,
    icon: <SparklesIcon size={28} />,
  },
];

export default function VerticalsPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Verticals
          </Text>
          <Badge variant="primary">{VERTICALS.length} apps</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Vertical demos showcase how the same design system adapts to
            different product domains. Each vertical has its own engine,
            theme, density, and product profile -- proving the DS is
            truly multi-tenant and multi-product.
          </Text>
        </Box>
      </Box>

      {/* Vertical cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: tokens.spacing[6],
        }}
      >
        {VERTICALS.map((v) => (
          <Link
            key={v.slug}
            href={`/verticals/${v.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
              }}
            >
              <Stack spacing="md">
                {/* Icon + badge */}
                <Flex align="center" justify="between">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: tokens.borderRadius.lg,
                      background: v.themeColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {v.icon}
                  </Box>
                  <Badge variant="primary">{v.demoCount} demos</Badge>
                </Flex>

                {/* Name + description */}
                <Box>
                  <Text as={"h2" as any} size="xl" weight="bold">
                    {v.name}
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text
                      size="sm"
                      style={{ color: 'var(--ds-color-text-secondary)' }}
                    >
                      {v.description}
                    </Text>
                  </Box>
                </Box>

                {/* Config tags */}
                <Flex gap={6} style={{ flexWrap: 'wrap' }}>
                  {[
                    { label: 'Engine', value: v.engine },
                    { label: 'Theme', value: v.theme },
                    { label: 'Density', value: v.density },
                  ].map((tag) => (
                    <Flex
                      key={tag.label}
                      align="center"
                      gap={4}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        background: 'var(--ds-color-neutral-100)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Text
                        size="xs"
                        style={{ color: 'var(--ds-color-text-muted)' }}
                      >
                        {tag.label}:
                      </Text>
                      <Text size="xs" weight="semibold">
                        {tag.value}
                      </Text>
                    </Flex>
                  ))}
                </Flex>

                {/* Color swatch */}
                <Flex align="center" gap={8}>
                  <Box
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: v.themeColor,
                      border: '1px solid var(--ds-color-neutral-200)',
                    }}
                  />
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--ds-color-text-muted)',
                      fontFamily: 'var(--font-geist-mono)',
                    }}
                  >
                    {v.themeColor}
                  </Text>
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Explanation card */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            How Verticals Work
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Each vertical wraps its demos in a DesignSystemProvider with the
            appropriate engine, theme, and product profile. This means the same
            DS components render differently per vertical -- just as they would
            in production.
          </Text>
          <Flex gap={tokens.spacing[5]} style={{ flexWrap: 'wrap' }}>
            {[
              {
                label: 'Engine-switched',
                detail: 'Classic vs Modern vs Rustic rendering',
              },
              {
                label: 'Theme-aware',
                detail: 'Each vertical has its own color palette',
              },
              {
                label: 'Density-adaptive',
                detail: 'Compact, comfortable, or spacious spacing',
              },
              {
                label: 'Profile-driven',
                detail: 'Product profiles customize behavior per app',
              },
            ].map((item) => (
              <Box key={item.label} style={{ flex: '1 1 200px' }}>
                <Text size="sm" weight="semibold">
                  {item.label}
                </Text>
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)' }}
                >
                  {item.detail}
                </Text>
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
