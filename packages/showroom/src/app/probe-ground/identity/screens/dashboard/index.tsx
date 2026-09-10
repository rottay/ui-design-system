'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Layout,
  LineChart,
  Menu,
  Progress,
  Stack,
  Tag,
  Text,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

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

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <Icon name="navigation.home" decorative /> },
  { key: 'candidates', label: 'Candidates', icon: <Icon name="entity.person" decorative /> },
  { key: 'roles', label: 'Roles', icon: <Icon name="content.document" decorative /> },
  { key: 'loops', label: 'Loops', icon: <Icon name="time.schedule" decorative /> },
  { key: 'reports', label: 'Reports', icon: <Icon name="data.chart" decorative /> },
  { key: 'divider', type: 'divider' as const },
  { key: 'settings', label: 'Settings', icon: <Icon name="navigation.settings" decorative /> },
];

export function DashboardScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Stack spacing="none">
        <Heading level="h2">App shell</Heading>
        <Text size="sm" color="muted">
          Sider plus header: the only screen where sidebar tone, the sidebar anatomy
          (panel / rail) and the layout anatomy (flat / floating) have a consumer.
        </Text>
      </Stack>

      <Layout hasSider>
        <Layout.Sider width={232}>
          <Stack spacing="sm" fullWidth>
            <Flex align="center" gap={8}>
              <Avatar size="sm" name="BitHire" />
              <Text size="sm" weight="semibold">
                BitHire
              </Text>
            </Flex>
            <Menu mode="inline" items={NAV_ITEMS} defaultSelectedKeys={['overview']} />
          </Stack>
        </Layout.Sider>

        <Layout>
          <Layout.Header>
            <Flex align="center" justify="between" gap={12} width="100%">
              <Stack spacing="none">
                <Heading level="h3">Hiring overview</Heading>
                <Text size="xs" color="muted">
                  Q2 slate · platform and design pods
                </Text>
              </Stack>
              <Flex align="center" gap={8}>
                <Badge variant="secondary">Q2</Badge>
                <Button variant="secondary">Export</Button>
              </Flex>
            </Flex>
          </Layout.Header>

          <Layout.Content>
            <Stack spacing="md" fullWidth>
              <Flex gap={12} wrap="wrap">
                {METRICS.map((metric) => (
                  <Box key={metric.label} flex="1 1 180px">
                    <Card>
                      <Stack spacing="none">
                        <Text size="xs" color="muted">
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
                <Box height={220}>
                  <LineChart
                    series={[{ name: 'Moved forward', data: MOMENTUM }]}
                    height={200}
                    curved
                    showDots
                    xAxisLabel="Week"
                    yAxisLabel="Candidates advanced"
                  />
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
                          <Text size="xs" color="muted">
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
          </Layout.Content>
        </Layout>
      </Layout>
    </Stack>
  );
}
