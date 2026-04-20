'use client';

import { use } from 'react';
import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';

interface DemoItem {
  title: string;
  description: string;
  components: string[];
}

const EVNTO_DEMOS: Record<string, { label: string; demos: DemoItem[] }> = {
  'event-management': {
    label: 'Event Management',
    demos: [
      {
        title: 'Event List',
        description: 'Event directory with calendar and list views, status filters, and quick creation.',
        components: ['PatternDataTable', 'CollectionHeader', 'Badge', 'Calendar', 'Button'],
      },
      {
        title: 'Event Editor',
        description: 'Full event creation form with date/time pickers, venue selector, and media upload.',
        components: ['FormBuilder', 'DatePicker', 'TimePicker', 'Upload', 'Select'],
      },
      {
        title: 'Recurring Events',
        description: 'Recurrence pattern builder with weekly, monthly, and custom repeat schedules.',
        components: ['FormBuilder', 'Select', 'DatePicker', 'Checkbox', 'Card'],
      },
      {
        title: 'Event Timeline',
        description: 'Day-of schedule with draggable time blocks, speaker assignments, and break periods.',
        components: ['Timeline', 'Card', 'Avatar', 'Badge', 'Button'],
      },
    ],
  },
  venue: {
    label: 'Venue',
    demos: [
      {
        title: 'Venue Directory',
        description: 'Venue catalog with photo galleries, capacity info, and amenity tags.',
        components: ['PatternDataTable', 'Card', 'Image', 'Tag', 'Statistic'],
      },
      {
        title: 'Floor Plan Editor',
        description: 'Interactive floor plan with section drawing, seat numbering, and capacity zones.',
        components: ['Card', 'Button', 'Input', 'Select', 'Badge'],
      },
      {
        title: 'Availability Calendar',
        description: 'Venue booking calendar with conflict detection and hold/confirm states.',
        components: ['Calendar', 'Badge', 'Tooltip', 'Card', 'Button'],
      },
    ],
  },
  ticketing: {
    label: 'Ticketing',
    demos: [
      {
        title: 'Ticket Types',
        description: 'Ticket tier management with pricing, quantity limits, and early-bird schedules.',
        components: ['PatternDataTable', 'Card', 'Input', 'DatePicker', 'Badge'],
      },
      {
        title: 'Pricing Builder',
        description: 'Dynamic pricing configuration with time-based tiers and bundle options.',
        components: ['FormBuilder', 'Input', 'Select', 'Switch', 'Card'],
      },
      {
        title: 'Promo Codes',
        description: 'Discount code management with usage limits, validity periods, and tracking.',
        components: ['PatternDataTable', 'Input', 'DatePicker', 'Badge', 'Statistic'],
      },
      {
        title: 'Sales Dashboard',
        description: 'Real-time ticket sales metrics with revenue projections and channel breakdown.',
        components: ['StatsHeader', 'LineChart', 'PieChart', 'Card', 'Statistic'],
      },
    ],
  },
  operations: {
    label: 'Operations',
    demos: [
      {
        title: 'Ops Checklist',
        description: 'Day-of operations checklist with assignment, status tracking, and dependencies.',
        components: ['Table', 'Checkbox', 'Avatar', 'Badge', 'Progress'],
      },
      {
        title: 'Vendor Coordination',
        description: 'Vendor roster with contracts, delivery schedules, and communication log.',
        components: ['PatternDataTable', 'Card', 'Badge', 'Timeline', 'Button'],
      },
      {
        title: 'Run of Show',
        description: 'Minute-by-minute event timeline with cue sheets and crew assignments.',
        components: ['Timeline', 'Card', 'Badge', 'Avatar', 'Text'],
      },
    ],
  },
  staff: {
    label: 'Staff',
    demos: [
      {
        title: 'Staff Roster',
        description: 'Event staff directory with role badges, contact info, and availability status.',
        components: ['PatternDataTable', 'Avatar', 'Badge', 'Tag', 'Button'],
      },
      {
        title: 'Shift Manager',
        description: 'Shift scheduling grid with drag-and-drop assignment and overtime tracking.',
        components: ['Table', 'Card', 'Badge', 'Avatar', 'Tooltip'],
      },
      {
        title: 'Check-In Tracker',
        description: 'Real-time staff check-in/check-out with GPS validation and time logging.',
        components: ['Table', 'Badge', 'Statistic', 'Progress', 'Text'],
      },
    ],
  },
  finance: {
    label: 'Finance',
    demos: [
      {
        title: 'Revenue Dashboard',
        description: 'Revenue breakdown by event, ticket type, and time period with comparisons.',
        components: ['StatsHeader', 'BarChart', 'LineChart', 'Card', 'Statistic'],
      },
      {
        title: 'Expense Tracker',
        description: 'Expense categories, vendor invoices, and budget vs actual comparison.',
        components: ['PatternDataTable', 'Card', 'Progress', 'Badge', 'Statistic'],
      },
      {
        title: 'Settlement Report',
        description: 'Post-event settlement with ticket revenue, fees, refunds, and net payout.',
        components: ['Table', 'Statistic', 'Divider', 'Card', 'Button'],
      },
    ],
  },
  engagement: {
    label: 'Engagement',
    demos: [
      {
        title: 'Live Polls',
        description: 'Real-time audience polling with live results, emoji reactions, and word clouds.',
        components: ['Card', 'BarChart', 'Progress', 'Button', 'Badge'],
      },
      {
        title: 'Social Wall',
        description: 'Social media feed aggregator with moderation, pinning, and display screen mode.',
        components: ['Card', 'Image', 'Avatar', 'Badge', 'Button'],
      },
      {
        title: 'Feedback Forms',
        description: 'Post-event satisfaction surveys with NPS scoring and comment analysis.',
        components: ['FormBuilder', 'Rate', 'Textarea', 'Statistic', 'Card'],
      },
    ],
  },
  analytics: {
    label: 'Analytics',
    demos: [
      {
        title: 'Attendance Dashboard',
        description: 'Check-in rate tracking with peak-hour heatmaps and no-show analysis.',
        components: ['StatsHeader', 'LineChart', 'HeatMap', 'Card', 'Statistic'],
      },
      {
        title: 'Revenue Analytics',
        description: 'Revenue trends with forecasting, seasonal patterns, and growth metrics.',
        components: ['LineChart', 'BarChart', 'Statistic', 'Card', 'Badge'],
      },
      {
        title: 'Engagement Metrics',
        description: 'Attendee engagement scores, session popularity, and interaction heatmaps.',
        components: ['RadarChart', 'BarChart', 'Card', 'Progress', 'Statistic'],
      },
      {
        title: 'Marketing ROI',
        description: 'Channel attribution, conversion funnels, and campaign performance comparison.',
        components: ['FunnelChart', 'Table', 'Statistic', 'PieChart', 'Card'],
      },
    ],
  },
};

