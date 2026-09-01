'use client';

/* Surface probe fixtures for 11 inherited families, authored against each surface's
   own contract type rather than lifted from its thin contract test. */

import type { ReactNode } from 'react';
import {
  ActivitySurface,
  AuthSurface,
  Badge,
  Button,
  CommandCenterSurface,
  EditorSurface,
  EmptyStateSurface,
  Flex,
  Input,
  KanbanSurface,
  MarketingSurface,
  OAuthTransitionScreen,
  PricingSurface,
  SchedulerSurface,
  Stack,
  Text,
  VisualizationSurface,
} from '@rottay/design-system';

// kanban fixtures

interface BoardCardFixture {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
}

interface BoardColumnFixture {
  id: string;
  title: string;
  color?: string;
  items: BoardCardFixture[];
}

const BOARD_COLUMNS: BoardColumnFixture[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#94a3b8',
    items: [
      {
        id: 'card-1',
        title: 'Refresh onboarding checklist copy',
        description: 'Align checklist steps with the new workspace setup flow.',
        priority: 'medium',
        assignee: 'Alex Rivera',
      },
      {
        id: 'card-2',
        title: 'Audit unused API keys',
        description: 'Identify integration keys with no traffic in the last 90 days.',
        priority: 'low',
        assignee: 'Sam Okafor',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#f59e0b',
    items: [
      {
        id: 'card-3',
        title: 'Build export-to-CSV action',
        description: 'Add a CSV export option to the reporting surface.',
        priority: 'high',
        assignee: 'Priya Nair',
      },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    color: '#8b5cf6',
    items: [
      {
        id: 'card-4',
        title: 'Rework empty-state illustration',
        priority: 'medium',
        assignee: 'Alex Rivera',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#22c55e',
    items: [
      { id: 'card-5', title: 'Ship activity log pagination', priority: 'high', assignee: 'Sam Okafor' },
      { id: 'card-6', title: 'Fix timezone drift in scheduler', priority: 'urgent', assignee: 'Priya Nair' },
    ],
  },
];

// scheduler fixtures

interface ScheduleEventFixture {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

// A fixed Mon-Fri week kept in a PAST month: the calendar derives its today-marker
// from the machine clock, so a grid containing the capture day would move daily.
const SCHEDULE_EVENTS: ScheduleEventFixture[] = [
  {
    id: 'evt-1',
    title: 'Weekly planning sync',
    start: new Date('2026-07-13T14:00:00Z'),
    end: new Date('2026-07-13T14:30:00Z'),
  },
  {
    id: 'evt-2',
    title: 'Customer onboarding call',
    start: new Date('2026-07-14T16:00:00Z'),
    end: new Date('2026-07-14T16:45:00Z'),
  },
  {
    id: 'evt-3',
    title: 'Product review',
    start: new Date('2026-07-15T18:00:00Z'),
    end: new Date('2026-07-15T19:00:00Z'),
  },
  {
    id: 'evt-4',
    title: 'Design critique',
    start: new Date('2026-07-16T15:30:00Z'),
    end: new Date('2026-07-16T16:00:00Z'),
  },
  {
    id: 'evt-5',
    title: 'Team offsite',
    start: new Date('2026-07-17T13:00:00Z'),
    end: new Date('2026-07-17T20:00:00Z'),
  },
];

// activity fixtures

interface TimelineEntryFixture {
  id: string;
  user: { name: string };
  action: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  diff?: Record<string, { from: string; to: string }>;
  metadata?: Record<string, string>;
}

const TIMELINE_ENTRIES: TimelineEntryFixture[] = [
  {
    id: 'act-1',
    user: { name: 'Priya Nair' },
    action: 'Updated billing contact',
    timestamp: '2026-07-10T14:32:00Z',
    entityType: 'billing',
    entityId: 'bill-4021',
    diff: { contactEmail: { from: 'ops@example.test', to: 'billing@example.test' } },
  },
  {
    id: 'act-2',
    user: { name: 'Sam Okafor' },
    action: 'Archived record',
    timestamp: '2026-07-10T11:05:00Z',
    entityType: 'record',
    entityId: 'rec-3',
  },
  {
    id: 'act-3',
    user: { name: 'Alex Rivera' },
    action: 'Created integration',
    timestamp: '2026-07-09T16:48:00Z',
    entityType: 'integration',
    entityId: 'int-12',
  },
  {
    id: 'act-4',
    user: { name: 'Priya Nair' },
    action: 'Invited teammate',
    timestamp: '2026-07-09T09:12:00Z',
    entityType: 'team',
    entityId: 'mem-88',
    metadata: { role: 'editor' },
  },
];

// pricing fixtures

interface PricingPlanFixture {
  id: string;
  name: string;
  price: number | string;
  description: string;
  features: Record<string, boolean | string>;
  cta: string;
  popular?: boolean;
  priceNote?: string;
}

const PRICING_PLANS: PricingPlanFixture[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'For small teams getting organized.',
    features: { seats: '5 seats', storage: '20 GB', automation: false, support: 'Email' },
    cta: 'Choose Starter',
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    description: 'For growing teams that need more control.',
    features: { seats: '25 seats', storage: '200 GB', automation: true, support: 'Priority email' },
    cta: 'Choose Team',
    popular: true,
    priceNote: 'per month, billed annually',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with advanced governance needs.',
    features: {
      seats: 'Unlimited seats',
      storage: 'Unlimited storage',
      automation: true,
      support: 'Dedicated manager',
    },
    cta: 'Contact sales',
  },
];

interface PricingFeatureFixture {
  key: string;
  label: string;
  category?: string;
}

const PRICING_FEATURES: PricingFeatureFixture[] = [
  { key: 'seats', label: 'Seats', category: 'Core' },
  { key: 'storage', label: 'Storage', category: 'Core' },
  { key: 'automation', label: 'Workflow automation', category: 'Advanced' },
  { key: 'support', label: 'Support', category: 'Support' },
];

export function ConfigInheritedBSurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'visualization':
      return (
        <VisualizationSurface
          config={{
            visual: { compactChartsOnMobile: true },
            presentation: {
              chrome: { title: 'Revenue analytics', subtitle: 'Performance across regions and channels' },
              intro: (
                <Text color="muted">
                  Track revenue, retention, and channel performance for the current fiscal quarter.
                </Text>
              ),
              aside: (
                <Stack spacing="xs">
                  <Text weight="semibold">Top channel</Text>
                  <Text size="sm" color="muted">
                    Partner referrals drove 34% of new revenue this quarter, up from 28% last quarter.
                  </Text>
                </Stack>
              ),
              footer: (
                <Text size="sm" color="muted">
                  Figures reflect the last 90 days and refresh nightly.
                </Text>
              ),
            },
            behavior: {
              actions: [
                { id: 'export-report', label: 'Export report', variant: 'secondary', onClick: () => undefined },
                { id: 'refresh-data', label: 'Refresh', onClick: () => undefined },
              ],
              stats: [
                { key: 'revenue', label: 'Total revenue', value: '$482,900', change: 12.4, changeType: 'increase' },
                { key: 'customers', label: 'Active customers', value: 2318, change: 3.1, changeType: 'increase' },
                { key: 'churn', label: 'Churn rate', value: 2, suffix: '%', change: 0.4, changeType: 'decrease' },
              ],
              views: [
                {
                  key: 'revenue-trend',
                  label: 'Revenue trend',
                  description: 'Monthly recurring revenue across the last two quarters.',
                  content: (
                    <Stack spacing="xs">
                      <Text size="sm">Q1: $1.24M - Q2: $1.41M</Text>
                      <Text size="sm" color="muted">
                        Growth accelerated in April after the partner program launched.
                      </Text>
                    </Stack>
                  ),
                },
                {
                  key: 'channels',
                  label: 'Channels',
                  description: 'Where new revenue came from this quarter.',
                  content: (
                    <Stack spacing="xs">
                      <Text size="sm">Partner referrals: 34% - Direct sales: 41% - Self-serve: 25%</Text>
                    </Stack>
                  ),
                },
                {
                  key: 'regions',
                  label: 'Regions',
                  description: 'Revenue split by operating region.',
                  content: (
                    <Stack spacing="xs">
                      <Text size="sm">North America: 58% - Europe: 27% - Asia Pacific: 15%</Text>
                    </Stack>
                  ),
                },
              ],
              onViewChange: () => undefined,
            },
          }}
        />
      );
    case 'auth':
      return (
        <AuthSurface
          config={{
            visual: { layout: 'split', heroPosition: 'start' },
            presentation: {
              eyebrow: 'Secure workspace access',
              title: 'Welcome back',
              subtitle: 'Sign in to continue to your workspace.',
              form: (
                <Stack spacing="md">
                  <Stack spacing="xs">
                    <Text as="label" size="sm" weight="medium">
                      Email
                    </Text>
                    <Input type="email" name="email" placeholder="you@company.com" />
                  </Stack>
                  <Stack spacing="xs">
                    <Text as="label" size="sm" weight="medium">
                      Password
                    </Text>
                    <Input type="password" name="password" placeholder="Enter your password" />
                  </Stack>
                  <Button variant="primary" onClick={() => undefined}>
                    Sign in
                  </Button>
                </Stack>
              ),
              hero: (
                <Stack spacing="md">
                  <Text size="lg" weight="semibold">
                    Everything your team needs, in one workspace.
                  </Text>
                  <Text color="secondary">
                    Records, reporting, and team communication stay connected, so nothing falls through the
                    cracks.
                  </Text>
                  <Stack spacing="xs">
                    <Text size="sm">Single sign-on across every workspace</Text>
                    <Text size="sm">Full audit trail on every change</Text>
                    <Text size="sm">Role-based access down to the field level</Text>
                  </Stack>
                </Stack>
              ),
              footer: (
                <Text size="sm" color="muted">
                  No account yet? Contact your workspace admin.
                </Text>
              ),
              legal: (
                <Text size="xs" color="muted">
                  By continuing, you agree to the Terms of Service and Privacy Policy.
                </Text>
              ),
            },
            behavior: {
              actions: [
                { id: 'sso-google', label: 'Continue with Google', onClick: () => undefined },
                { id: 'sso-microsoft', label: 'Continue with Microsoft', onClick: () => undefined },
              ],
            },
          }}
        />
      );
    case 'editor':
      return (
        <EditorSurface
          config={{
            visual: { layout: 'split', previewWidth: 360 },
            presentation: {
              chrome: { title: 'Release notes editor', subtitle: 'Draft v2.4.0 changelog' },
              description: 'Document what changed in this release before publishing to the changelog.',
              toolbar: (
                <Flex gap={8}>
                  <Button size="sm" variant="ghost" onClick={() => undefined}>
                    Bold
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => undefined}>
                    Italic
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => undefined}>
                    Link
                  </Button>
                </Flex>
              ),
              helperText: 'Supports Markdown formatting. Use ## for section headings.',
              statusBar: (
                <Text size="sm" color="muted">
                  Autosaved 2 minutes ago - 482 words
                </Text>
              ),
              preview: (
                <Stack spacing="sm">
                  <Text weight="semibold">Highlights</Text>
                  <Text size="sm">Added multi-region billing support</Text>
                  <Text size="sm">Fixed timezone drift in the scheduler view</Text>
                  <Text size="sm">Improved onboarding checklist copy</Text>
                </Stack>
              ),
            },
            behavior: {
              initialValue:
                '## Highlights\n\n- Added multi-region billing support\n- Fixed timezone drift in the scheduler view\n- Improved onboarding checklist copy\n\n## Known issues\n\n- Dark mode contrast on the pricing table needs another pass',
              saveAction: { id: 'save-draft', label: 'Save draft', variant: 'secondary', onClick: () => undefined },
              publishAction: { id: 'publish-notes', label: 'Publish', variant: 'primary', onClick: () => undefined },
              cancelAction: { id: 'cancel-edit', label: 'Cancel', onClick: () => undefined },
            },
          }}
        />
      );
    case 'empty-state':
      return (
        <EmptyStateSurface
          config={{
            visual: {},
            presentation: {
              chrome: {
                title: 'Reports',
                subtitle: 'Saved and scheduled reports for this workspace',
                back: { label: 'Back to workspace', onClick: () => undefined },
              },
              title: 'No saved reports yet',
              description:
                'Reports you create will appear here. Start from a template or build one from scratch to track the metrics your team cares about.',
              content: (
                <Stack spacing="xs">
                  <Text size="sm" color="muted">
                    Popular starting points
                  </Text>
                  <Text size="sm">Monthly summary - Usage by team - Billing overview</Text>
                </Stack>
              ),
            },
            behavior: {
              primaryAction: { id: 'create-report', label: 'Create report', variant: 'primary', onClick: () => undefined },
              secondaryAction: { id: 'browse-templates', label: 'Browse templates', onClick: () => undefined },
            },
          }}
        />
      );
    case 'marketing':
      return (
        <MarketingSurface
          config={{
            visual: { heroPosition: 'end' },
            presentation: {
              topBar: (
                <Flex justify="between" align="center">
                  <Text weight="bold">Rottay</Text>
                  <Button variant="ghost" size="sm" onClick={() => undefined}>
                    Sign in
                  </Button>
                </Flex>
              ),
              eyebrow: 'Now with automated workflows',
              badge: (
                <Badge variant="secondary" size="sm">
                  New
                </Badge>
              ),
              title: 'Run your entire operation from one workspace.',
              description:
                'Rottay brings records, reporting, and team communication into a single connected workspace, so nothing falls through the cracks.',
              supporting: (
                <Text size="sm" color="muted">
                  Trusted by operations teams at fast-growing companies.
                </Text>
              ),
              hero: (
                <Stack spacing="sm">
                  <Text weight="semibold">This week at a glance</Text>
                  <Flex gap={16} wrap="wrap">
                    <Stack spacing="xs">
                      <Text size="xs" color="muted">
                        Open records
                      </Text>
                      <Text size="lg" weight="bold">
                        128
                      </Text>
                    </Stack>
                    <Stack spacing="xs">
                      <Text size="xs" color="muted">
                        Automations run
                      </Text>
                      <Text size="lg" weight="bold">
                        64
                      </Text>
                    </Stack>
                    <Stack spacing="xs">
                      <Text size="xs" color="muted">
                        Reports sent
                      </Text>
                      <Text size="lg" weight="bold">
                        12
                      </Text>
                    </Stack>
                  </Flex>
                </Stack>
              ),
              sections: [
                <Stack key="unified-records" spacing="xs">
                  <Text weight="semibold">Unified records</Text>
                  <Text size="sm" color="muted">
                    Every record lives in one place, with a full history of who changed what.
                  </Text>
                </Stack>,
                <Stack key="automated-workflows" spacing="xs">
                  <Text weight="semibold">Automated workflows</Text>
                  <Text size="sm" color="muted">
                    Trigger actions from status changes without writing a script.
                  </Text>
                </Stack>,
                <Stack key="real-time-reporting" spacing="xs">
                  <Text weight="semibold">Real-time reporting</Text>
                  <Text size="sm" color="muted">
                    Dashboards update as records change, so reports are never stale.
                  </Text>
                </Stack>,
              ],
              footer: (
                <Flex justify="between" align="center" wrap="wrap" gap={12}>
                  <Text size="sm" color="muted">
                    Ready to get started? Set up your workspace in minutes.
                  </Text>
                  <Button variant="link" size="sm" onClick={() => undefined}>
                    See pricing
                  </Button>
                </Flex>
              ),
            },
            behavior: {
              actions: [
                { id: 'start-trial', label: 'Start free trial', variant: 'primary', onClick: () => undefined },
                { id: 'view-demo', label: 'View demo', variant: 'secondary', onClick: () => undefined },
              ],
            },
          }}
        />
      );
    case 'o-auth-transition':
      return (
        <OAuthTransitionScreen
          appId="evnto"
          appName="Evnto Studio"
          appLabel="Event operations workspace"
          provider="microsoft"
          variantId="signal-line-dark"
          phase="return"
          statusLabel="Reopening Evnto Studio"
          stepLabels={['Microsoft confirmed', 'Workspace session restoring', 'Evnto Studio reopening']}
          activeStep={2}
        />
      );
    case 'pricing':
      return (
        <PricingSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Plans & pricing', subtitle: 'Pick the plan that matches your team size.' },
              intro: 'All plans include unlimited projects, SSO, and a 14-day free trial. Upgrade or downgrade anytime.',
              footer: (
                <Text size="sm" color="muted">
                  Need a custom contract or annual invoicing? Contact our sales team.
                </Text>
              ),
            },
            behavior: {
              plans: PRICING_PLANS,
              features: PRICING_FEATURES,
              currentPlan: 'team',
              onSelectPlan: () => undefined,
              billingCycle: 'monthly',
              onBillingCycleChange: () => undefined,
              currency: 'USD',
              actions: [{ id: 'contact-sales', label: 'Talk to sales', variant: 'secondary', onClick: () => undefined }],
            },
          }}
        />
      );
    case 'activity':
      return (
        <ActivitySurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Activity', subtitle: 'Recent actions across your workspace' } },
            behavior: {
              activities: TIMELINE_ENTRIES,
              filters: {},
              onFilterChange: () => undefined,
              actionTypes: ['created', 'updated', 'archived', 'invited'],
              users: [{ name: 'Priya Nair' }, { name: 'Sam Okafor' }, { name: 'Alex Rivera' }],
              onActivityClick: () => undefined,
              pagination: { current: 1, total: 42, pageSize: 10, onChange: () => undefined },
              actions: [{ id: 'export-log', label: 'Export log', variant: 'secondary', onClick: () => undefined }],
            },
          }}
        />
      );
    case 'kanban':
      return (
        <KanbanSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Project board', subtitle: 'Track work from backlog to done' } },
            behavior: {
              columns: BOARD_COLUMNS,
              onCardMove: () => undefined,
              onCardCreate: () => undefined,
              onCardClick: () => undefined,
              filters: [
                {
                  key: 'assignee',
                  label: 'Assignee',
                  type: 'select',
                  options: [
                    { label: 'Alex Rivera', value: 'alex' },
                    { label: 'Sam Okafor', value: 'sam' },
                    { label: 'Priya Nair', value: 'priya' },
                  ],
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  type: 'select',
                  options: [
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' },
                  ],
                },
              ],
              filterValues: {},
              onFilterChange: () => undefined,
              actions: [{ id: 'board-settings', label: 'Board settings', variant: 'secondary', onClick: () => undefined }],
            },
          }}
        />
      );
    case 'scheduler':
      return (
        <SchedulerSurface
          config={{
            visual: { defaultView: 'week' },
            presentation: {
              chrome: { title: 'Team schedule', subtitle: 'Week of July 13' },
              timeZone: 'UTC',
              sidebar: (
                <Stack spacing="sm">
                  <Text weight="semibold">Upcoming</Text>
                  <Text size="sm" color="muted">
                    5 events scheduled this week, including a team offsite on Friday afternoon.
                  </Text>
                  <Button size="sm" variant="secondary" onClick={() => undefined}>
                    Sync calendar
                  </Button>
                </Stack>
              ),
              footer: (
                <Text size="sm" color="muted">
                  Times are shown in UTC.
                </Text>
              ),
            },
            behavior: {
              events: SCHEDULE_EVENTS,
              currentDate: new Date('2026-07-15T12:00:00Z'),
              onDateChange: () => undefined,
              onViewChange: () => undefined,
              onEventClick: () => undefined,
              onDateClick: () => undefined,
              actions: [{ id: 'new-event', label: 'New event', variant: 'primary', onClick: () => undefined }],
            },
          }}
        />
      );
    case 'command-center':
      return (
        <CommandCenterSurface
          title="Operations Hub"
          greeting="Good morning. Here is the latest across your workspace."
          stats={[
            { key: 'open-tickets', label: 'Open tickets', value: 18, change: { value: 4, direction: 'down' } },
            { key: 'active-projects', label: 'Active projects', value: 7 },
            { key: 'sla-compliance', label: 'SLA compliance (%)', value: 98, change: { value: 1.1, direction: 'up' } },
            { key: 'pending-approvals', label: 'Pending approvals', value: 5, change: { value: 2, direction: 'up' } },
          ]}
          quickActions={[
            {
              key: 'new-project',
              label: 'Create project',
              description: 'Start a new project from a template.',
              onClick: () => undefined,
            },
            {
              key: 'invite-teammate',
              label: 'Invite teammate',
              description: 'Add someone to this workspace.',
              onClick: () => undefined,
            },
            {
              key: 'export-report',
              label: 'Export report',
              description: 'Download a CSV export of recent activity.',
              onClick: () => undefined,
            },
          ]}
          recentActivity={{
            /* Parseable instants only: the feed renders new Date(ts), so prose paints 'Invalid Date'. */
            items: [
              { id: 'ra-1', text: 'Updated the Q3 roadmap', timestamp: '2026-07-10T14:32:00Z', user: { name: 'Priya Nair' } },
              { id: 'ra-2', text: 'Closed 3 support tickets', timestamp: '2026-07-10T11:05:00Z', user: { name: 'Sam Okafor' } },
              { id: 'ra-3', text: 'Invited a new teammate', timestamp: '2026-07-09T16:48:00Z', user: { name: 'Alex Rivera' } },
              { id: 'ra-4', text: 'Automation rule "Escalate SLA breach" triggered', timestamp: '2026-07-09T09:12:00Z' },
            ],
            onViewAll: () => undefined,
          }}
          insights={[
            {
              id: 'ins-1',
              type: 'warning',
              title: '3 approvals are past their SLA',
              description: 'Review the pending approvals queue before end of day.',
              action: { label: 'Review queue', onClick: () => undefined },
            },
            {
              id: 'ins-2',
              type: 'info',
              title: 'New automation templates available',
              description: 'Two new templates were added to the library this week.',
            },
          ]}
          sections={[
            {
              key: 'system-status',
              title: 'System status',
              span: 1,
              render: () => (
                <Stack spacing="xs">
                  <Text size="sm">All systems operational.</Text>
                  <Text size="sm" color="muted">
                    Last incident resolved 12 days ago.
                  </Text>
                </Stack>
              ),
            },
            {
              key: 'top-workflows',
              title: 'Top workflows this week',
              span: 1,
              render: () => (
                <Stack spacing="xs">
                  <Text size="sm">Escalate SLA breach - 41 runs</Text>
                  <Text size="sm">Assign new lead - 27 runs</Text>
                  <Text size="sm">Send weekly digest - 12 runs</Text>
                </Stack>
              ),
            },
          ]}
        />
      );
    default:
      return null;
  }
}

export const CONFIG_INHERITED_B_SLUGS = [
  'visualization',
  'auth',
  'editor',
  'empty-state',
  'marketing',
  'o-auth-transition',
  'pricing',
  'activity',
  'kanban',
  'scheduler',
  'command-center',
];
