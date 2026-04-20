'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  CalendarIcon,
  Building2Icon,
  StarIcon,
  SettingsIcon,
  UsersIcon,
  BarChart3Icon,
  ZapIcon,
  ActivityIcon,
} from '@rottay/design-system/icons';

interface DemoCategory {
  title: string;
  slug: string;
  description: string;
  demoCount: number;
  icon: React.ReactNode;
}

const EVNTO_CATEGORIES: DemoCategory[] = [
  {
    title: 'Event Management',
    slug: 'event-management',
    description: 'Event CRUD, scheduling, recurring events, and multi-day configuration.',
    demoCount: 4,
    icon: <CalendarIcon size={20} />,
  },
  {
    title: 'Venue',
    slug: 'venue',
    description: 'Venue profiles, floor plans, capacity management, and availability calendars.',
    demoCount: 3,
    icon: <Building2Icon size={20} />,
  },
  {
    title: 'Ticketing',
    slug: 'ticketing',
    description: 'Ticket types, pricing tiers, promo codes, and sales dashboard.',
    demoCount: 4,
    icon: <StarIcon size={20} />,
  },
  {
    title: 'Operations',
    slug: 'operations',
    description: 'Day-of operations checklist, vendor coordination, and timeline management.',
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
  },
  {
    title: 'Staff',
    slug: 'staff',
    description: 'Staff scheduling, role assignments, shift management, and check-in tracking.',
    demoCount: 3,
    icon: <UsersIcon size={20} />,
  },
  {
    title: 'Finance',
    slug: 'finance',
    description: 'Revenue tracking, expense management, settlement reports, and payouts.',
    demoCount: 3,
    icon: <BarChart3Icon size={20} />,
  },
  {
    title: 'Engagement',
    slug: 'engagement',
    description: 'Attendee engagement, live polls, social media integration, and feedback.',
    demoCount: 3,
    icon: <ZapIcon size={20} />,
  },
  {
    title: 'Analytics',
    slug: 'analytics',
    description: 'Event performance metrics, attendance trends, and revenue analytics.',
    demoCount: 4,
    icon: <ActivityIcon size={20} />,
  },
];

function EvntoContent() {
  const tokens = useTokens();
  const totalDemos = EVNTO_CATEGORIES.reduce(
    (sum, cat) => sum + cat.demoCount,
    0,
  );

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Evnto
          </Text>
          <Badge variant="primary">{totalDemos} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text
            size="md"
            style={{ color: 'var(--ds-color-text-secondary)' }}
          >
            Events, nightlife, and venue management. These demos render with
            the modern engine, evnto theme, and spacious density -- matching
            the production Evnto experience.
          </Text>
        </Box>
      </Box>

      {/* Config bar */}
      <Flex gap={12} style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'Engine', value: 'modern' },
          { label: 'Theme', value: 'evnto' },
          { label: 'Density', value: 'spacious' },
          { label: 'Vertical', value: 'evnto' },
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
        {EVNTO_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/verticals/evnto/${cat.slug}`}
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

export default function EvntoPage() {
  return (
    <DesignSystemProvider tenantSlug="evnto" forceEngine="modern">
      <EvntoContent />
    </DesignSystemProvider>
  );
}
