'use client';

import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { LineChart, RadarChart } from '@rottay/design-system';
import {
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@rottay/design-system/icons';

interface KPICardData {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const KPI_DATA: KPICardData[] = [
  {
    label: 'Open Positions',
    value: '12',
    change: '+3 this week',
    changeType: 'up',
    icon: <BriefcaseIcon size={20} />,
  },
  {
    label: 'Active Candidates',
    value: '347',
    change: '+28 this week',
    changeType: 'up',
    icon: <UsersIcon size={20} />,
  },
  {
    label: 'Avg Time-to-Hire',
    value: '18 days',
    change: '-2 days vs last month',
    changeType: 'down',
    icon: <ClockIcon size={20} />,
  },
  {
    label: 'Offer Acceptance',
    value: '78%',
    change: '+5% vs last quarter',
    changeType: 'up',
    icon: <CheckCircleIcon size={20} />,
  },
];

const CANDIDATES_PER_MONTH = [
  { x: 'Jan', y: 42 },
  { x: 'Feb', y: 58 },
  { x: 'Mar', y: 65 },
  { x: 'Apr', y: 51 },
  { x: 'May', y: 78 },
  { x: 'Jun', y: 92 },
  { x: 'Jul', y: 87 },
  { x: 'Aug', y: 105 },
  { x: 'Sep', y: 98 },
  { x: 'Oct', y: 112 },
  { x: 'Nov', y: 95 },
  { x: 'Dec', y: 118 },
];

const SKILL_DEMAND_DATA = [
  { axis: 'React', value: 9 },
  { axis: 'Python', value: 7 },
  { axis: 'DevOps', value: 6 },
  { axis: 'Data', value: 8 },
  { axis: 'Mobile', value: 5 },
];

function KPICard({ data }: { data: KPICardData }) {
  return (
    <Card style={{ flex: 1, minWidth: 180 }}>
      <Stack spacing="sm">
        <Flex align="center" justify="between">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--ds-color-primary-50)',
              color: 'var(--ds-color-primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {data.icon}
          </Box>
          <Badge
            variant={data.changeType === 'down' ? 'success' : data.changeType === 'up' ? 'success' : 'default'}
            size="sm"
          >
            {data.change}
          </Badge>
        </Flex>
        <Box>
          <Text size="2xl" weight="bold">
            {data.value}
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            {data.label}
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}

export function RecruiterDashboardDemo() {
  return (
    <Stack spacing="lg">
      {/* KPI Row */}
      <Flex gap={16} style={{ flexWrap: 'wrap' }}>
        {KPI_DATA.map((kpi) => (
          <KPICard key={kpi.label} data={kpi} />
        ))}
      </Flex>

      {/* Charts Row */}
      <Flex gap={16} style={{ flexWrap: 'wrap' }}>
        {/* Line Chart */}
        <Box style={{ flex: 2, minWidth: 320 }}>
          <Card>
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Candidates Per Month
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Total applications received over the past 12 months
                </Text>
              </Box>
              <LineChart
                series={[{ name: 'Candidates', data: CANDIDATES_PER_MONTH }]}
                height={260}
                curved
                showDots
                showArea
                xAxisLabel="Month"
                yAxisLabel="Candidates"
              />
            </Stack>
          </Card>
        </Box>

        {/* Radar Chart */}
        <Box style={{ flex: 1, minWidth: 280 }}>
          <Card>
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Skill Demand
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Most requested skills across open positions
                </Text>
              </Box>
              <RadarChart
                data={SKILL_DEMAND_DATA}
                height={260}
                maxValue={10}
                levels={5}
                showLabels
              />
            </Stack>
          </Card>
        </Box>
      </Flex>
    </Stack>
  );
}

export default RecruiterDashboardDemo;
