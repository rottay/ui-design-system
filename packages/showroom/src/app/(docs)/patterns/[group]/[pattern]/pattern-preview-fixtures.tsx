'use client';

import { useState, type ReactNode } from 'react';
import {
  AdaptiveOverlay,
  AssistantStatusBadge,
  AssistantStatusIndicator,
  Avatar,
  Badge,
  Box,
  BulkSelectToggle,
  Button,
  Card,
  cellRenderers,
  ConfirmActionCard,
  Flex,
  LiveCursor,
  MessageBubble,
  PatternActivityLog,
  PatternApprovalInbox,
  PatternApprovalWorkflow,
  PatternCalendarView,
  PatternCockpitHeader,
  PatternColumnSettings,
  PatternCommentThread,
  PatternCommandPalette,
  PatternDataTable,
  PatternDetailPanel,
  PatternEmptyState,
  PatternEnvironmentToggle,
  PatternFileManager,
  PatternFilterBuilder,
  PatternFilterPanel,
  PatternFormBuilder,
  PatternGalleryView,
  PatternGridView,
  PatternInvoiceTemplate,
  PatternKanbanBoard,
  PatternListToolbar,
  PatternLiveFeed,
  PatternLocaleSwitcher,
  PatternMapView,
  PatternModerationGallery,
  PatternNotificationCenter,
  PatternOperationalLedger,
  PatternPageShell,
  PatternPricingTable,
  PatternSavedViewsBar,
  PatternShiftMatrix,
  PatternShortcutsOverlay,
  PatternStatsGrid,
  PatternStepWizard,
  PatternTimeline,
  PatternTreeView,
  PatternUserProfileCard,
  PatternWorkbenchHeader,
  PatternWorkspaceSwitcher,
  PresenceBar,
  PresenceTypingIndicator,
  PreviewDiffCard,
  Stack,
  StatusFilterPills,
  StreamingText,
  Text,
  ToolCallCard,
  TypingIndicator,
} from '@rottay/design-system';
import PlatformUserListDemo from '@/composition/components/demos/platform/user-list';

export const SINGLE_RUNTIME_PATTERN_SLUGS = new Set([
  'command-palette',
  'shortcuts-overlay',
]);

type ViewMode = 'table' | 'cards';

type GalleryAsset = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

type SimpleUser = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'paused' | 'review';
  createdAt: string;
};

const SIMPLE_USERS: SimpleUser[] = [
  {
    id: 'usr-1',
    name: 'Ana Porter',
    email: 'ana@rottay.com',
    status: 'active',
    createdAt: '2026-04-17T09:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Marco Silva',
    email: 'marco@bithire.io',
    status: 'review',
    createdAt: '2026-04-18T11:30:00Z',
  },
  {
    id: 'usr-3',
    name: 'Jules Carter',
    email: 'jules@evnto.app',
    status: 'paused',
    createdAt: '2026-04-19T14:20:00Z',
  },
];

const GALLERY_ITEMS: GalleryAsset[] = [
  {
    id: 'asset-1',
    title: 'Main Hall',
    subtitle: 'Venue layout',
    image: createThumbnail('Main Hall', '#1d4ed8'),
  },
  {
    id: 'asset-2',
    title: 'VIP Deck',
    subtitle: 'Premium access',
    image: createThumbnail('VIP Deck', '#0f766e'),
  },
  {
    id: 'asset-3',
    title: 'Night Stage',
    subtitle: 'Festival lighting',
    image: createThumbnail('Night Stage', '#7c3aed'),
  },
];

const SAVED_VIEWS: any[] = [
  {
    id: 'all',
    name: 'All records',
    isDefault: true,
    config: { layout: 'table' },
  },
  {
    id: 'ops',
    name: 'Ops review',
    config: { filters: { status: 'active' }, layout: 'table' },
  },
  {
    id: 'board',
    name: 'Board',
    config: { layout: 'board', groupBy: 'status' },
  },
];

