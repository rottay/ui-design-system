'use client';

import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  DesignSystemProvider,
  StatsHeader,
  BarChart,
  PieChart,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  UsersIcon,
  Building2Icon,
  ZapIcon,
  ActivityIcon,
} from '@rottay/design-system/icons';

import type { StatItem } from '@rottay/design-system';

const STATS: StatItem[] = [
  {
    key: 'total-users',
    label: 'Total Users',
    value: 1247,
    change: 12,
    changeType: 'increase',
    periodLabel: 'vs last month',
    icon: <UsersIcon size={18} />,
    sparkDots: [40, 55, 48, 62, 70, 65, 80],
    accentColor: 'primary',
  },
  {
    key: 'active-tenants',
    label: 'Active Tenants',
    value: 23,
    change: 2,
    changeType: 'increase',
    periodLabel: 'this quarter',
    icon: <Building2Icon size={18} />,
    sparkDots: [20, 21, 21, 22, 22, 23, 23],
    accentColor: 'success',
  },
  {
    key: 'api-calls',
    label: 'API Calls',
    value: '45.2K',
    change: 8,
    changeType: 'increase',
    periodLabel: 'today',
    icon: <ZapIcon size={18} />,
    sparkDots: [30, 45, 60, 55, 70, 80, 75],
    accentColor: 'info',
  },
  {
    key: 'uptime',
    label: 'Uptime',
    value: '99.97%',
    changeType: 'neutral',
    periodLabel: 'last 30 days',
    icon: <ActivityIcon size={18} />,
    sparkDots: [99, 100, 100, 99, 100, 100, 100],
    accentColor: 'success',
  },
];

const SIGNUP_DATA = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 82 },
  { label: 'Mar', value: 91 },
  { label: 'Apr', value: 104 },
  { label: 'May', value: 120 },
  { label: 'Jun', value: 135 },
  { label: 'Jul', value: 148 },
  { label: 'Aug', value: 162 },
  { label: 'Sep', value: 155 },
  { label: 'Oct', value: 178 },
  { label: 'Nov', value: 190 },
  { label: 'Dec', value: 210 },
];

const PLAN_DATA = [
  { label: 'Free', value: 847 },
  { label: 'Pro', value: 312 },
  { label: 'Enterprise', value: 88 },
];

function DashboardContent() {
  const tokens = useTokens();

  return (
    <Stack spacing="lg">
      <Box>
        <Text as={"h2" as any} size="xl" weight="bold">
          Admin Dashboard
        </Text>
        <Box style={{ marginTop: tokens.spacing[1] }}>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Platform operational overview with live metrics
          </Text>
        </Box>
      </Box>

      <StatsHeader stats={STATS} />

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        <Card style={{ padding: tokens.spacing[4] }}>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              User Signups by Month
            </Text>
            <BarChart
              data={SIGNUP_DATA}
              height={280}
              showValues
              orientation="vertical"
              animate
            />
          </Stack>
        </Card>

        <Card style={{ padding: tokens.spacing[4] }}>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Plan Distribution
            </Text>
            <PieChart
              data={PLAN_DATA}
              height={280}
              donut
              showPercentage
              animate
            />
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}

export default function PlatformDashboardDemo() {
  return (
    <DesignSystemProvider tenantSlug="rottay" forceEngine="classic">
      <DashboardContent />
    </DesignSystemProvider>
  );
}
