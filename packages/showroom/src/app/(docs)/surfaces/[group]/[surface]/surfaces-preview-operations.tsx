'use client';

import { useState, type ReactNode } from 'react';
import {
  ActivitySurface,
  KanbanSurface,
  OperationalSurface,
  SchedulerSurface,
  Box,
  Stack,
  Text,
  type ActivitySurfaceConfig,
  type KanbanSurfaceConfig,
  type OperationalSurfaceConfig,
  type SchedulerSurfaceConfig,
} from '@rottay/design-system';
import { noop } from './surfaces-preview-shared';

// --- activity --------------------------------------------------------------

function ActivitySurfacePreview() {
  const config: ActivitySurfaceConfig = {
    visual: { maxWidth: 880 },
    presentation: {
      chrome: {
        title: 'Activity',
        subtitle: 'Recent changes across your workspaces',
        breadcrumbs: [{ label: 'Workspaces', href: '#' }, { label: 'Activity' }],
      },
    },
    behavior: {
      activities: [
        { id: 'act-1', user: { name: 'Ana Reyes' }, action: 'published a report',
          timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(), entityType: 'report', entityId: 'rpt-4821' },
        { id: 'act-2', user: { name: 'Marco Lin' }, action: 'updated a record',
          timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), entityType: 'record', entityId: 'rec-1180' },
        { id: 'act-3', user: { name: 'Jules Park' }, action: 'archived a document',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), entityType: 'document', entityId: 'doc-77' },
      ],
      pagination: { current: 1, pageSize: 20, total: 128, onChange: noop },
      actions: [{ id: 'export', label: 'Export', variant: 'secondary', onClick: noop }],
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <ActivitySurface config={config} />
    </Box>
  );
}

// --- kanban ----------------------------------------------------------------

function KanbanSurfacePreview() {
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({ priority: 'all' });

  const config: KanbanSurfaceConfig = {
    visual: { maxWidth: 1100, columnMinWidth: 260, columnGap: 16 },
    presentation: { chrome: { title: 'Board', subtitle: 'Track work across lanes' } },
    behavior: {
      columns: [
        { id: 'backlog', title: 'Backlog', color: '#64748b', items: [
          { id: 'card-1', title: 'Draft rollout brief', meta: 'Due Fri', priority: 'medium', assignee: 'Ana' },
          { id: 'card-2', title: 'Collect field inputs', priority: 'low', assignee: 'Marco' },
        ] },
        { id: 'in-progress', title: 'In progress', color: '#2563eb', limit: 3, items: [
          { id: 'card-3', title: 'Wire export flow', priority: 'high', assignee: 'Jules' },
        ] },
        { id: 'review', title: 'Review', color: '#7c3aed', items: [
          { id: 'card-4', title: 'Verify metrics panel', priority: 'urgent', assignee: 'Lina' },
        ] },
        { id: 'done', title: 'Done', color: '#16a34a', items: [
          { id: 'card-5', title: 'Ship saved views', priority: 'medium', assignee: 'Omar' },
        ] },
      ],
      filters: [
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { label: 'All', value: 'all' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' },
        ] },
      ],
      filterValues,
      onFilterChange: setFilterValues,
      onCardMove: noop,
      onCardClick: noop,
      onCardCreate: noop,
      actions: [{ id: 'add', label: 'Add card', variant: 'primary', onClick: noop }],
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <KanbanSurface config={config} />
    </Box>
  );
}

// --- operational -----------------------------------------------------------

function OperationalSurfacePreview() {
  const config: OperationalSurfaceConfig = {
    visual: { maxWidth: 1200, feedHeight: 320 },
    presentation: {
      chrome: { title: 'Operations', subtitle: 'Live workspace monitoring' },
      primaryPanel: (
        <Stack spacing="sm">
          <Text weight="semibold">Throughput</Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Records processed across active lanes in the last hour.
          </Text>
        </Stack>
      ),
      sections: [
        { key: 'schedule', title: 'Schedule', content: <Text size="sm">Next sync in 12 minutes.</Text>, span: 6 },
        { key: 'coverage', title: 'Coverage', content: <Text size="sm">4 of 5 lanes fully staffed.</Text>, span: 6 },
      ],
    },
    behavior: {
      stats: [
        { key: 'records', label: 'Records', value: '3,248', change: 12, changeType: 'increase', sparklineData: [42, 55, 60, 51, 68, 74, 81] },
        { key: 'throughput', label: 'Throughput', value: '182/m', change: 6, changeType: 'increase' },
        { key: 'queue', label: 'Queue depth', value: 18, change: -4, changeType: 'decrease' },
        { key: 'coverage', label: 'Coverage', value: '97%', change: 2, changeType: 'increase' },
      ],
      feed: {
        items: [
          { key: 'feed-1', title: 'Sync finished across workspaces', isNew: true, timestamp: new Date() },
          { key: 'feed-2', title: 'Queue depth spiked then recovered', timestamp: new Date() },
          { key: 'feed-3', title: 'New coverage list imported', timestamp: new Date() },
        ],
        renderItem: (item) => (
          <Box style={{ padding: 12, border: '1px solid var(--ds-color-border-subtle)', borderRadius: 12 }}>
            <Text style={{ fontWeight: 600 }}>{String(item.title)}</Text>
          </Box>
        ),
        newItemsCount: 1,
        onShowNewItems: noop,
      },
      refreshAction: { id: 'refresh', label: 'Refresh', onClick: noop },
      actions: [{ id: 'configure', label: 'Configure', variant: 'secondary', onClick: noop }],
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <OperationalSurface config={config} />
    </Box>
  );
}

// --- scheduler -------------------------------------------------------------

function SchedulerSurfacePreview() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-03-18T09:00:00'));
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day'>('week');

  const config: SchedulerSurfaceConfig = {
    visual: { maxWidth: 1200, height: 560, defaultView: 'week' },
    presentation: {
      chrome: { title: 'Schedule', subtitle: 'Plan slots across the week' },
      timeZone: 'UTC',
      sidebar: (
        <Stack spacing="sm">
          <Text weight="semibold">Upcoming</Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Design sync - 09:00</Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Planning review - 13:00</Text>
        </Stack>
      ),
    },
    behavior: {
      events: [
        { id: 'slot-1', title: 'Design sync', start: new Date('2026-03-18T09:00:00'), end: new Date('2026-03-18T10:00:00') },
        { id: 'slot-2', title: 'Planning review', start: new Date('2026-03-18T13:00:00'), end: new Date('2026-03-18T14:00:00') },
        { id: 'slot-3', title: 'Metrics readout', start: new Date('2026-03-19T11:00:00'), color: '#7c3aed' },
        { id: 'slot-4', title: 'Weekly retro', start: new Date('2026-03-20T15:30:00'), allDay: false },
      ],
      currentDate,
      activeView,
      onDateChange: setCurrentDate,
      onViewChange: setActiveView,
      onEventClick: noop,
      onDateClick: noop,
      actions: [{ id: 'add-slot', label: 'Add slot', variant: 'primary', onClick: noop }],
    },
    access: { mode: 'all' },
  };

  return (
    <Box style={{ width: '100%' }}>
      <SchedulerSurface config={config} />
    </Box>
  );
}

export const OPERATIONS_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  activity: <ActivitySurfacePreview />,
  kanban: <KanbanSurfacePreview />,
  operational: <OperationalSurfacePreview />,
  scheduler: <SchedulerSurfacePreview />,
};
