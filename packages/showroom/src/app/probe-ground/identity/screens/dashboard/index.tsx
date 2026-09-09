'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  LineChart,
  Progress,
  Stack,
  Tag,
  Text,
} from '@rottay/design-system';

const METRICS = [
  { label: 'Open roles', value: '7', note: '3 close-ready' },
  { label: 'Live loops', value: '24', note: '2 need a panel' },
  { label: 'Median advance', value: '42h', note: '9h faster' },
  { label: 'Offer close rate', value: '81%', note: '+6 pts' },
];

const MOMENTUM = [
  { x: 'W1', y: 12 },
  { x: 'W2', y: 16 },
  { x: 'W3', y: 14 },
  { x: 'W4', y: 19 },
  { x: 'W5', y: 22 },
  { x: 'W6', y: 20 },
  { x: 'W7', y: 24 },
  { x: 'W8', y: 27 },
];

const UPCOMING = [
  { name: 'Ana Ruiz', slot: 'Today · 15:30', stage: 'Onsite', tone: 'primary' as const },
  { name: 'Marcus Bell', slot: 'Today · 17:00', stage: 'Debrief', tone: 'warning' as const },
  { name: 'Priya Nair', slot: 'Tomorrow · 09:00', stage: 'Exec loop', tone: 'secondary' as const },
];

export function DashboardScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Flex align="center" justify="between" gap={12} wrap>
        <Stack spacing="none">
          <Heading level={2}>Hiring overview</Heading>
          <Text size="sm" variant="muted">
            Q2 slate · platform and design pods
          </Text>
        </Stack>
        <Button variant="secondary">Export</Button>
      </Flex>

      <Flex gap={12} wrap>
        {METRICS.map((metric) => (
          <Box key={metric.label} style={{ flex: '1 1 180px' }}>
            <Card>
              <Stack spacing="none">
                <Text size="xs" variant="muted">
                  {metric.label}
                </Text>
                <Text size="2xl" weight="bold">
                  {metric.value}
                </Text>
                <Badge variant="success" size="sm">
                  {metric.note}
                </Badge>
              </Stack>
            </Card>
          </Box>
        ))}
      </Flex>

      <Card title="Candidate momentum">
        <Box style={{ height: 220 }}>
          <LineChart data={MOMENTUM} height={200} />
        </Box>
      </Card>

      <Card title="Next interviews">
        <Stack spacing="sm">
          {UPCOMING.map((row) => (
            <Flex key={row.name} align="center" justify="between" gap={12}>
              <Flex align="center" gap={10}>
                <Avatar size="sm" name={row.name} />
                <Stack spacing="none">
                  <Text size="sm" weight="semibold">
                    {row.name}
                  </Text>
                  <Text size="xs" variant="muted">
                    {row.slot}
                  </Text>
                </Stack>
              </Flex>
              <Tag variant={row.tone}>{row.stage}</Tag>
            </Flex>
          ))}
          <Progress type="line" percent={68} status="normal" />
        </Stack>
      </Card>
    </Stack>
  );
}
