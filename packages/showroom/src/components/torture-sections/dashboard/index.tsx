'use client';

import type { CSSProperties } from 'react';
import {
  ActivityCards,
  ActivityCompact,
  ActivityTicker,
  ActivityTimeline,
  Box,
  DataTerminalCard,
  DataTerminalStat,
  MetricsCards,
  MetricsChart,
  MetricsMinimal,
  MetricsRows,
  Stack,
  StatsHeader,
  Text,
} from '@rottay/design-system';
import type { ActivityItem, KeyMetric, StatItem } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// `KeyMetric.icon` and `DataTerminalCard.icon` are `ComponentType` slots whose
// owners render the icon without an accessibility prop, so the governed
// semantic role is bound here and the slot receives a component.
interface MetricIconProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly 'data-part'?: string;
}

function MetricKpiIcon(props: MetricIconProps) {
  return <Icon name="analytics.kpi" decorative {...props} />;
}

const DASH_ACTIVITY: ActivityItem[] = [
  { text: 'Deployed release v2.4', time: '2m', type: 'success' },
  { text: 'New candidate applied', time: '5m', type: 'primary' },
  { text: 'Weekly report generated', time: '12m', type: 'info' },
  { text: 'Storage quota near limit', time: '30m', type: 'warning' },
  { text: 'Sync job failed', time: '1h', type: 'error' },
];

const DASH_METRICS: KeyMetric[] = [
  {
    label: 'Open roles',
    value: '42',
    change: '+3',
    positive: true,
    icon: MetricKpiIcon,
    trend: 'up',
    progress: 80,
  },
  {
    label: 'Time to hire',
    value: '18d',
    change: '-2',
    positive: false,
    icon: MetricKpiIcon,
    trend: 'down',
    progress: 40,
  },
  {
    label: 'Offers out',
    value: '12',
    change: '+5',
    positive: true,
    icon: MetricKpiIcon,
    trend: 'up',
    progress: 65,
  },
  {
    label: 'Declines',
    value: '4',
    change: '-1',
    positive: false,
    icon: MetricKpiIcon,
    trend: 'down',
    progress: 20,
  },
];

const DASH_STATS: StatItem[] = [
  {
    key: 'rev',
    label: 'Revenue',
    value: 128400,
    change: 8,
    changeType: 'increase',
    periodLabel: 'this week',
    prefix: '$',
    icon: <Icon name="analytics.kpi" decorative />,
    insight: 'Ahead of plan',
    sparkDots: [30, 45, 60, 40, 80, 70, 95],
    accentColor: 'primary',
  },
  {
    key: 'churn',
    label: 'Churn',
    value: 12,
    change: 2,
    changeType: 'decrease',
    periodLabel: 'this week',
    suffix: '%',
    icon: <Icon name="analytics.kpi" decorative />,
    insight: 'Watch closely',
    sparkDots: [20, 25, 30, 22, 40, 35, 50],
    accentColor: 'error',
  },
  {
    key: 'nps',
    label: 'NPS',
    value: 52,
    change: 0,
    changeType: 'neutral',
    periodLabel: 'this week',
    icon: <Icon name="analytics.kpi" decorative />,
    accentColor: 'success',
  },
  {
    key: 'load',
    label: 'Load',
    value: 60,
    suffix: '%',
    progress: 60,
    icon: <Icon name="analytics.kpi" decorative />,
    accentColor: 'warning',
  },
];

// WO-SKIN-06 CK-A -- dashboard-widgets family. Every ActivityItem type (all 5)
// renders in each activity variant; both metric.positive branches render; the
// four DataTerminalCard variant bodies are pinned via the `variant` prop (the
// only door to the private CommandCard/HUDCard/CircuitCard/MatrixCard) with
// progress spanning the three getProgressColor bands and both trends;
// DataTerminalStat and StatsHeader (all three changeType values + sparkline +
// a progress-only card) round it out.
export function DashboardWidgetsStates() {
  return (
    <Stack spacing="md" data-testid="probe-dashboard">
      <Text size="xs" color="secondary">
        Dashboard widgets — CK-A (activity ×4, metrics ×4, data-terminal ×4 variants + stat, stats-header)
      </Text>

      <Box
        data-testid="probe-dashboard-activity"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        <Box data-testid="probe-dashboard-activity-ticker">
          <ActivityTicker items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-timeline">
          <ActivityTimeline items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-compact">
          <ActivityCompact items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-cards">
          <ActivityCards items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
      </Box>

      <Box
        data-testid="probe-dashboard-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        <Box data-testid="probe-dashboard-metrics-minimal">
          <MetricsMinimal metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-cards">
          <MetricsCards metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-chart">
          <MetricsChart metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-rows">
          <MetricsRows metrics={DASH_METRICS} />
        </Box>
      </Box>

      <Box
        data-testid="probe-dashboard-terminal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        <Box data-testid="probe-dashboard-terminal-1">
          <DataTerminalCard
            variant={1}
            label="Tickets"
            value={1234}
            change="+12%"
            trend="up"
            progress={85}
            path="#"
            subtitle="This week"
            icon={MetricKpiIcon}
            hideOnFocus={false}
          />
        </Box>
        <Box data-testid="probe-dashboard-terminal-2">
          <DataTerminalCard
            variant={2}
            label="Revenue"
            value={982}
            change="-4%"
            trend="down"
            progress={60}
            path="#"
            subtitle="This week"
            icon={MetricKpiIcon}
            hideOnFocus={false}
          />
        </Box>
        <Box data-testid="probe-dashboard-terminal-3">
          <DataTerminalCard
            variant={3}
            label="Signups"
            value={451}
            change="+8%"
            trend="up"
            progress={30}
            path="#"
            subtitle="This week"
            icon={MetricKpiIcon}
            hideOnFocus={false}
          />
        </Box>
        <Box data-testid="probe-dashboard-terminal-4">
          <DataTerminalCard
            variant={4}
            label="Latency"
            value={73}
            change="-2%"
            trend="down"
            progress={90}
            path="#"
            subtitle="This week"
            icon={MetricKpiIcon}
            hideOnFocus={false}
          />
        </Box>
        <Box data-testid="probe-dashboard-terminal-stat">
          <DataTerminalStat label="Errors" value={12} change="+1" trend="up" progress={50} icon={MetricKpiIcon} />
        </Box>
      </Box>

      <Box data-testid="probe-dashboard-stats">
        <StatsHeader stats={DASH_STATS} />
      </Box>
    </Stack>
  );
}