const FILTER_BUILDER_FIELDS = [
  { key: 'name', label: 'Event name', type: 'text', placeholder: 'Search events...' },
  { key: 'capacity', label: 'Capacity', type: 'number', placeholder: 'Enter number' },
  { key: 'date', label: 'Date', type: 'date' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Sold Out', value: 'sold_out' },
    ],
  },
];

const FILTER_BUILDER_INITIAL = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'r1', field: 'status', operator: 'equals', value: 'published' },
    { id: 'r2', field: 'capacity', operator: 'gt', value: 200 },
  ],
};

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

function createThumbnail(label: string, color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <rect width="480" height="320" rx="24" fill="${color}" />
      <rect x="28" y="28" width="424" height="264" rx="20" fill="rgba(255,255,255,0.12)" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="white">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
            <Badge variant="secondary">Real DS export</Badge>
          </Flex>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            {description}
          </Text>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function FilterBuilderPreview() {
  const [value, setValue] = useState<any>(FILTER_BUILDER_INITIAL);

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternFilterBuilder
        fields={FILTER_BUILDER_FIELDS as any}
        value={value}
        onChange={setValue}
        allowGrouping
        showClear
        onClear={() => setValue({ id: 'root', logic: 'and', rules: [] })}
      />
    </Box>
  );
}

function SavedViewsPreview() {
  const [views, setViews] = useState<any[]>(SAVED_VIEWS);
  const [activeViewId, setActiveViewId] = useState('all');

  return (
    <Box style={{ width: '100%', maxWidth: 740 }}>
      <PatternSavedViewsBar
        views={views}
        activeViewId={activeViewId}
        onViewSelect={setActiveViewId}
        onViewSave={(view) => {
          setViews((current) =>
            current.map((item) => (item.id === view.id ? view : item)),
          );
        }}
        onViewDelete={(viewId) => {
          setViews((current) => current.filter((item) => item.id !== viewId));
          if (viewId === activeViewId) {
            setActiveViewId('all');
          }
        }}
        onViewRename={(viewId, name) => {
          setViews((current) =>
            current.map((item) => (item.id === viewId ? { ...item, name } : item)),
          );
        }}
        onViewCreate={(view) => {
          const nextView = { ...view, id: `view-${Date.now()}` };
          setViews((current) => [...current, nextView]);
          setActiveViewId(nextView.id);
        }}
        onViewDuplicate={(viewId) => {
          const original = views.find((item) => item.id === viewId);
          if (!original) {
            return;
          }

          const copy = {
            ...original,
            id: `view-${Date.now()}`,
            name: `${original.name} copy`,
            isDefault: false,
          };
          setViews((current) => [...current, copy]);
        }}
        onViewReorder={(ids) => {
          const reordered = ids
            .map((id) => views.find((item) => item.id === id))
            .filter(Boolean) as any[];
          setViews(reordered);
        }}
        allowCreate
        allowDelete
        allowRename
      />
    </Box>
  );
}

