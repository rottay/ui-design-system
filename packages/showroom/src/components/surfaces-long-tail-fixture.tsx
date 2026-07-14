'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  ActivitySurface,
  AuditSurface,
  AuthSurface,
  BillingSurface,
  Box,
  BulkSelectToggle,
  Card,
  ChatSurface,
  CollectionWorkspaceSurface,
  CommandCenterSurface,
  CompareSurface,
  DashboardSurface,
  DecisionInboxSurface,
  EditorSurface,
  HeaderSurface,
  ImportExportSurface,
  IntegrationSurface,
  KanbanSurface,
  ListSurface,
  MarketingSurface,
  MediaSurface,
  NotificationSurface,
  PatternGalleryView,
  PatternGridView,
  PatternStatsGrid,
  PricingSurface,
  ProfileSurface,
  RecordWorkbenchSurface,
  ReportSurface,
  SearchSurface,
  SettingsSurface,
  SidebarSurface,
  Stack,
  SurfaceEmptyState,
  SurfaceEmptyStateCard,
  SurfaceErrorState,
  SurfaceErrorStateCard,
  SurfaceLoadingSkeleton,
  SurfaceLoadingState,
  SurfaceOfflineBanner,
  SurfaceStaleBanner,
  TeamSurface,
  Text,
  VisualizationSurface,
  WorkspaceShell,
  cellRenderers,
  type ColumnDef,
  type EntityAdapter,
} from '@rottay/design-system';

// CK-I is intentionally a pre-migration fixture. It renders the public entry
// points that own the 39 long-tail source renderables without changing their
// paint. Every child gets a stable test id so the visual spec can assert that
// the fixture is populated before it records a family-level screenshot.

const noop = () => undefined;
const asyncNoop = async () => undefined;

const ROOT_STYLE: CSSProperties = {
  borderRadius: 16,
  border: '1px solid var(--ds-color-border)',
  background: 'var(--ds-color-bg-elevated)',
  padding: 16,
};

const CASE_STYLE: CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--ds-color-border)',
  background: 'var(--ds-color-bg-primary)',
  padding: 16,
  overflow: 'hidden',
};

const MINI_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
};

interface LongTailRecord {
  id: string;
  name: string;
  status: string;
  stage: string;
  score: number;
  image: string;
}

const LONG_TAIL_ROWS: LongTailRecord[] = [
  { id: 'lt-1', name: 'Alpha workspace', status: 'active', stage: 'review', score: 92, image: '' },
  { id: 'lt-2', name: 'Beta workspace', status: 'paused', stage: 'approved', score: 58, image: '' },
  { id: 'lt-3', name: 'Gamma workspace', status: 'active', stage: 'review', score: 24, image: '' },
];

const LONG_TAIL_COLUMNS: ColumnDef<LongTailRecord>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
  { key: 'status', header: 'Status', accessorKey: 'status' },
  { key: 'score', header: 'Score', accessorKey: 'score' },
];

const LONG_TAIL_ADAPTER: EntityAdapter<LongTailRecord, LongTailRecord> = {
  entity: 'long-tail-record',
  version: '1.0.0',
  map: (row) => row,
  fields: [
    { key: 'name', fieldId: 'long-tail.name' },
    { key: 'status', fieldId: 'long-tail.status' },
    { key: 'score', fieldId: 'long-tail.score' },
  ],
};

function LongTailIcon({
  size = 14,
  style,
  className,
  'data-part': dataPart,
}: {
  size?: number;
  style?: CSSProperties;
  className?: string;
  'data-part'?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className}
      data-part={dataPart}
      style={{ display: 'inline-grid', width: size, height: size, placeItems: 'center', ...style }}
    >
      {'\u2022'}
    </span>
  );
}

function Case({
  id,
  label,
  children,
  sourceCount = 1,
}: {
  id: string;
  label: string;
  children: ReactNode;
  sourceCount?: number;
}) {
  return (
    <Stack
      data-testid={`probe-long-tail-${id}`}
      data-long-tail-case={id}
      data-source-count={sourceCount}
      spacing="sm"
      style={CASE_STYLE}
    >
      <Text size="xs" color="secondary">{label}</Text>
      {children}
    </Stack>
  );
}

function Family({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Stack data-testid={`probe-long-tail-${id}`} spacing="md" style={ROOT_STYLE}>
      <Text size="md" weight="semibold">{title}</Text>
      {children}
    </Stack>
  );
}

