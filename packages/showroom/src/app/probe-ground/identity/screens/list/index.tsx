'use client';

import { useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  PatternDataTable,
  Select,
  Stack,
  Tag,
  Text,
} from '@rottay/design-system';

import type { ColumnDef } from '@rottay/design-system';

interface CandidateRow {
  id: string;
  name: string;
  role: string;
  stage: string;
  tone: 'primary' | 'success' | 'warning' | 'secondary';
  score: string;
  updated: string;
}

const ROWS: CandidateRow[] = [
  { id: 'c1', name: 'Ana Ruiz', role: 'Senior Backend Engineer', stage: 'Onsite', tone: 'primary', score: '8.4', updated: '2h ago' },
  { id: 'c2', name: 'Marcus Bell', role: 'Staff Product Designer', stage: 'Offer prep', tone: 'success', score: '9.1', updated: '5h ago' },
  { id: 'c3', name: 'Lena Fischer', role: 'People Analytics Lead', stage: 'Screen', tone: 'secondary', score: '7.2', updated: 'Yesterday' },
  { id: 'c4', name: 'Tomas Silva', role: 'Senior Backend Engineer', stage: 'Debrief', tone: 'warning', score: '6.8', updated: 'Yesterday' },
  { id: 'c5', name: 'Priya Nair', role: 'Engineering Manager', stage: 'Onsite', tone: 'primary', score: '8.9', updated: '2 days ago' },
  { id: 'c6', name: 'Owen Clarke', role: 'Data Platform Engineer', stage: 'Sourced', tone: 'secondary', score: '—', updated: '3 days ago' },
];

const STAGE_OPTIONS = [
  { label: 'All stages', value: 'all' },
  { label: 'Screen', value: 'screen' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Offer prep', value: 'offer' },
];

const COLUMNS: ColumnDef<CandidateRow>[] = [
  {
    key: 'name',
    header: 'Candidate',
    accessorKey: 'name',
    sortable: true,
    render: (_value, row) => (
      <Flex align="center" gap={10}>
        <Avatar size="sm" name={row.name} />
        <Stack spacing="none">
          <Text size="sm" weight="semibold">
            {row.name}
          </Text>
          <Text size="xs" color="muted">
            {row.role}
          </Text>
        </Stack>
      </Flex>
    ),
  },
  {
    key: 'stage',
    header: 'Stage',
    accessorKey: 'stage',
    render: (_value, row) => <Tag variant={row.tone}>{row.stage}</Tag>,
  },
  { key: 'score', header: 'Scorecard', accessorKey: 'score', sortable: true, align: 'right' },
  { key: 'updated', header: 'Last activity', accessorKey: 'updated' },
];

export function ListScreen() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['c2']);

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
        <Box minWidth={240}>
          <Input placeholder="Search candidates" />
        </Box>
        <Box minWidth={180}>
          <Select options={STAGE_OPTIONS} defaultValue="all" />
        </Box>
        <Button variant="secondary">Filters</Button>
        <Badge variant="secondary">3 saved views</Badge>
      </Flex>

      {/* The pattern table, not the primitive: `data-anatomy-table`
          (ruled | zebra | open) is only read on `.ds-pattern-data-table`. */}
      <PatternDataTable<CandidateRow>
        data={ROWS}
        columns={COLUMNS}
        rowKey="id"
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        hoverable
        pagination={false}
        messages={{ tableLabel: 'Candidates' }}
      />
    </Stack>
  );
}
