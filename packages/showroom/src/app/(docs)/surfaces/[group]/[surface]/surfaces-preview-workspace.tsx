'use client';

import { useState, type ReactNode } from 'react';
import {
  CommandCenterSurface,
  DecisionInboxSurface,
  RecordWorkbenchSurface,
  CollectionWorkspaceSurface,
  Avatar,
  Badge,
  Box,
  Card,
  Stack,
  Text,
  type CommandStatItem,
  type CommandActivityItem,
  type QuickAction,
  type CommandSection,
  type InsightItem,
  type DecisionAction,
  type ColumnDef,
  type FilterDef,
  type ActiveFilter,
  type CollectionViewMode,
} from '@rottay/design-system';

// --- command-center --------------------------------------------------------

function CommandCenterPreview() {
  const stats: CommandStatItem[] = [
    { key: 'records', label: 'Records', value: 1284, change: { value: 8, direction: 'up' } },
    { key: 'queue', label: 'Open queue', value: 37, change: { value: 4, direction: 'down' } },
    { key: 'reports', label: 'Reports', value: 96, change: { value: 2, direction: 'up' } },
    { key: 'people', label: 'People', value: 24, change: { value: 0, direction: 'flat' } },
  ];
  const quickActions: QuickAction[] = [
    { key: 'new', label: 'New project', description: 'Start a blank workspace', onClick: () => {}, variant: 'primary' },
    { key: 'import', label: 'Import entries', description: 'Upload a CSV of records', onClick: () => {} },
    { key: 'export', label: 'Export report', description: 'Download the weekly summary', onClick: () => {} },
  ];
  const insights: InsightItem[] = [
    { id: 'i1', type: 'warning', title: '3 items need review', description: 'Waiting in your queue since this morning.', action: { label: 'Open queue', onClick: () => {} } },
    { id: 'i2', type: 'success', title: 'All reports synced', description: 'Last sync completed 12 minutes ago.' },
  ];
  const activity: CommandActivityItem[] = [
    { id: 'a1', text: 'updated a record', timestamp: '4m', user: { name: 'Ana' } },
    { id: 'a2', text: 'closed an entry', timestamp: '18m', user: { name: 'Marco' } },
    { id: 'a3', text: 'added a report', timestamp: '32m', user: { name: 'Lena' } },
  ];
  const sections: CommandSection[] = [
    { key: 'throughput', title: 'Throughput', render: () => (
      <Text size="sm" color="muted">Weekly completion is up 8% across all lanes.</Text>
    ) },
    { key: 'decisions', title: 'Recent decisions', render: () => (
      <Text size="sm" color="muted">12 approvals and 3 escalations in the last 24 hours.</Text>
    ) },
  ];

  return (
    <Box style={{ width: '100%' }}>
      <CommandCenterSurface
        title="Operations overview"
        greeting="Good morning, Ana"
        stats={stats}
        quickActions={quickActions}
        insights={insights}
        recentActivity={{ items: activity, onViewAll: () => {} }}
        sections={sections}
      />
    </Box>
  );
}

// --- record-workbench ------------------------------------------------------

function RecordWorkbenchPreview() {
  return (
    <Box style={{ width: '100%' }}>
      <RecordWorkbenchSurface
        title="Northwind project"
        subtitle="Primary workspace record with tabs, actions, and sidebar metadata."
        status={{ label: 'Active', variant: 'success' }}
        avatar={<Avatar size="sm">NP</Avatar>}
        actions={[
          { key: 'edit', label: 'Edit', variant: 'primary', onClick: () => {} },
          { key: 'archive', label: 'Archive', variant: 'secondary', onClick: () => {} },
        ]}
        tabs={[
          { key: 'overview', label: 'Overview', render: () => (
            <Stack spacing="sm">
              <Text size="sm" weight="semibold">Summary</Text>
              <Text size="sm" color="muted">
                This record groups related entries, owners, and recent decisions in one workbench.
              </Text>
            </Stack>
          ) },
          { key: 'activity', label: 'Activity', badge: 12, render: () => (
            <Stack spacing="xs">
              <Text size="sm">Lena updated 3 fields.</Text>
              <Text size="sm">Marco closed an entry.</Text>
            </Stack>
          ) },
          { key: 'files', label: 'Files', badge: 4, render: () => (
            <Text size="sm" color="muted">4 documents attached to this record.</Text>
          ) },
        ]}
        metadata={[
          { key: 'owner', label: 'Owner', value: 'Ana Porter' },
          { key: 'group', label: 'Group', value: <Badge variant="secondary" size="sm">Operations</Badge> },
          { key: 'created', label: 'Created', value: '2026-01-15' },
          { key: 'updated', label: 'Updated', value: '2026-04-18' },
        ]}
        relatedRecords={
          <Card variant="outlined">
            <Card.Body><Text size="sm" weight="medium">Related records</Text></Card.Body>
          </Card>
        }
      />
    </Box>
  );
}

