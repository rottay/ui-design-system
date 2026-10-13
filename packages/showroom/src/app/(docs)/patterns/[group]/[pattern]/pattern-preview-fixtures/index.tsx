'use client';

import type { ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  PatternActivityLog,
  PatternApprovalWorkflow,
  PatternCalendarView,
  PatternCommentThread,
  PatternDetailPanel,
  PatternEmptyState,
  PatternFileManager,
  PatternFilterPanel,
  PatternFormBuilder,
  PatternInvoiceTemplate,
  PatternKanbanBoard,
  PatternLiveFeed,
  PatternMapView,
  PatternNotificationCenter,
  PatternPageShell,
  PatternPricingTable,
  PatternStatsGrid,
  PatternStepWizard,
  PatternTimeline,
  PatternTreeView,
  PatternUserProfileCard,
  Stack,
  Text,
} from '@rottay/design-system';
import PlatformUserListDemo from '@/components/demos/rottay/user-list';
import {
  SavedViewsPreview,
  ColumnSettingsPreview,
  ListToolbarPreview,
  BulkSelectPreview,
  StatusFilterPillsPreview,
  GridViewPreview,
  GalleryViewPreview,
  DecisionComparisonPreview,
  RecordFactsPreview,
  MonoStatPreview,
  WidgetBoardPreview,
} from '../pattern-preview-data';
import { FilterBuilderPreview } from '../pattern-preview-forms';
import {
  EnvironmentTogglePreview,
  LocaleSwitcherPreview,
  WorkspaceSwitcherPreview,
  CommandPalettePreview,
  ShortcutsOverlayPreview,
} from '../pattern-preview-navigation';
import { AssistantPreview, PresencePreview } from '../pattern-preview-communication';
import {
  ApprovalInboxPreview,
  ModerationGalleryPreview,
  OperationalLedgerPreview,
  ShiftMatrixPreview,
} from '../pattern-preview-workflow';
import { CockpitHeaderPreview, WorkbenchHeaderPreview } from '../pattern-preview-shell';
import { AdaptiveOverlayPreview, TerminalBlockPreview } from '../pattern-preview-feedback';
import { AsciiDiagramPreview } from '../pattern-preview-visualization';
import { BrandStudioPreview } from '../pattern-preview-customization';

export const SINGLE_RUNTIME_PATTERN_SLUGS = new Set([
  'command-palette',
  'shortcuts-overlay',
]);

const FILTER_PANEL_DEFINITION = [
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
];

function HonestMigrationNote({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 560,
        border: '1px dashed var(--ds-color-border, #d1d5db)',
        boxShadow: 'none',
      }}
    >
      <Card.Body>
        <Stack spacing="sm">
          <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
            <Text size="sm" weight="semibold">
              {title}
            </Text>
            {/* "Real DS export" read as "this is the real export, rendering".
                It is the export that is real; nothing of it renders here. */}
            <Badge variant="secondary">Export exists · not rendered</Badge>
          </Flex>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {description}
          </Text>
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Adapter state, declared instead of inferred.
 *
 * A pattern preview is `live` when a real DS export renders here, `pending`
 * when the export exists but the showroom cannot yet feed it a truthful
 * payload, and `absent` when nothing is registered at all.
 *
 * The middle state used to be invisible. A pending slug returned a ReactNode
 * like any other, so every consumer read it as a rendered preview: the docs
 * route wrapped it in live-runtime chrome -- component badge, accent frame,
 * and a note asking the reader to check "whether the runtime is coming from
 * the real DS export" -- around a card admitting there is no runtime, and the
 * design-card harvester counted six of these as valid cards because a note is
 * not `data-missing`. Both claimed render parity for a placeholder.
 *
 * So the state is declared here and the note is derived from it. A pending
 * entry cannot exist without a stated reason, and the two cannot drift apart
 * because there is only one of them. `pattern-adapter-state.unit.test.mjs`
 * pins this roster.
 */
export const PATTERN_ADAPTER_PENDING: Record<
  string,
  { title: string; description: string }
