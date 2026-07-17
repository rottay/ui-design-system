'use client';

import { use } from 'react';
import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';
import {
  VerticalCategoryAppendix,
  type VerticalDemoItem,
} from '../../vertical-category-appendix';

interface CategoryData {
  label: string;
  summary: string;
  operators: string[];
  tempo: string;
  principles: string[];
  demos: VerticalDemoItem[];
}

const EVNTO_DEMOS: Record<string, CategoryData> = {
  'event-management': {
    label: 'Event Management',
    summary:
      'Event management is the planning spine of Evnto. These views define the event, its timing, and the operational shape the rest of the product must support.',
    operators: ['Organizers', 'Producers', 'Ops leads'],
    tempo: 'Planning and pre-event configuration',
    principles: [
      'Keep chronology legible.',
      'Separate setup from live operations.',
      'Support rich configuration without visual clutter.',
    ],
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
    summary:
      'Venue tooling translates physical space into product structure. It needs to show capacity, geometry, and booking reality in a way teams can act on quickly.',
    operators: ['Venue managers', 'Producers', 'Ops coordinators'],
    tempo: 'Spatial planning and resource coordination',
    principles: [
      'Make capacity and conflicts visible.',
      'Treat space as a first-class data model.',
      'Keep floor-plan tooling readable under pressure.',
    ],
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
    summary:
      'Ticketing interfaces are where commercial strategy becomes product UX. They need to feel premium while staying precise enough for pricing and rules.',
    operators: ['Revenue managers', 'Organizers', 'Marketing teams'],
    tempo: 'Commercial configuration and monitoring',
    principles: [
      'Show pricing logic clearly.',
      'Keep promotional rules traceable.',
      'Surface revenue impact next to controls.',
    ],
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
    summary:
      'Operations pages take Evnto from beautiful planning tool to reliable live-event system. They prioritize clarity, checklistability, and team coordination.',
    operators: ['Ops leads', 'Producers', 'Vendor coordinators'],
    tempo: 'Time-sensitive execution',
    principles: [
      'Surface blockers early.',
      'Keep task ownership explicit.',
      'Use timeline context to reduce stress during showtime.',
    ],
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
    summary:
      'Staff tooling aligns people, roles, and shifts across the event lifecycle so on-site execution stays coordinated.',
    operators: ['Staff coordinators', 'Ops leads', 'Supervisors'],
    tempo: 'Scheduling and live verification',
    principles: [
      'Make staffing gaps visible.',
      'Keep role state concise.',
      'Support fast check-in and attendance verification.',
    ],
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
    summary:
      'Finance surfaces reveal event economics after ticketing and operations converge. They need to feel credible, structured, and low-noise.',
    operators: ['Finance managers', 'Organizers', 'Settlement owners'],
    tempo: 'Periodic review and reconciliation',
    principles: [
      'Favor trustworthy breakdowns over decoration.',
      'Clarify gross, fees, and net states.',
      'Make event-to-event comparison easy.',
    ],
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
    summary:
      'Engagement views are where Evnto becomes experiential. They convert audience participation, social energy, and feedback into visible product moments.',
    operators: ['Marketing', 'Hosts', 'Community teams'],
    tempo: 'Live and post-event audience interaction',
    principles: [
      'Keep audience energy visible.',
      'Support moderation and curation.',
      'Make participation loops easy to trigger.',
    ],
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
    summary:
      'Analytics in Evnto pulls together attendance, commercial performance, and engagement so teams can understand what really happened before the next event.',
    operators: ['Leadership', 'Revenue teams', 'Event analysts'],
    tempo: 'Review, optimization, and forecasting',
    principles: [
      'Blend operational and commercial insight.',
      'Keep trend reading simple and obvious.',
      'Support post-event action, not passive reporting.',
    ],
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
  const data = EVNTO_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="lg" fullWidth>
        <Link href="/verticals/evnto" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Evnto</Text>
          </Flex>
        </Link>
        <Card
          style={{
            padding: 'var(--ds-spacing-5, 20px)',
            border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
            background:
              'linear-gradient(180deg, rgba(244, 63, 94, 0.08), transparent 36%), var(--ds-color-bg-container, #ffffff)',
          }}
        >
          <Stack spacing="md">
            <Badge variant="secondary">Unknown category</Badge>
            <Box>
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ display: 'block' }}
              >
                Category not found
              </Text>
              <Text
                size="md"
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                The category &quot;{category}&quot; does not exist in the Evnto vertical.
              </Text>
            </Box>
            <Box
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--ds-border-radius-lg, 16px)',
                background: 'var(--ds-color-bg-secondary, #f1f5f9)',
                border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
              }}
            >
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}>
                Open the parent vertical to pick a supported event lane and inspect the live showcase from there.
              </Text>
            </Box>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <VerticalCategoryAppendix
      backHref="/verticals/evnto"
      backLabel="Back to Evnto"
      label={data.label}
      headline={`${data.label} in Evnto balances premium presentation with live-event clarity.`}
      summary={`${data.summary} These scenarios stay Evnto-specific in workflow and copy, but the live visuals should still come from the active docs runtime instead of a local preset.`}
      operators={data.operators}
      tempo={data.tempo}
      principles={data.principles}
      demos={data.demos}
    />
  );
}

export default function EvntoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return <EvntoCategoryContent category={category} />;
}