function PatternsFamily() {
  return (
    <Family id="patterns" title="Patterns / data">
      <Case id="patterns-stats" label="stats-grid: increase/decrease/flat, sparkline, clickable cards">
        <PatternStatsGrid
          stats={[
            { key: 'revenue', label: 'Revenue', value: '$42k', change: 12, changeType: 'increase', sparklineData: [8, 13, 11, 18, 24] },
            { key: 'churn', label: 'Churn', value: '2.1%', change: -3, changeType: 'decrease', sparklineData: [8, 7, 6, 5, 4] },
            { key: 'latency', label: 'Latency', value: '88ms', change: 0, changeType: 'neutral' },
          ]}
          columns={3}
          sparkline
          animate={false}
          variant="outlined"
          onStatClick={noop}
        />
      </Case>

      <Case id="patterns-gallery" label="gallery-view: selected/unselected, image placeholder, pagination">
        <PatternGalleryView
          data={LONG_TAIL_ROWS}
          imageField="image"
          captionField="name"
          rowKey="id"
          columns={3}
          aspectRatio="4/3"
          selectable
          selectedKeys={['lt-1']}
          onSelectionChange={noop}
          onItemClick={noop}
          pagination={{ current: 1, pageSize: 3, total: 7, onChange: noop }}
        />
      </Case>

      <Case id="patterns-grid" label="grid-view: selected/unselected cards and checkbox overlays">
        <PatternGridView
          data={LONG_TAIL_ROWS}
          rowKey="id"
          columns={3}
          selectable
          selectedKeys={['lt-2']}
          onSelectionChange={noop}
          pagination={false}
          renderCard={(row) => (
            <Card variant="outlined">
              <Card.Body>
                <Stack spacing="xs">
                  <Text weight="semibold">{row.name}</Text>
                  <Text size="xs" color="secondary">{row.status}</Text>
                </Stack>
              </Card.Body>
            </Card>
          )}
        />
      </Case>

      <Case id="patterns-cell-renderers" label="cell-renderers: all reusable value branches">
        <Box style={{ ...MINI_GRID_STYLE, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {cellRenderers.avatarName('Ari Chen', 'ari@example.test')}
          {cellRenderers.nameStack('Beta record', 'Muted subtitle')}
          {cellRenderers.statusBadge('Active', 'success')}
          {cellRenderers.simpleBadge('Review', 'warning')}
          {cellRenderers.mono('rec_01JXYZ', { color: 'var(--ds-color-info)' })}
          {cellRenderers.iconText(LongTailIcon, 'Owner team')}
          {cellRenderers.countWithIcon(LongTailIcon, 12, 'records')}
          {cellRenderers.date('2026-07-14T12:00:00.000Z', { format: 'short', mono: true })}
          {cellRenderers.tags(['AI', 'Platform', 'Priority', 'Overflow'], { maxDisplay: 3 })}
          {cellRenderers.score(92)}
          {cellRenderers.score(58)}
          {cellRenderers.score(24)}
          {cellRenderers.boolean(true)}
          {cellRenderers.boolean(false)}
          {cellRenderers.truncated('A deliberately long value that proves ellipsis styling', 150)}
        </Box>
      </Case>

      <Case id="patterns-bulk-select" label="bulk-select-toggle: inactive, active empty, active selected">
        <Stack direction="horizontal" spacing="md" align="center" wrap>
          <BulkSelectToggle active={false} onToggle={noop} />
          <BulkSelectToggle active onToggle={noop} selectedCount={0} />
          <BulkSelectToggle active onToggle={noop} selectedCount={3} />
        </Stack>
      </Case>
    </Family>
  );
}

function FoundationFamily() {
  return (
    <Family id="foundation" title="Surface foundation">
      <Case id="foundation-shared" label="shared: tab label, permission-aware action bar, section card">
        <HeaderSurface
          config={{
            visual: { tabsType: 'card' },
            presentation: {
              chrome: { title: 'Shared foundation proof' },
              description: 'Muted description and section chrome',
            },
            behavior: {
              tabs: [
                { key: 'summary', label: 'Summary', badge: <span>3</span>, content: <Text>Visible shared content</Text> },
                { key: 'disabled', label: 'Disabled', disabled: true, content: <Text>Disabled content</Text> },
              ],
              actions: [
                { id: 'primary', label: 'Primary action', variant: 'primary', onClick: noop },
                { id: 'disabled', label: 'Disabled action', disabled: true, onClick: noop },
              ],
            },
          }}
        />
        <MediaSurface
          config={{
            visual: { layout: 'detail', columns: 1, previewHeight: 64 },
            presentation: {
              chrome: { title: 'Shared section-card proof' },
              renderGridItem: (item) => <Text>{item.title}</Text>,
              renderPreview: (item) => <Text>Preview: {item.title}</Text>,
              renderDetails: (item) => <Text>Details: {item.title}</Text>,
            },
            behavior: {
              items: [{ id: 'shared-1', src: '', title: 'Shared item' }],
              itemActions: [{ id: 'inspect', label: 'Inspect', onClick: noop }],
            },
          }}
        />
      </Case>

      <Case id="foundation-personality" label="personality helpers: profile accent wrapper and responsive section spacing">
        <DashboardSurface
          config={{
            visual: { statsColumns: 2, profileOverrides: { accentPosition: 'top', accentBarStyle: 'gradient' } },
            presentation: {
              chrome: { title: 'Personality proof' },
              sections: [{ key: 'personality', title: 'Accent section', description: 'Profile-driven chrome', content: <Text>Section content</Text> }],
            },
            behavior: { stats: [{ key: 'quality', label: 'Quality', value: 'A+' }] },
          }}
        />
      </Case>

      <Case id="foundation-states-core" label="states/index: loading, empty and error/retry">
        <Box style={MINI_GRID_STYLE}>
          <SurfaceLoadingState title="Loading records" description="Skeleton remains visible" lines={3} />
          <SurfaceEmptyState title="No records" description="Create the first one" action={{ id: 'create', label: 'Create', onClick: noop }} />
          <SurfaceErrorState error={new Error('Records unavailable')} onRetry={noop} />
        </Box>
      </Case>

      <Case id="foundation-states-lifecycle" label="surface-states: skeleton, empty, error, stale refreshing and offline cached">
        <Stack spacing="sm">
          <SurfaceLoadingSkeleton rows={3} showHeader />
          <Box style={MINI_GRID_STYLE}>
            <SurfaceEmptyStateCard title="Nothing here" description="Lifecycle empty state" icon="\u2205" action={{ label: 'Add record', onClick: noop }} />
            <SurfaceErrorStateCard error="Lifecycle failed" onRetry={noop} />
          </Box>
          <SurfaceStaleBanner message="Data may be stale" onRefresh={noop} refreshing />
          <SurfaceOfflineBanner message="You are offline" showCachedNotice />
        </Stack>
      </Case>
    </Family>
  );
}

function LayoutFamily() {
  return (
    <Family id="layout" title="Surface layout">
      <Case id="layout-collection-shell" label="collection-shell: atmospheric focus/preview state">
        <WorkspaceShell
          variant="ai-field"
          mood="focus"
          fieldPattern="ambient"
          intensity="low"
          continuity="seamless"
          focusReaction
          previewEmphasis
          focusActive
          previewActive
          style={{ minHeight: 150 }}
        >
          <Box style={{ padding: 20 }}>
            <Text weight="semibold">Atmospheric workspace shell</Text>
          </Box>
        </WorkspaceShell>
      </Case>

      <Case id="layout-header" label="header: metadata, active/disabled tabs, badge and action">
        <HeaderSurface
          config={{
            visual: { tabsType: 'line' },
            presentation: {
              chrome: { title: 'Header surface', subtitle: 'Page-level chrome' },
              description: 'Header description',
              metadata: <Text size="xs">Updated now</Text>,
            },
            behavior: {
              tabs: [
                { key: 'overview', label: 'Overview', badge: <span>2</span>, content: <Text>Overview panel</Text> },
                { key: 'activity', label: 'Activity', disabled: true, content: <Text>Activity panel</Text> },
              ],
              actions: [{ id: 'invite', label: 'Invite', variant: 'primary', onClick: noop }],
            },
          }}
        />
      </Case>

      <Case id="layout-sidebar" label="sidebar: expanded navigation, main, aside and disabled action">
        <SidebarSurface
          config={{
            visual: { collapsible: true, bordered: true, sidebarWidth: 220, asideWidth: 220 },
            presentation: {
              sidebar: <Stack spacing="xs"><Text>Overview</Text><Text color="secondary">Settings</Text></Stack>,
              content: <Text>Main workspace content</Text>,
              header: <Text weight="semibold">Workspace</Text>,
              aside: <Text>Context rail</Text>,
              footer: <Text size="xs" color="secondary">Navigation footer</Text>,
            },
            behavior: {
              toggleLabel: 'Collapse navigation',
              actions: [{ id: 'disabled', label: 'Unavailable', disabled: true, onClick: noop }],
            },
          }}
        />
      </Case>
    </Family>
  );
}

function WorkspaceFamily() {
  return (
    <Family id="workspace" title="Workspace surfaces">
      <Case
        id="workspace-collection"
        label="collection-workspace + render-dispatch: cards, selected/unselected, focus, preview and pagination"
        sourceCount={2}
      >
        <CollectionWorkspaceSurface
          title="Collection workspace"
          subtitle="Long-tail render dispatch proof"
          header={{
            eyebrow: 'Workspace',
            title: 'Collection workspace',
            subtitle: 'Premium cards and enhanced interactions',
          }}
          data={LONG_TAIL_ROWS}
          columns={LONG_TAIL_COLUMNS}
          rowKey="id"
          controls={{
            search: { enabled: true, value: '', placeholder: 'Search workspaces', onChange: noop },
            viewMode: { enabled: true, modes: ['table', 'cards'], value: 'cards', onChange: noop },
          }}
          behavior={{
            selection: { enabled: true, selectedKeys: ['lt-1'], onSelectionChange: noop },
            focus: { enabled: true, focusedKey: 'lt-2', onFocusChange: noop },
            previewRail: { enabled: true, render: (row) => <Text>Preview: {row.name}</Text> },
            pagination: { current: 1, pageSize: 2, total: 7, onChange: noop },
            bulkActions: [{ key: 'archive', label: 'Archive', onExecute: noop }],
          }}
          viewModes={{
            cards: {
              columns: 3,
              renderCard: (row) => (
                <Card variant="outlined">
                  <Card.Body>
                    <Stack spacing="xs">
                      <Text weight="semibold">{row.name}</Text>
                      <Text size="xs" color="secondary">{row.status}</Text>
                    </Stack>
                  </Card.Body>
                </Card>
              ),
            },
          }}
          presentation={{ bordered: true, enhancedInteractions: true, shell: { variant: 'default', focusReaction: true, previewEmphasis: true } }}
        />
        <CollectionWorkspaceSurface
          title="Preview collection"
          subtitle="Table posture with a visible preview rail"
          surfaceMode="embed"
          data={LONG_TAIL_ROWS}
          columns={LONG_TAIL_COLUMNS}
          rowKey="id"
          controls={{
            search: { enabled: true, value: '', placeholder: 'Search preview records', onChange: noop },
            viewMode: { enabled: true, modes: ['table'], value: 'table', onChange: noop },
          }}
          behavior={{
            focus: { enabled: true, focusedKey: 'lt-2', onFocusChange: noop },
            previewRail: { enabled: true, render: (row) => <Text>Preview: {row.name}</Text> },
          }}
          presentation={{ enhancedInteractions: true }}
        />
      </Case>

      <Case id="workspace-command-center" label="command-center: stat changes, actions, activity and all insight tones">
        <CommandCenterSurface
          title="Command center"
          greeting="Good morning"
          stats={[
            { key: 'active', label: 'Active', value: 18, change: { value: 12, direction: 'up' } },
            { key: 'risk', label: 'At risk', value: 3, change: { value: 2, direction: 'down' } },
          ]}
          quickActions={[
            { key: 'create', label: 'Create record', variant: 'primary', onClick: noop },
            { key: 'review', label: 'Review queue', variant: 'secondary', onClick: noop },
          ]}
          recentActivity={{ items: [{ id: 'a1', text: 'Workspace updated', timestamp: '2020-07-14T12:00:00.000Z', user: { name: 'Ari' } }], viewAllHref: '#activity' }}
          insights={[
            { id: 'i1', type: 'info', title: 'Info insight', description: 'Informational tone' },
            { id: 'i2', type: 'warning', title: 'Warning insight', description: 'Warning tone' },
            { id: 'i3', type: 'success', title: 'Success insight', description: 'Success tone' },
            { id: 'i4', type: 'error', title: 'Error insight', description: 'Error tone' },
          ]}
          sections={[{ key: 'body', title: 'Workspace health', render: () => <Text>Healthy and synchronized</Text> }]}
        />
      </Case>

      <Case id="workspace-decision-inbox" label="decision-inbox: batch selected state and primary/danger decisions">
        <DecisionInboxSurface
          queueName="Approval queue"
          subtitle="Two selected items"
          workspace={{
            data: LONG_TAIL_ROWS,
            behavior: { selection: { enabled: true, selectedKeys: ['lt-1', 'lt-2'] } },
          }}
          columns={LONG_TAIL_COLUMNS}
          rowKey="id"
          decisions={[
            { key: 'approve', label: 'Approve', variant: 'primary' },
            { key: 'reject', label: 'Reject', variant: 'danger', requiresReason: true },
          ]}
          onDecision={noop}
          batchDecisions
          onBatchDecision={noop}
          reviewRail={{ render: (row) => <Text>Reviewing {row.name}</Text> }}
        />
      </Case>

      <Case id="workspace-record-workbench" label="record-workbench: active tab, status, disabled action, metadata and related records">
        <RecordWorkbenchSurface
          title="Alpha workspace"
          subtitle="Workspace record"
          status={{ label: 'Active', variant: 'success' }}
          tabs={[
            { key: 'overview', label: 'Overview', render: () => <Text>Overview content</Text> },
            { key: 'history', label: 'History', badge: 5, render: () => <Text>History content</Text> },
          ]}
          defaultTab="overview"
          actions={[
            { key: 'edit', label: 'Edit', variant: 'primary', onClick: noop },
            { key: 'archive', label: 'Archive', disabled: true, onClick: noop },
          ]}
          metadata={[
            { key: 'owner', label: 'Owner', value: 'Ari Chen' },
            { key: 'updated', label: 'Updated', value: 'Today' },
          ]}
          relatedRecords={<Text>3 related records</Text>}
        />
      </Case>
    </Family>
  );
}

function AdminFamily() {
  return (
    <Family id="admin" title="Admin surfaces">
      <Case id="admin-audit" label="audit: info/critical severity, filters and export">
        <AuditSurface config={{
          visual: { density: 'comfortable' },
          presentation: { chrome: { title: 'Audit log', subtitle: 'System activity trail' } },
          behavior: {
            columns: [{ key: 'action', label: 'Action' }, { key: 'actor', label: 'Actor' }, { key: 'resource', label: 'Resource' }],
            entries: [
              { id: '1', timestamp: '2026-07-14 10:30', actor: 'admin@example.test', action: 'record.created', resource: 'Record #42', severity: 'info' },
              { id: '2', timestamp: '2026-07-14 11:00', actor: 'system', action: 'policy.blocked', resource: 'Workspace #7', severity: 'critical' },
            ],
            filters: [{ key: 'actor', label: 'Actor', type: 'text', placeholder: 'Search actor' }],
            onExport: noop,
          },
        }} />
      </Case>

      <Case id="admin-billing" label="billing: plan, mixed usage, invoice status and default payment">
        <BillingSurface config={{
          visual: { layout: 'sections' },
          presentation: { chrome: { title: 'Billing', subtitle: 'Subscription status' } },
          behavior: {
            currentPlan: { name: 'Enterprise', price: '$299', interval: 'month', features: ['Unlimited users', 'Priority support'] },
            usage: [{ label: 'API calls', current: 8500, limit: 10000, unit: 'calls' }, { label: 'Storage', current: 110, limit: 100, unit: 'GB' }],
            invoices: [{ id: 'inv-1', date: '2026-07-01', amount: '$299.00', status: 'paid' }, { id: 'inv-2', date: '2026-06-01', amount: '$299.00', status: 'overdue' }],
            paymentMethods: [{ id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true }],
            onUpgrade: noop,
            onCancel: noop,
            onDownloadInvoice: noop,
          },
        }} />
      </Case>

      <Case id="admin-import-export" label="import-export: formats, selected/unselected fields and completed/failed history">
        <ImportExportSurface config={{
          visual: {},
          presentation: { chrome: { title: 'Import / Export', subtitle: 'Bulk data operations' } },
          behavior: {
            mode: 'both',
            importConfig: { acceptedFormats: ['.csv', '.xlsx'], onUpload: async () => ({ success: true, totalRows: 10, validRows: 9, errorRows: 1 }), onConfirm: asyncNoop },
            exportConfig: {
              formats: ['csv', 'json'],
              fields: [{ key: 'name', label: 'Name', selected: true }, { key: 'email', label: 'Email', selected: false }],
              onExport: async () => '/export.csv',
            },
            history: [
              { id: 'h1', type: 'import', date: '2026-07-14', status: 'completed', recordCount: 10 },
              { id: 'h2', type: 'export', date: '2026-07-13', status: 'failed', recordCount: 0 },
            ],
          },
        }} />
      </Case>

      <Case id="admin-integration" label="integration: active key/webhook and connected app">
        <IntegrationSurface config={{
          visual: { layout: 'sections' },
          presentation: { chrome: { title: 'Integrations' } },
          behavior: {
            apiKeys: [{ id: 'key-1', name: 'Development', key: 'sk_dev_visible', createdAt: '2026-07-14', status: 'active' }],
            webhooks: [{ id: 'hook-1', url: 'https://example.test/webhook', events: ['record.created'], status: 'paused' }],
            connectedApps: [{ id: 'app-1', name: 'Chat app', description: 'Team notifications', status: 'connected' }],
            onCreateKey: noop,
            onRevokeKey: noop,
            onCreateWebhook: noop,
            onDeleteWebhook: noop,
          },
        }} />
      </Case>

      <Case id="admin-profile" label="profile: editable/read-only fields and destructive action">
        <ProfileSurface config={{
          visual: { layout: 'stacked' },
          presentation: { chrome: { title: 'My profile' } },
          behavior: {
            sections: [{
              key: 'personal',
              label: 'Personal information',
              description: 'Profile details',
              fields: [
                { key: 'name', label: 'Full name', value: 'Ari Chen', type: 'text' },
                { key: 'email', label: 'Email', value: 'ari@example.test', type: 'email', readOnly: true },
              ],
            }],
            onSave: noop,
            onDeleteAccount: noop,
          },
        }} />
      </Case>

      <Case id="admin-settings" label="settings: active tab, disabled tab and badge">
        <SettingsSurface config={{
          visual: { tabsType: 'line' },
          presentation: { chrome: { title: 'Workspace settings' }, intro: 'Governance defaults' },
          behavior: {
            tabs: [
              { key: 'general', label: 'General', badge: <span>3</span>, content: <Text>General settings</Text> },
              { key: 'security', label: 'Security', disabled: true, content: <Text>Security settings</Text> },
            ],
            onTabChange: noop,
          },
        }} />
      </Case>

      <Case id="admin-team" label="team: active/invited statuses and roles">
        <TeamSurface config={{
          visual: { layout: 'table' },
          presentation: { chrome: { title: 'Team', subtitle: 'Members and roles' } },
          behavior: {
            members: [
              { id: 'm1', name: 'Ari Chen', email: 'ari@example.test', role: 'admin', status: 'active' },
              { id: 'm2', name: 'Bea Costa', email: 'bea@example.test', role: 'member', status: 'invited' },
            ],
            roles: [{ id: 'admin', label: 'Admin' }, { id: 'member', label: 'Member' }],
            onInvite: noop,
            onRemove: noop,
            onRoleChange: noop,
          },
        }} />
      </Case>
    </Family>
  );
}

function DataFamily() {
  return (
    <Family id="data" title="Data surfaces">
      <Case id="data-compare" label="compare: two subjects and highlighted feature rows">
        <CompareSurface config={{
          visual: {},
          presentation: { chrome: { title: 'Plan comparison' } },
          behavior: {
            subjects: [{ key: 'starter', label: 'Starter' }, { key: 'enterprise', label: 'Enterprise' }],
            sections: [{ key: 'capabilities', title: 'Capabilities', rows: [{ key: 'dashboards', label: 'Dashboards', values: { starter: 'Basic', enterprise: 'Advanced' } }] }],
          },
        }} />
      </Case>

      <Case id="data-dashboard" label="dashboard: metrics, action and muted section description">
        <DashboardSurface config={{
          visual: { statsColumns: 2, sectionsColumns: 12 },
          presentation: {
            chrome: { title: 'Operations dashboard', subtitle: 'Live status' },
            headerContent: <Text>Updated just now</Text>,
            sections: [{ key: 'open', title: 'Open items', description: 'Needs attention', span: 8, content: <Text>7 open records</Text> }],
          },
          behavior: {
            stats: [{ key: 'active', label: 'Active', value: 42 }, { key: 'blocked', label: 'Blocked', value: 3 }],
            headerActions: [{ id: 'refresh', label: 'Refresh', variant: 'primary', onClick: noop }],
          },
        }} />
      </Case>

      <Case id="data-list" label="list: table, active filter, custom cell and actions">
        <ListSurface
          data={LONG_TAIL_ROWS}
          adapter={LONG_TAIL_ADAPTER}
          config={{
            visual: { defaultView: 'table', mobileDefaultView: 'cards', allowViewSwitch: true },
            presentation: {
              chrome: { title: 'Records' },
              toolbarStart: <Text size="xs">Scoped records</Text>,
              renderCell: { 'long-tail.name': (value) => <Text weight="semibold">{String(value)}</Text> },
              renderCard: (row) => <Card variant="outlined"><Card.Body>{row.name}</Card.Body></Card>,
            },
            behavior: {
              columns: [
                { key: 'name', fieldId: 'long-tail.name', header: 'Name', accessorKey: 'name' },
                { key: 'status', fieldId: 'long-tail.status', header: 'Status', accessorKey: 'status' },
                { key: 'score', fieldId: 'long-tail.score', header: 'Score', accessorKey: 'score' },
              ],
              filters: [{ key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }] }],
              filterValues: { status: 'active' },
              pagination: false,
              primaryAction: { id: 'create', label: 'Create record', variant: 'primary', onClick: noop },
              rowActions: [{ id: 'view', label: 'View', onClick: noop }, { id: 'disabled', label: 'Disabled', disabled: true, onClick: noop }],
            },
          }}
        />
      </Case>

      <Case id="data-report" label="report: selected template, filters, summary and export">
        <ReportSurface config={{
          visual: { layout: 'top-filters' },
          presentation: { chrome: { title: 'Reports', subtitle: 'Generate and export' } },
          behavior: {
            templates: [{ id: 'revenue', name: 'Revenue report', description: 'Monthly breakdown', category: 'Finance' }, { id: 'activity', name: 'Activity report', category: 'Operations' }],
            selectedTemplate: 'revenue',
            onTemplateSelect: noop,
            filters: [{ key: 'region', label: 'Region', type: 'select', options: [{ label: 'North America', value: 'na' }] }],
            filterValues: { region: 'na' },
            onFilterChange: noop,
            onGenerate: async () => ({
              columns: [{ key: 'month', label: 'Month' }, { key: 'revenue', label: 'Revenue' }],
              rows: [{ month: 'July', revenue: '$45,000' }],
              summary: { Total: '$45,000' },
            }),
            onExport: noop,
            reportData: {
              columns: [{ key: 'month', label: 'Month' }, { key: 'revenue', label: 'Revenue' }],
              rows: [{ month: 'July', revenue: '$45,000' }],
              summary: { Total: '$45,000' },
            },
          },
        }} />
      </Case>

      <Case id="data-search" label="search: selected result, split preview, filter and action">
        <SearchSurface config={{
          visual: { layout: 'split', minQueryLength: 2 },
          presentation: {
            chrome: { title: 'Global search' },
            placeholder: 'Search records',
            resultPreview: (result) => <Text>Preview: {result.title}</Text>,
          },
          behavior: {
            query: 'al',
            onQueryChange: noop,
            results: [{ id: '1', title: 'Alpha workspace', description: 'Active workspace' }, { id: '2', title: 'Alpine project', description: 'Paused project' }],
            selectedResultId: '1',
            onSelectResult: noop,
            resultActions: [{ id: 'open', label: 'Open result', variant: 'primary', onClick: noop }],
            filters: [{ key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }] }],
            filterValues: { status: 'active' },
            onFilterChange: noop,
          },
        }} />
      </Case>

      <Case id="data-visualization" label="visualization: active view, disabled view, stat, aside and footer">
        <VisualizationSurface config={{
          visual: {},
          presentation: {
            chrome: { title: 'Analytics' },
            intro: <Text>Workspace metrics</Text>,
            aside: <Text>Visualization aside</Text>,
            footer: <Text size="xs">Data refreshed now</Text>,
          },
          behavior: {
            activeView: 'chart',
            views: [
              { key: 'chart', label: 'Chart', badge: <span>Live</span>, description: 'Primary chart', content: <Box style={{ height: 80, border: '1px dashed var(--ds-color-border)' }}>Chart slot</Box> },
              { key: 'table', label: 'Table', disabled: true, content: <Text>Table slot</Text> },
            ],
            stats: [{ key: 'revenue', label: 'Revenue', value: '$24k' }],
            onViewChange: noop,
          },
        }} />
      </Case>
    </Family>
  );
}