function EnvironmentTogglePreview() {
  const [activeEnvironment, setActiveEnvironment] = useState('staging');

  return (
    <PatternEnvironmentToggle
      environments={[
        { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
        { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
        { id: 'prod', name: 'Production', color: '#22c55e' },
      ]}
      activeEnvironment={activeEnvironment}
      onChange={setActiveEnvironment}
      showBanner={false}
      productionId="prod"
      variant="pills"
    />
  );
}

function LocaleSwitcherPreview() {
  const [locale, setLocale] = useState('en');

  return (
    <PatternLocaleSwitcher
      locale={locale}
      onChange={setLocale}
      locales={[
        { code: 'es', label: 'Espanol', flag: 'ES' },
        { code: 'en', label: 'English', flag: 'EN' },
        { code: 'pt', label: 'Portugues', flag: 'PT' },
      ]}
      showLabel
    />
  );
}

function WorkspaceSwitcherPreview() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-1');

  return (
    <PatternWorkspaceSwitcher
      workspaces={[
        {
          id: 'ws-1',
          name: 'Rottay Shell',
          role: 'Admin',
          plan: 'enterprise',
          unreadCount: 5,
          online: 23,
        },
        {
          id: 'ws-2',
          name: 'BitHire Ops',
          role: 'Member',
          plan: 'pro',
          unreadCount: 1,
          online: 8,
        },
        {
          id: 'ws-3',
          name: 'Evnto Growth',
          role: 'Owner',
          plan: 'starter',
          unreadCount: 0,
          online: 3,
        },
      ]}
      activeWorkspaceId={activeWorkspaceId}
      onSwitch={setActiveWorkspaceId}
      onCreate={() => undefined}
      onSettings={() => undefined}
      currentUser={{ name: 'Daniel Avila', email: 'daniel@rottay.com' }}
      position="header"
    />
  );
}

function ColumnSettingsPreview() {
  const [visibleColumns, setVisibleColumns] = useState(['name', 'status', 'owner', 'updatedAt']);
  const [columnOrder, setColumnOrder] = useState(['name', 'status', 'owner', 'updatedAt']);
  const [pinnedColumns, setPinnedColumns] = useState<{ left: string[]; right: string[] }>({
    left: ['name'],
    right: [],
  });

  const allColumns = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'owner', header: 'Owner' },
    { key: 'updatedAt', header: 'Updated' },
  ];

  return (
    <Box style={{ width: '100%', maxWidth: 520 }}>
      <PatternColumnSettings
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        lockedColumns={['name']}
        columnOrder={columnOrder}
        pinnedColumns={pinnedColumns}
        onToggleVisibility={(key) => {
          setVisibleColumns((current) =>
            current.includes(key)
              ? current.filter((item) => item !== key)
              : [...current, key],
          );
        }}
        onReorder={setColumnOrder}
        onTogglePin={(key, side) => {
          setPinnedColumns((current) => ({
            left:
              side === 'left'
                ? Array.from(new Set([...current.left.filter((item) => item !== key), key]))
                : current.left.filter((item) => item !== key),
            right:
              side === 'right'
                ? Array.from(new Set([...current.right.filter((item) => item !== key), key]))
                : current.right.filter((item) => item !== key),
          }));
        }}
        onReset={() => {
          setVisibleColumns(['name', 'status', 'owner', 'updatedAt']);
          setColumnOrder(['name', 'status', 'owner', 'updatedAt']);
          setPinnedColumns({ left: ['name'], right: [] });
        }}
      />
    </Box>
  );
}

function ListToolbarPreview() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: 'active',
    team: 'ops',
  });

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternListToolbar
        title="Members"
        totalCount={128}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members"
        filterPills={[
          {
            key: 'status',
            label: 'Status',
            value: String(filters.status ?? 'active'),
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
            ],
          },
          {
            key: 'team',
            label: 'Team',
            value: String(filters.team ?? 'ops'),
            options: [
              { label: 'Ops', value: 'ops' },
              { label: 'Growth', value: 'growth' },
            ],
          },
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onClearFilters={() => setFilters({})}
        activeFilterCount={Object.keys(filters).length}
        viewMode={viewMode === 'table' ? 'list' : 'cards'}
        onViewModeChange={(mode) => setViewMode(mode === 'list' ? 'table' : 'cards')}
        density={density}
        onDensityChange={setDensity}
        primaryAction={{ label: 'Invite member', onClick: () => undefined }}
        onExport={() => undefined}
      />
    </Box>
  );
}

function BulkSelectPreview() {
  const [active, setActive] = useState(true);

  return (
    <BulkSelectToggle
      active={active}
      onToggle={() => setActive((current) => !current)}
      selectedCount={3}
    />
  );
}

function StatusFilterPillsPreview() {
  const [value, setValue] = useState('active');

  return (
    <StatusFilterPills
      options={[
        { value: 'active', label: 'Active', count: 24 },
        { value: 'review', label: 'Review', count: 6 },
        { value: 'paused', label: 'Paused', count: 3 },
      ]}
      value={value}
      onChange={setValue}
      showCounts
    />
  );
}

function CellRenderersPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternDataTable<SimpleUser>
        data={SIMPLE_USERS}
        rowKey="id"
        compact
        bordered
        hoverable
        columns={[
          {
            key: 'name',
            header: 'Person',
            accessorKey: 'name',
            render: (_value: unknown, row: SimpleUser) =>
              cellRenderers.avatarName(row.name, row.email),
          },
          {
            key: 'status',
            header: 'Status',
            accessorKey: 'status',
            render: (_value: unknown, row: SimpleUser) =>
              cellRenderers.statusBadge(
                row.status === 'review' ? 'Needs review' : row.status,
                row.status === 'active'
                  ? 'success'
                  : row.status === 'paused'
                    ? 'warning'
                    : 'primary',
              ),
          },
          {
            key: 'createdAt',
            header: 'Created',
            accessorKey: 'createdAt',
            render: (_value: unknown, row: SimpleUser) => cellRenderers.date(row.createdAt),
          },
        ]}
        toolbar={
          <Flex align="center" justify="between" gap={12} style={{ width: '100%' }}>
            <Text size="sm" weight="semibold">
              Cell renderer helpers inside PatternDataTable
            </Text>
            <Badge variant="secondary">avatarName / statusBadge / date</Badge>
          </Flex>
        }
      />
    </Box>
  );
}

function AssistantPreview() {
  // Local state drives the two sighted transitions: shimmer live -> stopped,
  // and the confirm ceremony resolving to a terminal outcome.
  const [streaming, setStreaming] = useState(true);
  const [decision, setDecision] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');

  return (
    <Stack spacing="md" style={{ width: '100%', maxWidth: 760 }}>
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <Flex gap={8} align="center" style={{ flexWrap: 'wrap' }}>
          <Text size="sm" weight="semibold">
            Assistant kit: streaming, receipts, diff/confirm, and status
          </Text>
          <AssistantStatusBadge label="streaming" tone="info" />
        </Flex>
        <TypingIndicator label="Assistant is preparing the rollout brief" />
      </Flex>

      {/* Agent status set: thinking/streaming/acting animate; idle/error hold static. */}
      <Flex gap={16} align="center" style={{ flexWrap: 'wrap' }}>
        <AssistantStatusIndicator status="idle" />
        <AssistantStatusIndicator status="thinking" />
        <AssistantStatusIndicator status="streaming" />
        <AssistantStatusIndicator status="acting" />
        <AssistantStatusIndicator status="error" />
      </Flex>

      <MessageBubble
        author="Daniel"
        role="user"
        align="end"
        deliveryStatus="sent"
        avatar={<Avatar size="sm">D</Avatar>}
        timestamp="2 min ago"
        parts={[
          {
            type: 'text',
            content: 'Summarize the current rollout state and highlight blocked approvals.',
          },
        ]}
      />

      <MessageBubble
        author="Rottay Assistant"
        role="assistant"
        deliveryStatus="streaming"
        avatar={<Avatar size="sm">AI</Avatar>}
        timestamp="just now"
        parts={[
          {
            type: 'markdown',
            content:
              'Approvals are clear for Finance and Ops. Legal still has 2 contracts in review and one vendor exception is awaiting a decision.',
            streaming,
          },
          {
            type: 'tool-status',
            name: 'approval_audit',
            status: 'complete',
            summary: 'Checked current approval queues across tenants.',
            duration: '0.8s',
            meta: <Text size="xs">2 pending legal approvals, 1 vendor exception.</Text>,
          },
        ]}
      />

      {/* Streaming law: the shimmer runs only while live and stops on completion. */}
      <Card variant="outlined">
        <Card.Body>
          <Stack spacing="sm">
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Text size="sm" weight="semibold">
                Streaming text {streaming ? '(live)' : '(complete)'}
              </Text>
              <Button size="sm" variant="secondary" onClick={() => setStreaming((value) => !value)}>
                {streaming ? 'Complete response' : 'Restart stream'}
              </Button>
            </Flex>
            <StreamingText
              text="Drafting the rollout brief: approvals cleared for Finance and Ops, legal contracts still pending, and one vendor exception to decide."
              streaming={streaming}
            />
          </Stack>
        </Card.Body>
      </Card>

      {/* Tool call running -> terminal receipt (compact outcome + elapsed time). */}
      <ToolCallCard
        name="scan_approvals"
        status="running"
        summary="Scanning approval queues across tenants..."
        input="scope=all-tenants"
      />
      <ToolCallCard
        name="scan_approvals"
        status="complete"
        summary="Scanned approval queues across tenants."
        duration="0.9s"
        meta={<Text size="xs">Target channel: cmd+k runtime bulletin</Text>}
      />

      {/* Preview-confirm ceremony: proposed diff, then a confirm/cancel surface. */}
      <PreviewDiffCard
        title="Proposed rollout change"
        rows={[
          { label: 'Stage', before: 'Draft', after: 'Scheduled', change: 'updated' },
          { label: 'Notify channel', after: 'cmd+k runtime bulletin', change: 'added' },
          { label: 'Legal hold', before: 'On', change: 'removed' },
        ]}
      />

      {decision === 'pending' ? (
        <ConfirmActionCard
          title="Publish rollout update"
          summary="Applies the proposed change and notifies stakeholders in the cmd+k runtime bulletin."
          confirmLabel="Publish update"
          cancelLabel="Keep draft"
          onConfirm={() => setDecision('confirmed')}
          onCancel={() => setDecision('cancelled')}
        />
      ) : (
        <Flex gap={8} align="center" style={{ flexWrap: 'wrap' }}>
          <AssistantStatusBadge
            label={decision === 'confirmed' ? 'Update published' : 'Kept as draft'}
            tone={decision === 'confirmed' ? 'success' : 'neutral'}
          />
          <Button size="sm" variant="secondary" onClick={() => setDecision('pending')}>
            Reset
          </Button>
        </Flex>
      )}
    </Stack>
  );
}

