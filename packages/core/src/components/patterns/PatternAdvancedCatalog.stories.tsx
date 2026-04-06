import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays, Filter, GitCompare, Inbox, ListTree, ShieldCheck } from 'lucide-react';

import { Box, Button, Card, Stack, Text } from '../primitives';
import { PatternApprovalWorkflow } from './approval-workflow';
import { PatternCalendarView } from './calendar-view';
import { PatternCommandPalette } from './command-palette';
import { PatternDetailPanel } from './detail-panel';
import { PatternEmptyState } from './empty-state';
import { PatternFilterPanel } from './filter-panel';
import { PatternKanbanBoard } from './kanban-board';
import { PatternLiveFeed } from './live-feed';
import { PatternTimeline } from './timeline';
import { PatternTreeView } from './tree-view';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta = {
  title: 'Patterns/Advanced Catalog',
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
      locale: 'en',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const kanbanColumns = [
  {
    id: 'planned',
    title: 'Planned',
    items: [
      { id: 'task-1', title: 'Finalize floor plan', owner: 'Ops' },
      { id: 'task-2', title: 'Confirm sponsors', owner: 'Sales' },
    ],
  },
  {
    id: 'live',
    title: 'In progress',
    items: [{ id: 'task-3', title: 'Ticket bundle QA', owner: 'Growth' }],
  },
  {
    id: 'done',
    title: 'Done',
    items: [{ id: 'task-4', title: 'Crew briefing', owner: 'Ops' }],
  },
];

export const AdvancedPatterns: Story = {
  render: () => (
    <Stack spacing="xl">
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card variant="outlined">
          <Card.Body>
            <PatternEmptyState
              icon={<Inbox size={24} />}
              title="PatternEmptyState"
              description="Reusable empty state with primary and secondary CTAs."
              action={{ label: 'Create workspace', onClick: () => undefined, variant: 'primary' }}
              secondaryAction={{ label: 'Import existing', onClick: () => undefined }}
            />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Body>
            <PatternFilterPanel
              title="PatternFilterPanel"
              layout="stacked"
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { label: 'Draft', value: 'draft' },
                    { label: 'Published', value: 'published' },
                  ],
                },
                {
                  key: 'mode',
                  label: 'Mode',
                  type: 'select',
                  options: [
                    { label: 'On-site', value: 'onsite' },
                    { label: 'Hybrid', value: 'hybrid' },
                  ],
                },
              ]}
              values={{ status: 'published', mode: 'onsite' }}
              showApply
              onApply={() => undefined}
              onReset={() => undefined}
              onChange={() => undefined}
            />
          </Card.Body>
        </Card>
      </div>

      <Card variant="outlined">
        <Card.Body>
          <PatternKanbanBoard
            columns={kanbanColumns}
            itemKey={(item) => item.id}
            onItemMove={() => undefined}
            onItemClick={() => undefined}
            renderCard={(item) => (
              <Card variant="ghost">
                <Card.Body>
                  <Stack spacing="xs">
                    <Text style={{ fontWeight: 600 }}>{item.title}</Text>
                    <Text variant="caption">Owner: {item.owner}</Text>
                  </Stack>
                </Card.Body>
              </Card>
            )}
            toolbar={<Text style={{ fontWeight: 700 }}>PatternKanbanBoard</Text>}
            addItemLabel="Add task"
            onAddItem={() => undefined}
          />
        </Card.Body>
      </Card>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <Card variant="outlined">
          <Card.Body>
            <PatternTimeline
              header={<Text style={{ fontWeight: 700 }}>PatternTimeline</Text>}
              items={[
                {
                  key: 'timeline-1',
                  timestamp: new Date('2026-03-10T09:00:00'),
                  title: 'Venue walkthrough',
                  description: 'Confirmed stage dimensions and camera placements.',
                  type: 'success',
                },
                {
                  key: 'timeline-2',
                  timestamp: new Date('2026-03-11T13:00:00'),
                  title: 'Marketing launch',
                  description: 'Campaign assets scheduled for release.',
                  type: 'info',
                },
              ]}
            />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Body>
            <PatternLiveFeed
              header={<Text style={{ fontWeight: 700 }}>PatternLiveFeed</Text>}
              items={[
                { key: 'feed-1', title: 'Check-in spike', isNew: true, timestamp: new Date() },
                { key: 'feed-2', title: 'VIP list synced', timestamp: new Date() },
              ]}
              renderItem={(item) => (
                <Box style={{ padding: 12, border: '1px solid var(--ds-color-border-subtle)', borderRadius: 12 }}>
                  <Text style={{ fontWeight: 600 }}>{String(item.title)}</Text>
                </Box>
              )}
              newItemsCount={2}
              onShowNewItems={() => undefined}
            />
          </Card.Body>
        </Card>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <Card variant="outlined">
          <Card.Body>
            <PatternTreeView
              data={[
                {
                  key: 'ops',
                  label: 'Operations',
                  icon: <ListTree size={16} />,
                  children: [
                    { key: 'ops-checkin', label: 'Check-in' },
                    { key: 'ops-security', label: 'Security' },
                  ],
                },
                {
                  key: 'marketing',
                  label: 'Marketing',
                  children: [{ key: 'marketing-campaigns', label: 'Campaigns' }],
                },
              ]}
              defaultExpandedKeys={['ops']}
              searchable
              searchPlaceholder="Search team tree"
            />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Body>
            <PatternApprovalWorkflow
              title="PatternApprovalWorkflow"
              entity="Venue contract"
              currentStep={1}
              steps={[
                {
                  key: 'step-1',
                  approver: 'Finance',
                  status: 'approved',
                  comments: 'Budget approved',
                },
                {
                  key: 'step-2',
                  approver: 'Legal',
                  status: 'pending',
                },
              ]}
              onApprove={() => undefined}
              onReject={() => undefined}
              onEscalate={() => undefined}
              footer={<Text variant="caption">Escalation path available for enterprise tenants.</Text>}
            />
          </Card.Body>
        </Card>
      </div>

      <Card variant="outlined">
        <Card.Body>
          <PatternDetailPanel
            data={{ id: 'evt-42' }}
            title="PatternDetailPanel"
            subtitle="Reusable master-detail shell"
            status={{ label: 'Live' }}
            actions={[
              { key: 'publish', label: 'Publish', variant: 'primary', onClick: () => undefined },
              { key: 'archive', label: 'Archive', variant: 'ghost', onClick: () => undefined },
            ]}
            tabs={[
              {
                key: 'overview',
                label: 'Overview',
                icon: <GitCompare size={16} />,
                content: <Text>Overview content lives here.</Text>,
                badge: 'New',
              },
              {
                key: 'operations',
                label: 'Operations',
                content: <Text>Ops checklist and assignments.</Text>,
              },
            ]}
            sidebar={
              <Stack spacing="sm">
                <Text variant="caption">Owner</Text>
                <Text>Event Operations</Text>
                <Text variant="caption">Venue</Text>
                <Text>Harbor Hall</Text>
              </Stack>
            }
          />
        </Card.Body>
      </Card>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <Card variant="outlined">
          <Card.Body>
            <PatternCalendarView
              header={
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={18} />
                  <Text style={{ fontWeight: 700 }}>PatternCalendarView</Text>
                </Box>
              }
              events={[
                { id: 'cal-1', title: 'Sponsor breakfast', start: new Date('2026-03-18T09:00:00') },
                { id: 'cal-2', title: 'Main keynote', start: new Date('2026-03-18T13:00:00') },
              ]}
              view="week"
            />
          </Card.Body>
        </Card>

        <Card variant="outlined">
          <Card.Body>
            <PatternCommandPalette
              open
              onOpenChange={() => undefined}
              placeholder="Jump to a surface or action"
              items={[
                { id: 'cmd-1', label: 'Open dashboard', icon: <Filter size={16} />, onSelect: () => undefined },
                { id: 'cmd-2', label: 'Review approvals', icon: <ShieldCheck size={16} />, onSelect: () => undefined },
              ]}
              recentItems={[
                { id: 'recent-1', label: 'Create event', onSelect: () => undefined },
              ]}
            />
          </Card.Body>
        </Card>
      </div>
    </Stack>
  ),
};
