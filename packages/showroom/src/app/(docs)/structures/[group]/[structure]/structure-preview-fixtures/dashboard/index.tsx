'use client';

import {
  ActivityCompact,
  Badge,
  Box,
  DataTerminalCard,
  Flex,
  MetricsMinimal,
  Stack,
  StatsHeader,
} from '@rottay/design-system';

import {
  EntityGroupIcon,
  LocationGlobalIcon,
  LocationPlaceIcon,
  IdentityProvisioningIcon,
  SecurityProtectionIcon,
  AnalyticsBarIcon,
  BillingCreditCardIcon,
  OperationsSupportIcon,
} from '../foundation';

const STATS = [
  {
    key: 'tickets',
    label: 'Tickets',
    value: 3248,
    accentColor: 'primary' as const,
    insight: 'Velocity still rising',
    change: 118,
    changeType: 'increase' as const,
    periodLabel: 'vs last week',
    sparkDots: [42, 55, 60, 51, 68, 74, 81],
    icon: <OperationsSupportIcon size={16} />,
  },
  {
    key: 'finance',
    label: 'Revenue',
    value: '$182k',
    accentColor: 'success' as const,
    insight: 'Ahead of forecast',
    changeLabel: '+12.4%',
    changeType: 'increase' as const,
    periodLabel: 'month to date',
    sparkDots: [52, 58, 61, 67, 70, 78, 84],
    icon: <BillingCreditCardIcon size={16} />,
  },
  {
    key: 'coverage',
    label: 'Coverage',
    value: '97%',
    accentColor: 'info' as const,
    insight: 'APAC shift fully staffed',
    changeLabel: '+3 pts',
    changeType: 'increase' as const,
    periodLabel: 'this week',
    sparkDots: [61, 60, 64, 66, 72, 77, 79],
    icon: <LocationGlobalIcon size={16} />,
  },
];

const DASHBOARD_INSIGHT_METRICS = [
  {
    label: 'Seats at risk',
    value: '18',
    change: '-12%',
    positive: true,
    icon: EntityGroupIcon,
  },
  {
    label: 'Weekly invites',
    value: '41',
    change: '+8%',
    positive: true,
    icon: IdentityProvisioningIcon,
  },
  {
    label: 'Queue SLA',
    value: '94%',
    change: '+2%',
    positive: true,
    icon: SecurityProtectionIcon,
  },
  {
    label: 'Coverage gaps',
    value: '6',
    change: '+1',
    positive: false,
    icon: LocationPlaceIcon,
  },
];

const DASHBOARD_ACTIVITY_ITEMS = [
  {
    text: 'Alice escalated three inactive seats for review',
    time: '4m',
    type: 'warning' as const,
  },
  {
    text: 'Revenue sync finished across billing workspaces',
    time: '12m',
    type: 'success' as const,
  },
  {
    text: 'Support imported a new priority coverage list',
    time: '28m',
    type: 'primary' as const,
  },
  {
    text: 'Charlie acknowledged the APAC onboarding queue',
    time: '43m',
    type: 'info' as const,
  },
];

function StatsHeaderPreview() {
  return <StatsHeader stats={STATS} />;
}

function DataTerminalCardPreview() {
  return (
    <Box style={{ maxWidth: 360 }}>
      <DataTerminalCard
        label="Revenue pipeline"
        value="$182k"
        change="+12.5%"
        trend="up"
        icon={AnalyticsBarIcon}
        path="/analytics/revenue"
        progress={74}
        subtitle="target attainment"
        variant={2}
      />
    </Box>
  );
}

function DashboardInsightsFamilyPreview() {
  return (
    <Stack spacing={12}>
      <Flex gap={8} wrap="wrap">
        <Badge variant="secondary" size="sm">
          MetricsMinimal
        </Badge>
        <Badge variant="secondary" size="sm">
          ActivityCompact
        </Badge>
      </Flex>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        <MetricsMinimal metrics={DASHBOARD_INSIGHT_METRICS} />
        <ActivityCompact
          items={DASHBOARD_ACTIVITY_ITEMS}
          viewAllHref="/workspace/activity"
          viewAllLabel="Open feed"
        />
      </Box>
    </Stack>
  );
}

export { StatsHeaderPreview, DataTerminalCardPreview, DashboardInsightsFamilyPreview };
