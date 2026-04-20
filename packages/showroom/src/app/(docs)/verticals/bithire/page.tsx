'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  UsersIcon,
  ActivityIcon,
  SparklesIcon,
  BriefcaseIcon,
  BarChart3Icon,
  SettingsIcon,
  ZapIcon,
} from '@rottay/design-system/icons';

interface DemoCategory {
  title: string;
  slug: string;
  description: string;
  demoCount: number;
  icon: React.ReactNode;
}

const BITHIRE_CATEGORIES: DemoCategory[] = [
  {
    title: 'Pipeline',
    slug: 'pipeline',
    description: 'Candidate pipeline views with kanban boards, stage management, and bulk actions.',
    demoCount: 4,
    icon: <ActivityIcon size={20} />,
  },
  {
    title: 'Interviews',
    slug: 'interviews',
    description: 'Interview scheduling, scorecards, feedback collection, and calendar views.',
    demoCount: 3,
    icon: <UsersIcon size={20} />,
  },
  {
    title: 'AI Agents',
    slug: 'ai-agents',
    description: 'AI-powered sourcing agents, resume screening, and candidate matching.',
    demoCount: 3,
    icon: <SparklesIcon size={20} />,
  },
  {
    title: 'Positions',
    slug: 'positions',
    description: 'Job posting management, requirements editor, and approval workflows.',
    demoCount: 3,
    icon: <BriefcaseIcon size={20} />,
  },
  {
    title: 'Analytics',
    slug: 'analytics',
    description: 'Hiring funnel metrics, time-to-hire, source effectiveness, and diversity stats.',
    demoCount: 4,
    icon: <BarChart3Icon size={20} />,
  },
  {
    title: 'Teams',
    slug: 'teams',
    description: 'Hiring team management, interviewer pools, and workload balancing.',
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
  },
  {
    title: 'Workflows',
    slug: 'workflows',
    description: 'Automated hiring workflows, stage transitions, and notification rules.',
    demoCount: 3,
    icon: <ZapIcon size={20} />,
  },
];

function BitHireContent() {
  const tokens = useTokens();
  const totalDemos = BITHIRE_CATEGORIES.reduce(
    (sum, cat) => sum + cat.demoCount,
    0,
  );

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            BitHire
          </Text>
          <Badge variant="primary">{totalDemos} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text
            size="md"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            AI-powered recruiting and talent acquisition. These demos render
            with the modern engine, bithire theme, and comfortable density --
            matching the production BitHire experience.
          </Text>
        </Box>
      </Box>

      {/* Config bar */}
      <Flex gap={12} style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Engine', value: 'modern' },
          { label: 'Theme', value: 'bithire' },
          { label: 'Density', value: 'comfortable' },
          { label: 'Vertical', value: 'bithire' },
        ].map((tag) => (
          <Flex
            key={tag.label}
            align="center"
            gap={6}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: 'var(--ds-color-neutral-100)',
              border: '1px solid var(--ds-color-neutral-200)',
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

      {/* Category cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {BITHIRE_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/verticals/bithire/${cat.slug}`}
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
                      width: 40,
                      height: 40,
                      borderRadius: tokens.borderRadius.md,
                      background: 'var(--ds-color-primary-50)',
                      color: 'var(--ds-color-primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Badge>{cat.demoCount} demos</Badge>
                </Flex>

                <Box>
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {cat.title}
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[1] }}>
                    <Text
                      size="sm"
                      style={{ color: 'var(--ds-color-text-secondary)' }}
                    >
                      {cat.description}
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

export default function BitHirePage() {
  return (
    <DesignSystemProvider tenantSlug="bithire" forceEngine="modern">
      <BitHireContent />
    </DesignSystemProvider>
  );
}