// --- decision-inbox --------------------------------------------------------

interface QueueEntry {
  id: string;
  title: string;
  submittedBy: string;
  priority: 'low' | 'medium' | 'high';
  priorityLabel: string;
  submittedAt: string;
  dueOffsetMin: number;
}

const QUEUE_ENTRIES: QueueEntry[] = [
  { id: 'q-1', title: 'Access request for Atlas', submittedBy: 'Ana Porter', priority: 'high', priorityLabel: 'High', submittedAt: '2026-04-18', dueOffsetMin: 8 },
  { id: 'q-2', title: 'Export approval for weekly report', submittedBy: 'Marco Silva', priority: 'medium', priorityLabel: 'Medium', submittedAt: '2026-04-18', dueOffsetMin: 45 },
  { id: 'q-3', title: 'New workspace provisioning', submittedBy: 'Lena Cole', priority: 'low', priorityLabel: 'Low', submittedAt: '2026-04-17', dueOffsetMin: 180 },
];

const QUEUE_COLUMNS: ColumnDef<QueueEntry>[] = [
  { key: 'title', header: 'Item', accessorKey: 'title',
    render: (_v, row) => <Text size="sm" weight="medium">{row.title}</Text> },
  { key: 'submittedBy', header: 'Submitted by', accessorKey: 'submittedBy' },
  { key: 'priority', header: 'Priority', accessorKey: 'priority',
    render: (_v, row) => (
      <Badge
        variant={row.priority === 'high' ? 'error' : row.priority === 'medium' ? 'warning' : 'secondary'}
        badgeStyle="soft" size="sm"
      >
        {row.priorityLabel}
      </Badge>
    ) },
  { key: 'submittedAt', header: 'Submitted', accessorKey: 'submittedAt' },
];

const QUEUE_DECISIONS: DecisionAction[] = [
  { key: 'approve', label: 'Approve', variant: 'primary' },
  { key: 'reject', label: 'Reject', variant: 'danger', requiresReason: true },
  { key: 'escalate', label: 'Escalate', variant: 'secondary' },
];

function DecisionInboxPreview() {
  return (
    <Box style={{ width: '100%' }}>
      <DecisionInboxSurface<QueueEntry>
        queueName="Review queue"
        subtitle="Approve, reject, or escalate the items waiting on a decision."
        workspace={{
          data: QUEUE_ENTRIES,
          controls: {
            filters: [
              { key: 'priority', label: 'Priority', type: 'select', options: [
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
              ] },
            ],
          },
        }}
        columns={QUEUE_COLUMNS}
        rowKey="id"
        decisions={QUEUE_DECISIONS}
        onDecision={() => {}}
        batchDecisions
        onBatchDecision={() => {}}
        sla={{
          getDeadline: (item) => new Date(Date.now() + item.dueOffsetMin * 60000),
          warningThresholdMinutes: 60,
          criticalThresholdMinutes: 15,
        }}
        reviewRail={{
          width: '360px',
          render: (item) => (
            <Stack spacing="sm">
              <Text size="sm" weight="semibold">{item.title}</Text>
              <Text size="xs" color="muted">Submitted by {item.submittedBy} on {item.submittedAt}</Text>
              <Badge variant="secondary" badgeStyle="soft" size="sm">{item.priorityLabel} priority</Badge>
            </Stack>
          ),
        }}
      />
    </Box>
  );
}

// --- collection-workspace --------------------------------------------------

interface WorkspaceRecord {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'paused' | 'review';
  statusLabel: string;
  items: number;
  updatedAt: string;
}

const WORKSPACE_RECORDS: WorkspaceRecord[] = [
  { id: 'rec-1', name: 'Atlas rollout', owner: 'Ana Porter', status: 'active', statusLabel: 'Active', items: 42, updatedAt: '2026-04-18' },
  { id: 'rec-2', name: 'Beacon migration', owner: 'Marco Silva', status: 'review', statusLabel: 'In review', items: 17, updatedAt: '2026-04-17' },
  { id: 'rec-3', name: 'Cedar cleanup', owner: 'Lena Cole', status: 'paused', statusLabel: 'Paused', items: 9, updatedAt: '2026-04-16' },
  { id: 'rec-4', name: 'Delta audit', owner: 'Omar Reed', status: 'active', statusLabel: 'Active', items: 28, updatedAt: '2026-04-15' },
];