function ExperienceFamily() {
  return (
    <Family id="experience" title="Experience surfaces">
      <Case id="experience-notification" label="notification: unread/read, success/error and preferences on/off">
        <NotificationSurface config={{
          visual: { layout: 'sections' },
          presentation: { chrome: { title: 'Notifications' } },
          behavior: {
            notifications: [
              { id: 'n1', title: 'Deployment complete', message: 'Version 2.4 is live', timestamp: '2h ago', read: false, type: 'success' },
              { id: 'n2', title: 'Payment failed', message: 'Card declined', timestamp: '1d ago', read: true, type: 'error' },
            ],
            preferences: [
              { id: 'p1', label: 'Email notifications', channel: 'email', enabled: true, category: 'General' },
              { id: 'p2', label: 'Push notifications', channel: 'push', enabled: false, category: 'General' },
            ],
            onMarkRead: noop,
            onMarkAllRead: noop,
            onDelete: noop,
            onPreferenceChange: noop,
          },
        }} />
      </Case>

      <Case id="experience-auth" label="auth: split hero, form, top bar, actions and legal copy">
        <AuthSurface config={{
          visual: { layout: 'split', heroPosition: 'start' },
          presentation: {
            title: 'Sign in',
            subtitle: 'Access your workspace',
            form: <Box style={{ padding: 16, border: '1px solid var(--ds-color-border)' }}>Authentication form</Box>,
            hero: <Box style={{ minHeight: 120, padding: 16, background: 'var(--ds-color-bg-secondary)' }}>Desktop hero</Box>,
            topBar: <Text size="xs">Tenant identity</Text>,
            legal: <Text size="xs" color="secondary">Terms and privacy</Text>,
          },
          behavior: { actions: [{ id: 'sso', label: 'Continue with SSO', onClick: noop }] },
        }} />
      </Case>

      <Case id="experience-marketing" label="marketing: eyebrow/badge, editorial hero, actions, section and footer">
        <MarketingSurface config={{
          visual: { maxWidth: 1100, heroPosition: 'end' },
          presentation: {
            eyebrow: 'AI workspace',
            badge: 'New',
            title: 'Build a coherent operation',
            description: 'A deliberately rich marketing surface for the long-tail proof.',
            supporting: <Text size="sm">Trusted by modern teams</Text>,
            hero: <Box style={{ minHeight: 160, padding: 20, border: '1px solid var(--ds-color-border)' }}>Product preview</Box>,
            sections: [<Text key="section">Feature section</Text>],
            footer: <Text size="xs">Marketing footer</Text>,
          },
          behavior: { actions: [{ id: 'start', label: 'Get started', variant: 'primary', onClick: noop }, { id: 'demo', label: 'View demo', onClick: noop }] },
        }} />
      </Case>

      <Case id="experience-media" label="media: selected/unselected items, detail rail and action">
        <MediaSurface config={{
          visual: { layout: 'detail', columns: 2, previewHeight: 120 },
          presentation: {
            chrome: { title: 'Media library' },
            renderGridItem: (item, state) => <Card variant="outlined"><Card.Body><Text weight="semibold">{item.title}</Text><Text size="xs" color="secondary">{state.selected ? 'Selected' : 'Not selected'}</Text></Card.Body></Card>,
            renderPreview: (item) => <Box style={{ height: 100, background: 'var(--ds-color-bg-secondary)', padding: 12 }}>Preview: {item.title}</Box>,
            renderDetails: (item) => <Text>Details for {item.title}</Text>,
          },
          behavior: {
            items: [
              { id: 'asset-1', src: '', title: 'Hero asset', description: 'Selected image' },
              { id: 'asset-2', src: '', title: 'Detail asset', description: 'Unselected image' },
            ],
            selectedItemId: 'asset-1',
            itemActions: [{ id: 'promote', label: 'Promote asset', variant: 'primary', onClick: noop }],
            onSelectItem: noop,
          },
        }} />
      </Case>

      <Case id="experience-chat" label="chat: streaming assistant, tool status, sidebar and disabled composer action">
        <ChatSurface config={{
          visual: { composerRows: 3 },
          presentation: {
            chrome: { title: 'Copilot chat' },
            composerPlaceholder: 'Ask the copilot',
            headerContent: <Text size="xs">Assistant online</Text>,
            sidebar: <Text>Conversation context</Text>,
          },
          behavior: {
            messages: [{
              id: 'm1',
              author: 'Assistant',
              role: 'assistant',
              deliveryStatus: 'streaming',
              parts: [
                { type: 'text', content: 'Searching the workspace', streaming: true },
                { type: 'tool-status', name: 'search_records', status: 'complete', summary: '3 matches' },
              ],
            }],
            assistantTyping: true,
            sending: true,
            onSend: noop,
          },
        }} />
      </Case>

      <Case id="experience-editor" label="editor: split preview, toolbar/status and loading publish action">
        <EditorSurface config={{
          visual: { layout: 'split' },
          presentation: {
            chrome: { title: 'Compose article' },
            description: 'Collaborative editing',
            helperText: 'Review before publishing.',
            toolbar: <Text>Editor toolbar</Text>,
            preview: <Text>Preview panel</Text>,
            statusBar: <Text size="xs">Saved just now</Text>,
          },
          behavior: {
            initialValue: 'Draft copy',
            saveAction: { id: 'save', label: 'Save draft', onClick: noop },
            publishAction: { id: 'publish', label: 'Publish', loading: true, onClick: noop },
            cancelAction: { id: 'cancel', label: 'Cancel', onClick: noop },
          },
        }} />
      </Case>

      <Case id="experience-pricing" label="pricing surface: monthly cycle, current/highlighted plans and feature states">
        <PricingSurface config={{
          visual: {},
          presentation: { chrome: { title: 'Pricing', subtitle: 'Choose a plan' }, intro: 'All plans include a trial.' },
          behavior: {
            plans: [
              { id: 'starter', name: 'Starter', price: 29, cta: 'Get started', features: { users: '5', support: true } },
              { id: 'pro', name: 'Pro', price: 99, cta: 'Upgrade', popular: true, features: { users: 'Unlimited', support: false } },
            ],
            features: [{ key: 'users', label: 'Users' }, { key: 'support', label: 'Priority support' }],
            currentPlan: 'starter',
            billingCycle: 'monthly',
            onSelectPlan: noop,
            onBillingCycleChange: noop,
          },
        }} />
      </Case>
    </Family>
  );
}

