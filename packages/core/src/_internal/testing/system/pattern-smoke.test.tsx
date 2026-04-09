/**
 * @fileoverview Pattern component smoke tests across all stable engines.
 * Ensures every pattern (KanbanBoard, StepWizard, FilterPanel, etc.)
 * renders its expected text content through each engine implementation.
 */

import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import * as DS from '../../../index';
import { STABLE_ENGINES, renderWithEngine } from '../helpers/engine-test-utils';

type PatternSmokeCase = {
  name: string;
  render: () => React.ReactElement;
  expectedText: string;
  portalTarget?: boolean;
};

const PATTERN_CASES: PatternSmokeCase[] = [
  {
    name: 'PatternCalendarView',
    expectedText: 'Calendar shell',
    render: () => (
      <DS.PatternCalendarView
        header={<div>Calendar shell</div>}
        events={[
          { id: 'cal-1', title: 'Sponsor breakfast', start: new Date('2026-03-18T09:00:00') },
          { id: 'cal-2', title: 'Main keynote', start: new Date('2026-03-18T13:00:00') },
        ]}
        view="week"
      />
    ),
  },
  {
    name: 'PatternCommandPalette',
    expectedText: 'Open dashboard',
    portalTarget: true,
    render: () => (
      <DS.PatternCommandPalette
        open
        onOpenChange={() => undefined}
        placeholder="Jump to a surface or action"
        items={[
          { id: 'cmd-1', label: 'Open dashboard', onSelect: () => undefined },
          { id: 'cmd-2', label: 'Review approvals', onSelect: () => undefined },
        ]}
        recentItems={[{ id: 'recent-1', label: 'Create event', onSelect: () => undefined }]}
      />
    ),
  },
  {
    name: 'PatternDetailPanel',
    expectedText: 'Overview content lives here.',
    render: () => (
      <DS.PatternDetailPanel
        data={{ id: 'evt-42' }}
        title="Event detail"
        subtitle="Reusable master-detail shell"
        status={{ label: 'Live' }}
        actions={[
          { key: 'publish', label: 'Publish', variant: 'primary', onClick: () => undefined },
          { key: 'archive', label: 'Archive', variant: 'ghost', onClick: () => undefined },
        ]}
        tabs={[
          { key: 'overview', label: 'Overview', content: <div>Overview content lives here.</div>, badge: 'New' },
          { key: 'operations', label: 'Operations', content: <div>Ops checklist and assignments.</div> },
        ]}
        sidebar={<div>Sidebar metadata</div>}
      />
    ),
  },
  {
    name: 'PatternEmptyState',
    expectedText: 'No records',
    render: () => (
      <DS.PatternEmptyState
        title="No records"
        description="Create the first workspace to get started."
        action={{ label: 'Create workspace', onClick: () => undefined, variant: 'primary' }}
        secondaryAction={{ label: 'Import existing', onClick: () => undefined }}
      />
    ),
  },
  {
    name: 'PatternFilterPanel',
    expectedText: 'Filters',
    render: () => (
      <DS.PatternFilterPanel
        title="Filters"
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
        ]}
        values={{ status: 'published' }}
        showApply
        onApply={() => undefined}
        onReset={() => undefined}
        onChange={() => undefined}
      />
    ),
  },
  {
    name: 'PatternKanbanBoard',
    expectedText: 'Finalize floor plan',
    render: () => (
      <DS.PatternKanbanBoard
        columns={[
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
        ]}
        itemKey={(item) => item.id}
        onItemMove={() => undefined}
        onItemClick={() => undefined}
        renderCard={(item) => <div>{item.title}</div>}
        addItemLabel="Add task"
        onAddItem={() => undefined}
      />
    ),
  },
  {
    name: 'PatternLiveFeed',
    expectedText: 'Live Feed',
    render: () => (
      <DS.PatternLiveFeed
        header={<div>Live Feed</div>}
        items={[
          { key: 'feed-1', title: 'Check-in spike', isNew: true, timestamp: new Date() },
          { key: 'feed-2', title: 'VIP list synced', timestamp: new Date() },
        ]}
        renderItem={(item) => <div>{String(item.title)}</div>}
        newItemsCount={2}
        onShowNewItems={() => undefined}
      />
    ),
  },
  {
    name: 'PatternMapView',
    expectedText: 'Map placeholder',
    render: () => (
      <DS.PatternMapView
        center={{ lat: 40.7128, lng: -74.006 }}
        zoom={12}
        markers={[
          { id: 'm-1', label: 'Main stage', lat: 40.7128, lng: -74.006 },
          { id: 'm-2', label: 'VIP lounge', lat: 40.715, lng: -74.001 },
        ]}
      />
    ),
  },
  {
    name: 'PatternPageShell',
    expectedText: 'Shell content',
    render: () => (
      <DS.PatternPageShell title="Operations" subtitle="Premium shell" actions={<button type="button">Export</button>}>
        <div>Shell content</div>
      </DS.PatternPageShell>
    ),
  },
  {
    name: 'PatternStatsGrid',
    expectedText: 'Revenue',
    render: () => (
      <DS.PatternStatsGrid
        stats={[
          { key: 'revenue', label: 'Revenue', value: '$12.4k', change: 8, changeType: 'increase' },
          { key: 'tickets', label: 'Tickets', value: '680', change: 4, changeType: 'increase' },
        ]}
        columns={2}
      />
    ),
  },
  {
    name: 'PatternStepWizard',
    expectedText: 'Step one content',
    render: () => (
      <DS.PatternStepWizard
        steps={[
          { key: 'one', title: 'Step one', content: <div>Step one content</div> },
          { key: 'two', title: 'Step two', content: <div>Step two content</div> },
        ]}
      />
    ),
  },
  {
    name: 'PatternTimeline',
    expectedText: 'Venue walkthrough',
    render: () => (
      <DS.PatternTimeline
        items={[
          {
            key: 'timeline-1',
            timestamp: new Date('2026-03-10T09:00:00'),
            title: 'Venue walkthrough',
            description: 'Confirmed stage dimensions and camera placements.',
            type: 'success',
          },
        ]}
      />
    ),
  },
  {
    name: 'PatternTreeView',
    expectedText: 'Operations',
    render: () => (
      <DS.PatternTreeView
        data={[
          {
            key: 'ops',
            label: 'Operations',
            children: [
              { key: 'ops-checkin', label: 'Check-in' },
              { key: 'ops-security', label: 'Security' },
            ],
          },
        ]}
        defaultExpandedKeys={['ops']}
        searchable
        searchPlaceholder="Search team tree"
      />
    ),
  },
];

describe('pattern smoke coverage', () => {
  beforeAll(async () => {
    await Promise.all([
      import('../../../components/patterns/data/detail-panel/engines/classic'),
      import('../../../components/patterns/data/detail-panel/engines/modern'),
      import('../../../components/patterns/data/detail-panel/engines/rustic'),
    ]);
  });

  describe.each(STABLE_ENGINES)('%s engine', (engine) => {
    it.each(PATTERN_CASES)('renders $name with the real engine implementation', async ({ render, expectedText, portalTarget }) => {
      const result = renderWithEngine(render(), engine);

      await waitFor(
        () => {
          if (portalTarget) {
            expect(document.body.textContent).toContain(expectedText);
            return;
          }

          expect(result.container.textContent).toContain(expectedText);
        },
        { timeout: 15000 }
      );

    });
  });
});
