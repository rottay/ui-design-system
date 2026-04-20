'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';

const QUICK_LINKS = [
  { label: 'Primitives', href: '/primitives', description: 'Button, Input, Card, Modal, Tabs, Box, Flex, Stack, and 90+ more leaf components.', badge: '100+' },
  { label: 'Patterns', href: '/patterns', description: 'DataTable, FormBuilder, KanbanBoard, StatsGrid, Charts -- reusable task widgets.', badge: '7 groups' },
  { label: 'Structures', href: '/structures', description: 'CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid -- page chrome.', badge: '5 groups' },
  { label: 'Surfaces', href: '/surfaces', description: 'ListSurface, DashboardSurface, FormSurface, CollectionWorkspace -- full page recipes.', badge: '6 domains' },
  { label: 'Icons', href: '/foundations/icons', description: '109 curated icons via createIcon(). Token-aware sizing, currentColor inheritance.', badge: '109 icons' },
  { label: 'Charts', href: '/patterns/charts', description: '19 D3-backed chart types. Engine-agnostic, token-aware, personality-driven.', badge: '19 types' },
];

const TIER_MODEL = [
  {
    tier: 'Primitives',
    analogy: 'a brick',
    description: 'Engine-switched leaf components. The smallest reusable UI building blocks.',
    examples: 'Button, Input, Card, Modal, Tabs, Badge, Text, Box',
    color: 'var(--ds-color-primary-100)',
    textColor: 'var(--ds-color-primary-700)',
  },
  {
    tier: 'Patterns',
    analogy: 'a reusable machine made of bricks',
    description: 'Task-level compositions that solve generic UI tasks without knowing the page.',
    examples: 'PatternDataTable, PatternFormBuilder, PatternKanbanBoard',
    color: 'var(--ds-color-success-100)',
    textColor: 'var(--ds-color-success-700)',
  },
  {
    tier: 'Structures',
    analogy: 'the frame around the machine on a page',
    description: 'Page-structure families that wrap or accompany patterns to form page chrome.',
    examples: 'CollectionHeader, SearchCommandBar, TableToolbar',
    color: 'var(--ds-color-warning-100)',
    textColor: 'var(--ds-color-warning-700)',
  },
  {
    tier: 'Surfaces',
    analogy: 'the whole room layout',
    description: 'Declarative page-level recipes that compose all three lower tiers into a screen.',
    examples: 'ListSurface, DashboardSurface, FormSurface',
    color: 'var(--ds-color-error-100)',
    textColor: 'var(--ds-color-error-700)',
  },
];

export default function DevelopersPage() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Developers
          </Text>
          <Badge variant="primary">Hub</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Everything you need to integrate the Rottay Design System into your
            application. Install the package, wrap your app with the provider,
            and start using components.
          </Text>
        </Box>
      </Box>

      {/* Getting started */}
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Getting Started
            </Text>
            <Link href="/developers/getting-started" style={{ textDecoration: 'none' }}>
              <Text size="sm" weight="medium" style={{ color: 'var(--ds-color-primary-500)' }}>
                Full guide
              </Text>
            </Link>
          </Flex>

          <CodeBlock
            title="Install"
            language="bash"
            code="pnpm add @rottay/design-system"
          />

          <CodeBlock
            title="Provider setup"
            language="tsx"
            code={`import { DesignSystemProvider } from '@rottay/design-system';

export default function App({ children }) {
  return (
    <DesignSystemProvider
      forceEngine="modern"
      tenantSlug="rottay"
    >
      {children}
    </DesignSystemProvider>
  );
}`}
          />
        </Stack>
      </Card>

      {/* Architecture overview */}
      <Card>
        <Stack spacing="md">
          <Flex align="center" justify="between">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Architecture: 4-Tier Model
            </Text>
            <Link href="/developers/architecture" style={{ textDecoration: 'none' }}>
              <Text size="sm" weight="medium" style={{ color: 'var(--ds-color-primary-500)' }}>
                Deep dive
              </Text>
            </Link>
          </Flex>

          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The design system is organized into four tiers, each with a clear
            responsibility. Code flows upward: surfaces compose structures,
            which compose patterns, which compose primitives.
          </Text>

          {/* Tier diagram */}
          <Stack spacing="xs">
            {TIER_MODEL.map((tier, index) => (
              <Box key={tier.tier}>
                <Flex align="stretch" gap={0}>
                  {/* Level indicator */}
                  <Box
                    style={{
                      width: 4,
                      borderRadius: 2,
                      background: tier.color,
                      flexShrink: 0,
                    }}
                  />
                  <Box
                    style={{
                      flex: 1,
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      background: tier.color,
                      borderRadius: `0 ${tokens.borderRadius.md} ${tokens.borderRadius.md} 0`,
                    }}
                  >
                    <Flex align="center" gap={8}>
                      <Text size="sm" weight="bold" style={{ color: tier.textColor }}>
                        {tier.tier}
                      </Text>
                      <Text size="xs" style={{ color: tier.textColor, opacity: 0.8 }}>
                        = {tier.analogy}
                      </Text>
                    </Flex>
                    <Text size="xs" style={{ color: tier.textColor, marginTop: 4 }}>
                      {tier.description}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        fontFamily: 'var(--ds-font-mono, monospace)',
                        color: tier.textColor,
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {tier.examples}
                    </Text>
                  </Box>
                </Flex>
                {index < TIER_MODEL.length - 1 && (
                  <Flex justify="center" style={{ padding: '2px 0' }}>
                    <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>|</Text>
                  </Flex>
                )}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Card>

      {/* Quick links */}
      <Box>
        <Text as={"h3" as any} size="lg" weight="semibold" style={{ marginBottom: tokens.spacing[4] }}>
          Quick Links
        </Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                }}
              >
                <Stack spacing="sm">
                  <Flex align="center" justify="between">
                    <Text size="sm" weight="semibold">{link.label}</Text>
                    <Badge>{link.badge}</Badge>
                  </Flex>
                  <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                    {link.description}
                  </Text>
                </Stack>
              </Card>
            </Link>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