function EvntoCategoryContent({ category }: { category: string }) {
  const tokens = useTokens();
  const data = EVNTO_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="md">
        <Link href="/verticals/evnto" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Evnto</Text>
          </Flex>
        </Link>
        <Text as={"h1" as any} size="2xl" weight="bold">
          Category not found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          The category &quot;{category}&quot; does not exist in the Evnto vertical.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Back link + header */}
      <Box>
        <Link href="/verticals/evnto" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Evnto</Text>
          </Flex>
        </Link>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {data.label}
          </Text>
          <Badge variant="primary">{data.demos.length} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Evnto {data.label.toLowerCase()} demos rendered with the modern
            engine and evnto theme.
          </Text>
        </Box>
      </Box>

      {/* Demo cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {data.demos.map((demo) => (
          <Card
            key={demo.title}
            style={{ height: '100%' }}
          >
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  {demo.title}
                </Text>
                <Box style={{ marginTop: tokens.spacing[1] }}>
                  <Text
                    size="sm"
                    style={{ color: 'var(--ds-color-text-secondary)' }}
                  >
                    {demo.description}
                  </Text>
                </Box>
              </Box>

              {/* Placeholder preview */}
              <Box
                style={{
                  height: 120,
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px dashed var(--ds-color-neutral-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)' }}
                >
                  Demo preview placeholder
                </Text>
              </Box>

              {/* Component tags */}
              <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                {demo.components.map((name) => (
                  <Box
                    key={name}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--ds-color-neutral-100)',
                      fontSize: '0.75rem',
                      color: 'var(--ds-color-text-secondary)',
                      fontFamily: 'var(--font-geist-mono)',
                    }}
                  >
                    {name}
                  </Box>
                ))}
              </Flex>
            </Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export default function EvntoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return (
    <DesignSystemProvider tenantSlug="evnto" forceEngine="modern">
      <EvntoCategoryContent category={category} />
    </DesignSystemProvider>
  );
}