function PresencePreview() {
  return (
    <Stack spacing="md" style={{ width: '100%', maxWidth: 640 }}>
      <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
        <PresenceBar
          users={[
            { id: 'u1', name: 'Ana', color: '#2563eb' },
            { id: 'u2', name: 'Marco', color: '#14b8a6' },
            { id: 'u3', name: 'Lina', color: '#a855f7' },
          ]}
        />
        <PresenceTypingIndicator users={[{ name: 'Ana' }, { name: 'Marco' }]} />
      </Flex>

      <Box
        style={{
          position: 'relative',
          minHeight: 180,
          borderRadius: 18,
          border: '1px solid var(--ds-color-border, #e5e7eb)',
          background: 'var(--ds-color-bg-elevated, #f8fafc)',
          overflow: 'hidden',
        }}
      >
        <Box style={{ padding: 16 }}>
          <Text size="sm" weight="semibold">
            Shared editing surface
          </Text>
          <Text size="sm" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
            Presence awareness stays real-time, but the visual layer comes from the shared DS primitives.
          </Text>
        </Box>
        <LiveCursor user={{ name: 'Ana', color: '#2563eb' }} position={{ x: 160, y: 88 }} />
        <LiveCursor user={{ name: 'Marco', color: '#14b8a6' }} position={{ x: 320, y: 132 }} />
      </Box>
    </Stack>
  );
}

function GridViewPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternGridView<GalleryAsset>
        data={GALLERY_ITEMS}
        rowKey="id"
        minColumnWidth={240}
        renderCard={(item) => (
          <Card style={{ boxShadow: 'none' }}>
            <Card.Body>
              <Stack spacing="sm">
                <Box
                  style={{
                    aspectRatio: '4 / 3',
                    borderRadius: 14,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Text size="sm" weight="semibold">
                  {item.title}
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {item.subtitle}
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        )}
      />
    </Box>
  );
}

function GalleryViewPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternGalleryView<GalleryAsset>
        data={GALLERY_ITEMS}
        rowKey="id"
        imageField="image"
        captionField="title"
        minColumnWidth={220}
        aspectRatio="4/3"
      />
    </Box>
  );
}

function ApprovalInboxPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 840 }}>
      <PatternApprovalInbox
        groups={[
          {
            domain: 'Finance',
            items: [
              {
                id: 'ap-1',
                title: 'Invoice #4521',
                subtitle: 'AV supplier payout',
                amount: 12500,
                risk: 'low',
                submittedAt: '2026-04-18T09:00:00Z',
                slaDeadline: '2026-04-21T17:00:00Z',
              },
            ],
          },
          {
            domain: 'Legal',
            items: [
              {
                id: 'ap-2',
                title: 'Venue contract revision',
                subtitle: 'Main hall amendment',
                amount: 48000,
                risk: 'medium',
                submittedAt: '2026-04-19T11:30:00Z',
                slaDeadline: '2026-04-22T17:00:00Z',
              },
            ],
          },
        ]}
        onApprove={() => undefined}
        onReject={() => undefined}
        onBatchApprove={() => undefined}
      />
    </Box>
  );
}

function ModerationGalleryPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternModerationGallery
        items={[
          {
            id: 'mg-1',
            thumbnailUrl: createThumbnail('Pending', '#7c3aed'),
            type: 'image',
            status: 'pending',
            engagement: 142,
            uploadedBy: 'ops-team',
            uploadedAt: '2026-04-18T08:00:00Z',
          },
          {
            id: 'mg-2',
            thumbnailUrl: createThumbnail('Approved', '#0f766e'),
            type: 'image',
            status: 'approved',
            engagement: 284,
            uploadedBy: 'growth-team',
            uploadedAt: '2026-04-18T10:00:00Z',
          },
          {
            id: 'mg-3',
            thumbnailUrl: createThumbnail('Rejected', '#b91c1c'),
            type: 'video',
            status: 'rejected',
            engagement: 51,
            uploadedBy: 'partner',
            uploadedAt: '2026-04-19T13:00:00Z',
          },
        ]}
        selectable
        onApprove={() => undefined}
        onReject={() => undefined}
        onBulkAction={() => undefined}
      />
    </Box>
  );
}

function OperationalLedgerPreview() {
  const [filters, setFilters] = useState<any>({ types: ['credit', 'debit'] });

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternOperationalLedger
        entries={[
          {
            id: 'led-1',
            timestamp: '2026-04-18T10:00:00Z',
            description: 'Sponsorship deposit',
            quantity: 15000,
            type: 'credit',
            actor: 'Finance bot',
            reason: 'SPN-018',
          },
          {
            id: 'led-2',
            timestamp: '2026-04-19T14:30:00Z',
            description: 'Venue payment',
            quantity: 4800,
            type: 'debit',
            actor: 'Ops team',
            reference: 'INV-1184',
          },
        ]}
        filters={filters}
        onFilter={setFilters}
      />
    </Box>
  );
}

function ShiftMatrixPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternShiftMatrix
        roles={['Check-in', 'Security', 'Stage Crew']}
        timeSlots={[
          { label: '09:00-12:00', start: '09:00', end: '12:00' },
          { label: '12:00-15:00', start: '12:00', end: '15:00' },
          { label: '15:00-18:00', start: '15:00', end: '18:00' },
        ]}
        assignments={[
          {
            role: 'Check-in',
            timeSlot: '09:00-12:00',
            assigned: 3,
            required: 4,
            staff: ['Ana', 'Jules', 'Lina'],
          },
          {
            role: 'Security',
            timeSlot: '12:00-15:00',
            assigned: 4,
            required: 4,
            staff: ['Leo', 'Finn', 'Maya', 'Noah'],
          },
          {
            role: 'Stage Crew',
            timeSlot: '15:00-18:00',
            assigned: 2,
            required: 3,
            staff: ['Omar', 'June'],
          },
        ]}
        onQuickAssign={() => undefined}
      />
    </Box>
  );
}