> = {
  'decision-panorama': {
    title: 'DecisionPanorama adapter pending',
    description:
      'The DS exports the pattern, but an honest preview needs a context/identity/active-decision payload that the showroom does not own yet. A generic mock here would show layout the component does not actually produce.',
  },
  'virtual-list': {
    title: 'PatternVirtualList adapter pending',
    description:
      'Windowing and end-reached loading only mean anything against a dataset large enough to window. The showroom needs a real generated dataset and a scroll container sized for it before this preview says anything true.',
  },
  'feature-workspace-frame': {
    title: 'FeatureWorkspaceFrame adapter pending',
    description:
      'The frame is placement-only: gutters, a navigation lane, and a content boundary. Previewing it inside the docs preview box would show the box, not the frame -- it needs a full-width route adapter.',
  },
  'branding-preview-sandbox': {
    title: 'BrandingPreviewSandbox adapter pending',
    description:
      'This developer-oriented preview exists in the DS, but it still needs a dedicated showroom adapter with a real tenant appearance payload instead of a fake local mock.',
  },
  'tenant-preview': {
    title: 'PatternTenantPreview adapter pending',
    description:
      'The DS export is real, but this showroom route still needs a proper TenantCreationConfig fixture so the tenant preview reflects actual token authoring instead of a hardcoded local shell.',
  },
  'token-inspector': {
    title: 'TokenInspector adapter pending',
    description:
      'This dev-only inspector activates from the live app with Ctrl+Shift+T, so the honest showroom treatment is a dedicated developer page rather than a fake static card.',
  },
};

export type PatternAdapterState = 'live' | 'pending' | 'absent';

/**
 * Pending wins over live on purpose: if a slug is ever declared pending while
 * a stale fixture still sits in the map, the honest answer is the declaration,
 * not the leftover.
 */
export function getPatternAdapterState(slug: string): PatternAdapterState {
  if (PATTERN_ADAPTER_PENDING[slug]) return 'pending';
  return PATTERN_PREVIEWS[slug] ? 'live' : 'absent';
}

export function renderPatternAdapterPendingNote(slug: string): ReactNode {
  const pending = PATTERN_ADAPTER_PENDING[slug];
  if (!pending) return null;
  return <HonestMigrationNote title={pending.title} description={pending.description} />;
}

