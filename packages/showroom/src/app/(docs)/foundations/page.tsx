'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  SparklesIcon,
  LayersIcon,
  SettingsIcon,
} from '@rottay/design-system/icons';

interface FoundationCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const FOUNDATION_CARDS: FoundationCard[] = [
  {
    title: 'Tokens',
    description:
      'Design tokens for colors, spacing, typography, radius, shadows, motion, and glass. The atomic values that power every component.',
    href: '/foundations/tokens',
    icon: <LayersIcon size={24} />,
    badge: '7 categories',
  },
  {
    title: 'Themes',
    description:
      'Tenant-specific theme configurations that customize tokens at runtime. See how Rottay, BitHire, and Evnto each render differently.',
    href: '/foundations/themes',
    icon: <SparklesIcon size={24} />,
    badge: '3 tenants',
  },
  {
    title: 'Engines',
    description:
      'Three rendering engines -- Classic (Ant Design), Modern (Tailwind/DaisyUI), and Rustic (vanilla CSS) -- each with distinct visual identity.',
    href: '/foundations/engines',
    icon: <SettingsIcon size={24} />,
    badge: '3 engines',
  },
  {
    title: 'Icons',
    description:
      'A curated icon catalog of 109 icons wrapped via createIcon() from lucide-react. Token-aware sizing, currentColor inheritance.',
    href: '/foundations/icons',
    icon: <SparklesIcon size={24} />,
    badge: '109 icons',
  },
];

export default function FoundationsPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Text as={"h1" as any} size="2xl" weight="bold">
          Foundations
        </Text>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            The building blocks that power the Rottay Design System. Tokens define the
            visual language, engines determine how components render, themes customize
            the experience per tenant, and icons provide a consistent icon vocabulary.
          </Text>
        </Box>
      </Box>

      {/* Cards grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {FOUNDATION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
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
                <Flex align="center" justify="between">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: tokens.borderRadius.lg,
                      background: 'var(--ds-color-primary-50)',
                      color: 'var(--ds-color-primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                  {card.badge && (
                    <Badge variant="primary">{card.badge}</Badge>
                  )}
                </Flex>
                <Box>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {card.title}
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                      {card.description}
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>
    </Stack>
  );
}