const WORKSPACE_COLUMNS: ColumnDef<WorkspaceRecord>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name', sortable: true,
    render: (_v, row) => <Text size="sm" weight="medium">{row.name}</Text> },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
  { key: 'status', header: 'Status', accessorKey: 'status',
    render: (_v, row) => (
      <Badge
        variant={row.status === 'active' ? 'success' : row.status === 'review' ? 'warning' : 'secondary'}
        badgeStyle="soft" size="sm"
      >
        {row.statusLabel}
      </Badge>
    ) },
  { key: 'items', header: 'Items', accessorKey: 'items', align: 'right' },
  { key: 'updatedAt', header: 'Updated', accessorKey: 'updatedAt' },
];

const WORKSPACE_FILTERS: FilterDef[] = [
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }, { label: 'In review', value: 'review' } ] },
  { key: 'owner', label: 'Owner', type: 'select', options: [
    { label: 'Ana Porter', value: 'ana' }, { label: 'Marco Silva', value: 'marco' } ] },
];

function CollectionWorkspacePreview() {
  const [viewMode, setViewMode] = useState<CollectionViewMode>('table');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { key: 'status', label: 'Status', value: 'active', displayValue: 'Active', field: 'status' },
    { key: 'owner', label: 'Owner', value: 'ana', displayValue: 'Ana Porter', field: 'owner' },
  ]);

  return (
    <Box style={{ width: '100%' }}>
      <CollectionWorkspaceSurface<WorkspaceRecord>
        title="Records workspace"
        subtitle="Track owners, status, and volume across every entry in one operable collection."
        data={WORKSPACE_RECORDS}
        columns={WORKSPACE_COLUMNS}
        rowKey="id"
        header={{
          eyebrow: 'Workspace',
          title: 'Records workspace',
          subtitle: 'Multi-mode collection with search, scopes, filters, and selection.',
          metaItems: [
            { key: 'total', label: '124 records', tone: 'primary' },
            { key: 'flagged', label: '19 flagged', tone: 'success' },
          ],
          quickActions: [
            { key: 'new', label: 'New record', onClick: () => {}, variant: 'primary' },
            { key: 'import', label: 'Import', onClick: () => {}, variant: 'secondary' },
          ],
        }}
        controls={{
          search: { enabled: true, placeholder: 'Search records' },
          viewMode: { enabled: true, modes: ['table', 'cards'], value: viewMode, onChange: setViewMode },
          scopes: {
            enabled: true,
            activeScope: 'all',
            scopes: [
              { key: 'all', label: 'All records', count: 124 },
              { key: 'priority', label: 'Priority', count: 19 },
              { key: 'shared', label: 'Shared', count: 42 },
              { key: 'archived', label: 'Archived', count: 8 },
            ],
          },
          filters: WORKSPACE_FILTERS,
          density: { enabled: true, value: 'comfortable' },
          export: { enabled: true, formats: ['csv', 'json'] },
        }}
        behavior={{
          selection: { enabled: true },
          sorting: { key: 'name', direction: 'asc' },
          pagination: { current: 1, pageSize: 10, total: WORKSPACE_RECORDS.length, onChange: () => {} },
          smartSelection: [
            { key: 'visible', label: 'Select visible', onClick: () => {} },
            { key: 'clear', label: 'Clear', onClick: () => {} },
          ],
        }}
        activeFilters={{
          filters: activeFilters,
          onRemove: (key) => setActiveFilters((f) => f.filter((x) => x.key !== key)),
          onClearAll: () => setActiveFilters([]),
        }}
        viewModes={{
          cards: {
            renderCard: (record: WorkspaceRecord) => (
              <Card variant="outlined" style={{ boxShadow: 'none' }}>
                <Card.Body>
                  <Stack spacing="xs">
                    <Text size="sm" weight="semibold">{record.name}</Text>
                    <Text size="xs" color="muted">{record.owner} · {record.items} items</Text>
                    <Badge
                      variant={record.status === 'active' ? 'success' : record.status === 'review' ? 'warning' : 'secondary'}
                      badgeStyle="soft" size="sm"
                    >
                      {record.statusLabel}
                    </Badge>
                  </Stack>
                </Card.Body>
              </Card>
            ),
          },
        }}
        presentation={{ bordered: true, hoverable: true }}
      />
    </Box>
  );
}

export const WORKSPACE_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  'collection-workspace': <CollectionWorkspacePreview />,
  'command-center': <CommandCenterPreview />,
  'decision-inbox': <DecisionInboxPreview />,
  'record-workbench': <RecordWorkbenchPreview />,
};
