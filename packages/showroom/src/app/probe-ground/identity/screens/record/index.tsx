'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Descriptions,
  Divider,
  Flex,
  Heading,
  Progress,
  Stack,
  Tabs,
  Tag,
  Text,
} from '@rottay/design-system';

const SCORES = [
  { label: 'System design', percent: 84 },
  { label: 'Code quality', percent: 76 },
  { label: 'Collaboration', percent: 91 },
];

const TAB_ITEMS = [
  { key: 'overview', label: 'Overview', children: null },
  { key: 'interviews', label: 'Interviews' },
  { key: 'notes', label: 'Notes' },
  { key: 'offer', label: 'Offer' },
];

export function RecordScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Flex align="center" justify="between" gap={12} wrap>
        <Flex align="center" gap={12}>
          <Avatar size="lg" name="Ana Ruiz" />
          <Stack spacing="none">
            <Heading level={2}>Ana Ruiz</Heading>
            <Flex align="center" gap={8}>
              <Text size="sm" variant="muted">
                Senior Backend Engineer · Madrid
              </Text>
              <Tag variant="primary">Onsite</Tag>
            </Flex>
          </Stack>
        </Flex>
        <Flex align="center" gap={8}>
          <Button variant="ghost">Reject</Button>
          <Button variant="secondary">Schedule</Button>
          <Button variant="primary">Advance to offer</Button>
        </Flex>
      </Flex>

      <Tabs items={TAB_ITEMS} defaultActiveKey="overview" />

      <Descriptions layout="horizontal" title="Application" bordered colon={false}>
        <Descriptions.Item label="Requisition">REQ-2211 · Platform</Descriptions.Item>
        <Descriptions.Item label="Source">Referral · M. Bell</Descriptions.Item>
        <Descriptions.Item label="Recruiter">S. Chen</Descriptions.Item>
        <Descriptions.Item label="Hiring manager">D. Alvarez</Descriptions.Item>
        <Descriptions.Item label="Compensation band">Level 5 · EUR 92k–108k</Descriptions.Item>
        <Descriptions.Item label="Availability">Four weeks notice</Descriptions.Item>
      </Descriptions>

      <Card title="Scorecard">
        <Stack spacing="sm">
          {SCORES.map((score) => (
            <Box key={score.label}>
              <Flex align="center" justify="between">
                <Text size="sm">{score.label}</Text>
                <Badge variant="secondary" size="sm">
                  {score.percent}
                </Badge>
              </Flex>
              <Progress type="line" percent={score.percent} status="normal" />
            </Box>
          ))}
          <Divider />
          <Text size="sm" variant="muted">
            Panel is aligned on the hiring bar; the written debrief is still owed by the
            second interviewer.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
