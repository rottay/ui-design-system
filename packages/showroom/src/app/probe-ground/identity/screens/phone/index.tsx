'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Stack,
  Tabs,
  Tag,
  Text,
} from '@rottay/design-system';

const ROWS = [
  { name: 'Ana Ruiz', stage: 'Onsite', tone: 'primary' as const, slot: 'Today · 15:30' },
  { name: 'Marcus Bell', stage: 'Offer prep', tone: 'success' as const, slot: 'Today · 17:00' },
  { name: 'Lena Fischer', stage: 'Screen', tone: 'secondary' as const, slot: 'Tomorrow · 09:00' },
];

const TAB_ITEMS = [
  { key: 'today', label: 'Today' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'tasks', label: 'Tasks' },
];

/** 390px is the probe's phone frame, not a value any candidate authors. */
const PHONE_WIDTH = 390;

export function PhoneScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Stack spacing="none">
        <Heading level={2}>Phone posture</Heading>
        <Text size="sm" variant="muted">
          The same surface at {PHONE_WIDTH}px, where the responsive posture decides the ladder.
        </Text>
      </Stack>

      <Box style={{ width: PHONE_WIDTH, maxWidth: '100%' }}>
        <Stack spacing="sm" fullWidth>
          <Flex align="center" justify="between" gap={8}>
            <Heading level={3}>Loops</Heading>
            <Badge variant="primary" size="sm">
              3 today
            </Badge>
          </Flex>
          <Input placeholder="Search" />
          <Tabs items={TAB_ITEMS} defaultActiveKey="today" />
          {ROWS.map((row) => (
            <Card key={row.name}>
              <Flex align="center" justify="between" gap={8}>
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
            </Card>
          ))}
          <Button variant="primary" fullWidth>
            Start debrief
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