const PATTERN_PREVIEWS: Record<string, ReactNode> = {
  'ascii-diagram': <AsciiDiagramPreview />,
  'decision-comparison': <DecisionComparisonPreview />,
  'mono-stat': <MonoStatPreview />,
  'record-facts': <RecordFactsPreview />,
  'terminal-block': <TerminalBlockPreview />,
  'pattern-brand-studio': <BrandStudioPreview />,
  'widget-board': <WidgetBoardPreview />,
  'adaptive-overlay': <AdaptiveOverlayPreview />,
  'activity-log': (
    <PatternActivityLog
      activities={[
        {
          id: 'a1',
          user: { name: 'Alice' },
          action: 'created',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'a2',
          user: { name: 'Marco' },
          action: 'published',
          timestamp: new Date().toISOString(),
        },
      ]}
    />
  ),
  assistant: <AssistantPreview />,
  'approval-inbox': <ApprovalInboxPreview />,
  'approval-workflow': (
    <PatternApprovalWorkflow
      title="Approval workflow"
      entity="Venue contract"
      currentStep={1}
      steps={[
        { key: 'step-1', approver: 'Finance', status: 'approved', comments: 'Budget approved' },
        { key: 'step-2', approver: 'Legal', status: 'pending' },
      ]}
      onApprove={() => undefined}
      onReject={() => undefined}
      onEscalate={() => undefined}
      footer={<Text size="xs">Escalation path stays available for enterprise tenants.</Text>}
    />
  ),
  'bulk-select-toggle': <BulkSelectPreview />,
  'calendar-view': (
    <PatternCalendarView
      header={<Text style={{ fontWeight: 700 }}>Schedule overview</Text>}
      events={[
        { id: 'cal-1', title: 'Sponsor breakfast', start: new Date('2026-03-18T09:00:00') },
        { id: 'cal-2', title: 'Main keynote', start: new Date('2026-03-18T13:00:00') },
      ]}
      view="week"
    />
  ),
  'cockpit-header': <CockpitHeaderPreview />,
  'column-settings': <ColumnSettingsPreview />,
  'command-palette': <CommandPalettePreview />,
  'comment-thread': (
    <PatternCommentThread
      comments={[
        {
          id: 'c1',
          author: { name: 'Alice' },
          content: 'Looks good',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'c2',
          author: { name: 'Marco' },
          content: 'We should double-check the vendor terms.',
          timestamp: new Date().toISOString(),
        },
      ]}
    />
  ),
  'data-table': <PlatformUserListDemo />,
  'detail-panel': (
    <PatternDetailPanel
      data={{ id: 'evt-42' }}
      title="Pattern detail panel"
      subtitle="Reusable master-detail shell"
      status={{ label: 'Live' }}
      actions={[
        { key: 'publish', label: 'Publish', variant: 'primary', onClick: () => undefined },
        { key: 'archive', label: 'Archive', variant: 'ghost', onClick: () => undefined },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <Text>Overview content lives here.</Text>, badge: 'New' },
        { key: 'operations', label: 'Operations', content: <Text>Ops checklist and assignments.</Text> },
      ]}
      sidebar={
        <Stack spacing="xs">
          <Text size="xs">Owner</Text>
          <Text size="sm">Event Operations</Text>
        </Stack>
      }
    />
  ),
  'empty-state': (
    <PatternEmptyState
      title="No records"
      description="Create the first workspace to get started."
      action={{ label: 'Create workspace', onClick: () => undefined, variant: 'primary' }}
      secondaryAction={{ label: 'Import existing', onClick: () => undefined }}
    />
  ),
  'environment-toggle': <EnvironmentTogglePreview />,
  'file-manager': (
    <PatternFileManager
      files={[
        { id: 'f1', name: 'report.pdf', type: 'file', size: 1024 },
        { id: 'f2', name: 'roster.csv', type: 'file', size: 640 },
      ]}
      folders={[{ id: 'd1', name: 'Documents', type: 'folder', childCount: 2 }]}
    />
  ),
  'filter-builder': <FilterBuilderPreview />,
  'filter-panel': (
    <PatternFilterPanel
      title="Filters"
      layout="stacked"
      filters={FILTER_PANEL_DEFINITION as any}
      values={{ status: 'published', mode: 'onsite' }}
      showApply
      onApply={() => undefined}
      onReset={() => undefined}
      onChange={() => undefined}
    />
  ),
  'form-builder': (
    <PatternFormBuilder
      title="Create Event"
      description="Dynamic field rendering with DS field definitions."
      layout="grid"
      columns={2}
      fields={[
        { name: 'eventName', label: 'Event name', type: 'text', required: true, placeholder: 'Spring Summit' },
        {
          name: 'eventType',
          label: 'Event type',
          type: 'select',
          options: [
            { label: 'Conference', value: 'conference' },
            { label: 'Festival', value: 'festival' },
          ],
        },
        { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '500' },
        { name: 'notes', label: 'Operational notes', type: 'textarea', colSpan: 2, placeholder: 'Crew arrival, AV checks' },
      ]}
      actions={<Button htmlType="submit">Save event</Button>}
      onSubmit={() => undefined}
    />
  ),
  'gallery-view': <GalleryViewPreview />,
  'grid-view': <GridViewPreview />,
  'invoice-template': (
    <PatternInvoiceTemplate
      invoice={{
        number: 'INV-1',
        date: '2026-03-14',
        dueDate: '2026-04-14',
        status: 'sent',
        company: { name: 'Rottay', address: '123 Main', city: 'NYC', email: 'billing@rottay.dev' },
        client: { name: 'Acme', address: '456 Oak', city: 'LA', email: 'ap@acme.dev' },
        items: [{ id: 'i1', description: 'Platform', quantity: 1, unitPrice: 500, total: 500 }],
        subtotal: 500,
        tax: 50,
        taxRate: 10,
        total: 550,
      }}
    />
  ),
  'kanban-board': (
    <PatternKanbanBoard
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
      renderCard={(item) => <Text>{item.title}</Text>}
      addItemLabel="Add task"
      onAddItem={() => undefined}
    />
  ),
  'list-toolbar': <ListToolbarPreview />,
  'live-feed': (
    <PatternLiveFeed
      header={<Text style={{ fontWeight: 700 }}>Live feed</Text>}
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
  ),
  'locale-switcher': <LocaleSwitcherPreview />,
  'map-view': (
    <PatternMapView
      center={{ lat: 40.7128, lng: -74.006 }}
      zoom={12}
      markers={[
        { id: 'm-1', label: 'Main stage', lat: 40.7128, lng: -74.006 },
        { id: 'm-2', label: 'VIP lounge', lat: 40.715, lng: -74.001 },
      ]}
    />
  ),
  'moderation-gallery': <ModerationGalleryPreview />,
  'notification-center': (
    <PatternNotificationCenter
      notifications={[
        {
          id: '1',
          title: 'New comment',
          message: 'Alice commented on your post',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Payment received',
          message: 'Invoice #1234 has been paid',
          type: 'success',
          read: false,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ]}
      onRead={() => undefined}
      onReadAll={() => undefined}
      onClear={() => undefined}
      onClearAll={() => undefined}
    />
  ),
  'operational-ledger': <OperationalLedgerPreview />,
  'page-shell': (
    <PatternPageShell
      title="Operations"
      subtitle="Premium shell"
      actions={<Button>Export</Button>}
    >
      <Card>
        <Card.Body>
          <Text>Shell content</Text>
        </Card.Body>
      </Card>
    </PatternPageShell>
  ),
  presence: <PresencePreview />,
  'pricing-table': (
    <PatternPricingTable
      plans={[
        { id: 'free', name: 'Free', price: 0, cta: 'Start', features: { storage: '1 GB' } },
        { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, features: { storage: '100 GB' } },
      ]}
      features={[{ key: 'storage', label: 'Storage' }]}
    />
  ),
  'saved-views': <SavedViewsPreview />,
  'shortcuts-overlay': <ShortcutsOverlayPreview />,
  'shift-matrix': <ShiftMatrixPreview />,
  'stats-grid': (
    <PatternStatsGrid
      stats={[
        { key: 'events', label: 'Events', value: 18, change: 12, changeType: 'increase' },
        { key: 'tickets', label: 'Tickets', value: '12.4k', change: 8, changeType: 'increase' },
        { key: 'conversion', label: 'Conversion', value: '7.8%', change: -1.4, changeType: 'decrease' },
      ]}
      columns={3}
      variant="outlined"
    />
  ),
  'status-filter-pills': <StatusFilterPillsPreview />,
  'step-wizard': (
    <PatternStepWizard
      steps={[
        { key: 'one', title: 'Step one', content: <Text>Step one content</Text> },
        { key: 'two', title: 'Step two', content: <Text>Step two content</Text> },
      ]}
    />
  ),
  timeline: (
    <PatternTimeline
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
  ),
  'tree-view': (
    <PatternTreeView
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
  'user-profile-card': (
    <PatternUserProfileCard
      user={{
        name: 'Jane Doe',
        role: 'Product Manager',
        email: 'jane@example.com',
        department: 'Engineering',
        status: 'active',
      }}
    />
  ),
  'workbench-header': <WorkbenchHeaderPreview />,
  'workspace-switcher': <WorkspaceSwitcherPreview />,
};

/**
 * Live previews only. A pending slug returns null here, which is what makes
 * every consumer honest without having to remember to ask: the docs route
 * renders the pending notice instead of the live-runtime chrome, and the
 * design-card harvester emits its `data-missing` sentinel instead of
 * photographing a placeholder card and counting it as valid. Callers that
 * genuinely want to show the reason ask for it with
 * `renderPatternAdapterPendingNote`.
 */
export function renderPatternPreview(slug: string) {
  if (PATTERN_ADAPTER_PENDING[slug]) return null;
  return PATTERN_PREVIEWS[slug] ?? null;
}
