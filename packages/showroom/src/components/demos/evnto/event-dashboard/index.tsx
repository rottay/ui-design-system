'use client';

import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  Badge,
  GaugeChart,
  AreaChart,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  CalendarIcon,
  TrendingUpIcon,
  UserCheckIcon,
  StarIcon,
} from '@rottay/design-system/icons';

// ---------------------------------------------------------------------------
// KPI data
// ---------------------------------------------------------------------------

interface KpiItem {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const KPI_DATA: KpiItem[] = [
  {
    label: 'Tickets Sold',
    value: '2,340',
    sub: 'of 3,000',
    icon: <CalendarIcon size={20} />,
    trend: '+12%',
    trendUp: true,
  },
  {
    label: 'Revenue',
    value: '$78.4K',
    sub: 'this event',
    icon: <TrendingUpIcon size={20} />,
    trend: '+8.2%',
    trendUp: true,
  },
  {
    label: 'Check-ins',
    value: '1,890',
    sub: 'of 2,340 sold',
    icon: <UserCheckIcon size={20} />,
    trend: '80.7%',
    trendUp: true,
  },
  {
    label: 'Avg Rating',
    value: '4.7',
    sub: 'out of 5.0',
    icon: <StarIcon size={20} />,
    trend: '+0.3',
    trendUp: true,
  },
];

// ---------------------------------------------------------------------------
// Ticket sales velocity (last 14 days)
// ---------------------------------------------------------------------------

const SALES_VELOCITY = [
  { x: 'Day 1', y: 42 },
  { x: 'Day 2', y: 58 },
  { x: 'Day 3', y: 73 },
  { x: 'Day 4', y: 65 },
  { x: 'Day 5', y: 89 },
  { x: 'Day 6', y: 112 },
  { x: 'Day 7', y: 134 },
  { x: 'Day 8', y: 98 },
  { x: 'Day 9', y: 156 },
  { x: 'Day 10', y: 178 },
  { x: 'Day 11', y: 201 },
  { x: 'Day 12', y: 245 },
  { x: 'Day 13', y: 289 },
  { x: 'Day 14', y: 340 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventDashboardDemo() {
  const tokens = useTokens();
  const [activeKpi, setActiveKpi] = useState<number | null>(null);

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Flex align="center" justify="between">
        <Box>
          <Text as={"h2" as any} size="xl" weight="bold">
            Neon Nights -- Operations Dashboard
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Live event metrics -- Updated 2 min ago
          </Text>
        </Box>
        <Badge variant="success">Live</Badge>
      </Flex>

      {/* KPI cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: tokens.spacing[4],
        }}
      >
        {KPI_DATA.map((kpi, idx) => (
          <Card
            key={kpi.label}
            hoverable
            style={{
              cursor: 'pointer',
              border:
                activeKpi === idx
                  ? '2px solid var(--ds-color-primary)'
                  : '1px solid var(--ds-color-border)',
              transition: 'border-color 150ms ease',
            }}
          >
            <Box
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveKpi(activeKpi === idx ? null : idx)}
            >
              <Stack spacing="sm">
                <Flex align="center" justify="between">
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.borderRadius.md,
                      background: 'var(--ds-color-primary-50)',
                      color: 'var(--ds-color-primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {kpi.icon}
                  </Box>
                  <Badge variant={kpi.trendUp ? 'success' : 'error'}>
                    {kpi.trend}
                  </Badge>
                </Flex>
                <Box>
                  <Text size="2xl" weight="bold">
                    {kpi.value}
                  </Text>
                  <Text
                    size="xs"
                    style={{ color: 'var(--ds-color-text-muted)' }}
                  >
                    {kpi.sub}
                  </Text>
                </Box>
                <Text
                  size="sm"
                  style={{ color: 'var(--ds-color-text-secondary)' }}
                >
                  {kpi.label}
                </Text>
              </Stack>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Charts row */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[5],
        }}
      >
        {/* Gauge -- venue capacity */}
        <Card>
          <Stack spacing="sm">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Venue Capacity
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Current occupancy vs. maximum
            </Text>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <GaugeChart
                value={78}
                min={0}
                max={100}
                label="Capacity"
                formatValue={(v) => `${v}%`}
                segments={[
                  {
                    from: 0,
                    to: 50,
                    color: 'var(--ds-color-success)',
                    label: 'Low',
                  },
                  {
                    from: 50,
                    to: 80,
                    color: 'var(--ds-color-warning)',
                    label: 'Moderate',
                  },
                  {
                    from: 80,
                    to: 100,
                    color: 'var(--ds-color-error)',
                    label: 'High',
                  },
                ]}
                height={220}
                width={320}
              />
            </Box>
          </Stack>
        </Card>

        {/* Area chart -- ticket sales velocity */}
        <Card>
          <Stack spacing="sm">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Ticket Sales Velocity
            </Text>
            <Text
              size="sm"
              style={{ color: 'var(--ds-color-text-secondary)' }}
            >
              Tickets sold per day -- last 14 days
            </Text>
            <AreaChart
              series={[{ name: 'Tickets', data: SALES_VELOCITY }]}
              curved
              height={220}
              xAxisLabel="Day"
              yAxisLabel="Tickets"
            />
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}
