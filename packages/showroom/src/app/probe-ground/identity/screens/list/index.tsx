'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tag,
  Text,
} from '@rottay/design-system';

interface CandidateRow {
  key: string;
  name: string;
  role: string;
  stage: string;
  tone: 'primary' | 'success' | 'warning' | 'secondary';
  score: string;
  updated: string;
}

const ROWS: CandidateRow[] = [
  { key: 'c1', name: 'Ana Ruiz', role: 'Senior Backend Engineer', stage: 'Onsite', tone: 'primary', score: '8.4', updated: '2h ago' },
  { key: 'c2', name: 'Marcus Bell', role: 'Staff Product Designer', stage: 'Offer prep', tone: 'success', score: '9.1', updated: '5h ago' },
  { key: 'c3', name: 'Lena Fischer', role: 'People Analytics Lead', stage: 'Screen', tone: 'secondary', score: '7.2', updated: 'Yesterday' },
  { key: 'c4', name: 'Tomas Silva', role: 'Senior Backend Engineer', stage: 'Debrief', tone: 'warning', score: '6.8', updated: 'Yesterday' },
  { key: 'c5', name: 'Priya Nair', role: 'Engineering Manager', stage: 'Onsite', tone: 'primary', score: '8.9', updated: '2 days ago' },
  { key: 'c6', name: 'Owen Clarke', role: 'Data Platform Engineer', stage: 'Sourced', tone: 'secondary', score: '—', updated: '3 days ago' },
];

const STAGE_OPTIONS = [
  { label: 'All stages', value: 'all' },
  { label: 'Screen', value: 'screen' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Offer prep', value: 'offer' },
];

const COLUMNS = [
  {
    key: 'name',
    title: 'Candidate',
    dataIndex: 'name',
    sorter: true,
    render: (_value: unknown, record: CandidateRow) => (
      <Flex align="center" gap={10}>
        <Avatar size="sm" name={record.name} />
        <Stack spacing="none">
          <Text size="sm" weight="semibold">
            {record.name}
          </Text>
          <Text size="xs" color="muted">
            {record.role}
          </Text>
        </Stack>
      </Flex>
    ),
  },
  {
    key: 'stage',
    title: 'Stage',
    dataIndex: 'stage',
    render: (_value: unknown, record: CandidateRow) => (
      <Tag variant={record.tone}>{record.stage}</Tag>
    ),
  },
  { key: 'score', title: 'Scorecard', dataIndex: 'score', sorter: true },
  { key: 'updated', title: 'Last activity', dataIndex: 'updated' },
];

export function ListScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Flex align="center" justify="between" gap={12} wrap="wrap">
        <Stack spacing="none">
          <Heading level="h2">Candidates</Heading>
          <Text size="sm" color="muted">
            48 active across 7 open roles
          </Text>
        </Stack>
        <Flex align="center" gap={8}>
          <Button variant="ghost">Import</Button>
          <Button variant="primary">New candidate</Button>
        </Flex>
      </Flex>

      <Flex align="center" gap={8} wrap="wrap">
        <Input placeholder="Search candidates" style={{ minWidth: 240 }} />
        <Select options={STAGE_OPTIONS} defaultValue="all" style={{ minWidth: 180 }} />
        <Button variant="secondary">Filters</Button>
        <Badge variant="secondary">3 saved views</Badge>
      </Flex>

      <Box>
        <Table
          rowKey="key"
          bordered
          pagination={false}
          dataSource={ROWS}
          columns={COLUMNS}
          rowSelection={{ type: 'checkbox', defaultSelectedRowKeys: ['c2'] }}
        />
      </Box>
    </Stack>
  );
}