function CockpitHeaderPreview() {
  return (
    <PatternCockpitHeader
      title="Venue Detail"
      subtitle="Operational view for the main event shell"
      breadcrumbs={[
        { label: 'Venues', href: '/venues' },
        { label: 'Harbor Hall' },
      ]}
      status={[
        { label: 'Live', variant: 'success' },
        { label: 'Premium', variant: 'info' },
      ]}
      actions={<Button size="sm">Edit venue</Button>}
      onBack={() => undefined}
    />
  );
}

function WorkbenchHeaderPreview() {
  const [activeViewId, setActiveViewId] = useState('overview');

  return (
    <PatternWorkbenchHeader
      title="Operations Dashboard"
      subtitle="Morning briefing"
      exceptionCount={3}
      quickActions={[
        { label: 'New event', onClick: () => undefined, variant: 'primary' },
        { label: 'Export', onClick: () => undefined },
      ]}
      savedViews={[
        { id: 'overview', label: 'Overview' },
        { id: 'alerts', label: 'Alerts' },
      ]}
      activeViewId={activeViewId}
      onViewChange={setActiveViewId}
    />
  );
}

function CommandPalettePreview() {
  return (
    <PatternCommandPalette
      open
      onOpenChange={() => undefined}
      placeholder="Jump to a surface or action"
      items={[
        { id: 'cmd-1', label: 'Open dashboard', group: 'Navigation', onSelect: () => undefined },
        { id: 'cmd-2', label: 'Review approvals', group: 'Actions', onSelect: () => undefined },
      ]}
      recentItems={[
        { id: 'recent-1', label: 'Create event', group: 'Recent', onSelect: () => undefined },
      ]}
    />
  );
}

function ShortcutsOverlayPreview() {
  return (
    <PatternShortcutsOverlay
      open
      onOpenChange={() => undefined}
      title="Keyboard shortcuts"
      shortcuts={[
        { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
        { key: 'shift+?', description: 'Show keyboard shortcuts', category: 'Global' },
        { key: 'g+d', description: 'Go to dashboard', category: 'Navigation' },
        { key: 'c', description: 'Create item', category: 'Actions' },
      ]}
      footer="Press Esc to close"
    />
  );
}

function AdaptiveOverlayPreview() {
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing={12}>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The same feedback flow resolves to a modal, drawer, or bottom sheet for the active device class.
      </Text>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open adaptive review
      </Button>
      <AdaptiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Review workspace changes"
        footer={(
          <Flex gap={8} justify="end">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </Flex>
        )}
      >
        <Text size="sm">
          Content and actions stay consistent while the overlay posture adapts to the viewport.
        </Text>
      </AdaptiveOverlay>
    </Stack>
  );
}

const PATTERN_PREVIEWS: Record<string, ReactNode> = {
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
  'branding-preview-sandbox': (
    <HonestMigrationNote
      title="BrandingPreviewSandbox adapter pending"
      description="This developer-oriented preview exists in the DS, but it still needs a dedicated showroom adapter with a real tenant appearance payload instead of a fake local mock."
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
  'cell-renderers': <CellRenderersPreview />,
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
  'tenant-preview': (
    <HonestMigrationNote
      title="PatternTenantPreview adapter pending"
      description="The DS export is real, but this showroom route still needs a proper TenantCreationConfig fixture so the tenant preview reflects actual token authoring instead of a hardcoded local shell."
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
  'token-inspector': (
    <HonestMigrationNote
      title="TokenInspector is runtime-driven"
      description="This dev-only inspector activates from the live app with Ctrl+Shift+T, so the honest showroom treatment is a dedicated developer page rather than a fake static card."
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

export function renderPatternPreview(slug: string) {
  return PATTERN_PREVIEWS[slug] ?? null;
}