function OperationsFamily() {
  return (
    <Family id="operations" title="Operations surfaces">
      <Case id="operations-activity" label="activity: actors, actions and pagination divider/footer">
        <ActivitySurface config={{
          visual: {},
          presentation: { chrome: { title: 'Activity log', subtitle: 'Recent platform actions' } },
          behavior: {
            activities: [
              { id: 'a1', user: { name: 'Ari Chen' }, action: 'Created document', timestamp: '2020-07-14T10:30:00Z', entityType: 'document' },
              { id: 'a2', user: { name: 'Bea Costa' }, action: 'Updated settings', timestamp: '2020-07-13T09:15:00Z', entityType: 'settings' },
            ],
            pagination: { current: 1, total: 50, pageSize: 10, onChange: noop },
            onActivityClick: noop,
          },
        }} />
      </Case>

      <Case id="operations-kanban" label="kanban: colored columns, active and empty states">
        <KanbanSurface config={{
          visual: {},
          presentation: { chrome: { title: 'Project board', subtitle: 'Tasks across stages' } },
          behavior: {
            columns: [
              { id: 'todo', title: 'To do', color: 'var(--ds-color-info)', items: [{ id: 'c1', title: 'Design mockups' }, { id: 'c2', title: 'Write specs' }] },
              { id: 'progress', title: 'In progress', color: 'var(--ds-color-warning)', items: [{ id: 'c3', title: 'Build API' }] },
              { id: 'done', title: 'Done', color: 'var(--ds-color-success)', items: [] },
            ],
            onCardMove: noop,
          },
        }} />
      </Case>
    </Family>
  );
}

export function SurfacesLongTailFixture() {
  return (
    <Stack data-testid="probe-long-tail" spacing="lg" fullWidth>
      <PatternsFamily />
      <FoundationFamily />
      <LayoutFamily />
      <WorkspaceFamily />
      <AdminFamily />
      <DataFamily />
      <ExperienceFamily />
      <OperationsFamily />
    </Stack>
  );
}
