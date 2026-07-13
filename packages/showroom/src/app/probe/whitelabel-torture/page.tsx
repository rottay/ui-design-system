'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Stack,
  Text,
  Button,
  Badge,
  Input,
  Card,
  Table,
  Toast,
  FieldFiltersPanel,
  PatternFilterPanel,
  SelectionPreviewRail,
  PatternDetailPanel,
  PatternDataTable,
  Slider,
  InputNumber,
  PasswordInput,
  Radio,
  TagInput,
  Checkbox,
  Form,
  Toggle,
  Switch,
  OTPInput,
  Textarea,
  FormField,
  VoiceInputButton,
  Select,
  TreeSelect,
  Cascader,
  AutoComplete,
  Mentions,
  DatePicker,
  TimePicker,
  Upload,
  Transfer,
  ColorPicker,
  Alert,
  Progress,
  Skeleton,
  Spinner,
  Rate,
  Modal,
  Drawer,
  ToastProvider,
  useToast,
  MessageItem,
  NotificationItem,
  Result,
  Menu,
  FloatButton,
  Tabs,
  Steps,
  Stepper,
  Pagination,
  Segmented,
  BackTop,
  Breadcrumb,
  BottomTabBar,
  Anchor,
  MobileHeader,
  ActionDock,
  Affix,
  NavLink,
  OverlayModal,
  Tour,
  ConfirmDialog,
  AlertDialog,
  Popconfirm,
  Sheet,
  ContextMenu,
  Popover,
  Dropdown,
  HoverCard,
  Watermark,
  type FieldFilterDefinition,
  type FieldFilterPreset,
  type FieldFilterVisual,
  type FilterDef,
  type SelectionPreviewRailColumn,
  type DetailPanelProps,
  type ColumnDef,
} from '@rottay/design-system';
import { TagIcon } from '@rottay/design-system/icons';
import { StateGallery, FLAGSHIP_SLUGS } from '@/components/state-gallery';
import {
  TortureSurface,
  TORTURE_FIXTURES,
  type TortureFixture,
  type ProbeEngine,
} from '@/components/torture-surface';

// ---------------------------------------------------------------------------
// Whitelabel torture probe (WO-GAT-03 hostile-tenant whitelabel proof)
//
// Chrome-free capture route so a screenshot is pure component evidence. One
// fixture per load -- tenant, theme, and text direction are all html-anchored
// (see components/torture-surface), so there is no side-by-side comparison,
// only repeat loads driven by query params:
//   ?fixture=torture-dark|torture-light|rottay|bithire|evnto|themanagementmiami
//                                                 which fixture owns the page (default torture-dark)
//   ?engine=modern|rustic|classic                which engine renders (default modern)
//   ?rtl=1                                       Arabic locale + RTL proof block
//   ?slug=button                                 capture a single flagship in isolation
//   ?w=360|768|1280                              fixed content width for the responsive law
//
// torture-dark and torture-light compile their CSS at render via the dynamic
// tenant path and are never registered as product tenants or build artifacts.
// ?fixture=rottay is the REFERENCE load the differential probe compares
// against, and it stays structurally identical to the torture loads (same
// provider, same layout, same slugs) so any visual delta is attributable to
// the tenant alone. ?fixture=bithire and ?fixture=themanagementmiami render
// the bithire vertical's two real tenants for sighted side-by-side review
// (WO-ENG-20) using this same flagship set and capture width, not the
// differential violation count.
// ---------------------------------------------------------------------------

const CAPTURE_WIDTHS: Record<string, number> = {
  '360': 360,
  '768': 768,
  '1280': 1280,
};

// Real Arabic strings used to prove RTL mirroring and overflow handling.
// long label -> Button content + Badge content (neither has its own named field)
// long value -> Input defaultValue
// long title -> Card title
const ARABIC_LONG_LABEL = 'إدارة المستأجرين والأذونات على مستوى المنصة بالكامل';
const ARABIC_LONG_VALUE = 'قيمة طويلة جدًا للتحقق من عدم اقتطاع النص في الواجهة العربية';
const ARABIC_LONG_TITLE = 'لوحة تحكم المشرف العام لإدارة الحسابات';

const EXTRAS_ROWS = [{ key: 'op-14', name: 'Operations', owner: 'Daniel' }];
const EXTRAS_COLUMNS = [
  { key: 'name', title: 'Workspace', dataIndex: 'name' },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
];

// Fixed three-row set for the Table interaction-state probe. Row `r2` is
// pre-selected (below), so it sits at body-row index 1.
const TABLE_STATE_ROWS = [
  { key: 'r1', name: 'Alpha', owner: 'Ana' },
  { key: 'r2', name: 'Bravo', owner: 'Ben' },
  { key: 'r3', name: 'Charlie', owner: 'Cara' },
];
const TABLE_STATE_COLUMNS = [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: true },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
];

// Fixed filter set for the FieldFiltersPanel data-part probe (WO-ARC-09
// checkpoint 2). Covers every branch the panel renders: `status` is a
// `select` with 7 options (crosses the >6 threshold into the searchable
// branch), `region` is an `enum` with 3, `joinedAt` is a `date-range`, and
// `owner` falls through to the free-text Input branch. `status` carries the
// one active value in FIELD_FILTERS_VALUES, so it also exercises the
// non-placeholder Select and the primary-tone InlineSignal.
const FIELD_FILTERS_DEFINITIONS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'In review' },
      { value: 'expired', label: 'Expired' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'enum',
    placeholder: 'All regions',
    options: [
      { value: 'emea', label: 'EMEA' },
      { value: 'amer', label: 'AMER' },
      { value: 'apac', label: 'APAC' },
    ],
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    type: 'date-range',
    placeholder: 'Any time',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    type: 'multi-select',
    placeholder: 'Search owner',
  },
];

const FIELD_FILTERS_PRESETS: FieldFilterPreset[] = [
  { key: 'active-emea', label: 'Active in EMEA', values: { status: 'active', region: 'emea' } },
  { key: 'new-joins', label: 'New joins', values: { joinedAt: '30d', status: 'active' } },
];

const FIELD_FILTERS_VALUES: Record<string, string> = {
  status: 'active',
  region: '',
  joinedAt: '',
  owner: '',
};

const FIELD_FILTERS_VISUALS: Record<string, FieldFilterVisual> = {
  status: { icon: <TagIcon style={{ width: 15, height: 15 }} />, description: 'Filter by lifecycle status.' },
};

// Chrome the WO-ENG-02 flagship galleries never reach, rendered so the probe
// can prove those tenant channels too:
//   - Badge via `content` (its standalone branch). The gallery's
//     `<Badge>{label}</Badge>` form takes Badge's hidden-badge branch and paints
//     no chrome at all, so it cannot answer "does the badge follow the tenant?".
//   - Table with `bordered`, the only mode in which the primitive paints
//     --ds-table-border on its root and header cells.
//   - Card with `variant="outlined"`, the only variant whose border-width is
//     non-zero and therefore the only one where --ds-card-border is observable.
function ChromeExtras() {
  return (
    <Stack spacing="md" fullWidth>
      {/* Boxed so the stack's stretch alignment cannot widen the badge past its
          intrinsic size — a full-bleed badge would misread as a broken capture. */}
      {/* Explicitly solid: the derivation probe asserts this background equals
          the tenant's primary. The soft default paints a 10% tint of it, which
          is a different assertion and would silence this one. */}
      <Box>
        <Badge variant="primary" badgeStyle="solid" content="Beta" />
      </Box>
      <Table rowKey="key" bordered pagination={false} dataSource={EXTRAS_ROWS} columns={EXTRAS_COLUMNS} />
      <Card variant="outlined" title="Outlined" style={{ width: 240 }} />
      {/* duration=0 keeps this mounted for the probe read; the default variant
          is the only one with no --ds-toast-* channel of its own (WO-ENG-21). */}
      <Toast variant="default" title="Default" description="Neutral toast surface" duration={0} />
    </Stack>
  );
}


// A clickable Card, rendered only behind `?interactive=1`.
//
// The flagship gallery's cards are `hoverable`, never `clickable`, so no capture
// in this probe can see a Card's focus ring -- and WO-ARC-07's Card skin is about
// to key that ring on `[data-state~='focus-visible']`. This section exists to be
// photographed by `e2e/visual/states.spec.ts` and by nothing else: the 48 visual
// baselines are captured without the flag, so they cannot move.
function InteractiveCards() {
  return (
    <Box
      data-testid="probe-interactive"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Card variant="elevated" clickable onClick={() => undefined} title="Clickable" style={{ width: 240 }} />
    </Box>
  );
}

// A Table with a pre-selected row and a sortable header, rendered only behind
// `?tablestates=1` so no flagship capture sees it. WO-ARC-09 checkpoint 1 moves
// the Table's row-hover, selected-row and sortable-header paint out of inline
// style (imperative `el.style.background` writes in the modern engine, a
// `hoveredRow` React-state conditional object in rustic) into the unlayered
// table skin. `states.spec.ts` pins those states here: the six flagship table
// baselines photograph the table at rest, so they cannot certify a hover or a
// selection that the migration must reproduce byte for byte.
function TableStates() {
  return (
    <Box
      data-testid="probe-table-states"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Table
        rowKey="key"
        pagination={false}
        rowSelection={{ type: 'checkbox', defaultSelectedRowKeys: ['r2'] }}
        dataSource={TABLE_STATE_ROWS}
        columns={TABLE_STATE_COLUMNS}
      />
    </Box>
  );
}

// A FieldFiltersPanel with every filter branch, a preset pair, and one
// active value, rendered only behind `?fieldfilters=1` so no flagship
// capture sees it. WO-ARC-09 checkpoint 2 moves this panel's paint out of
// inline `style={}` objects into the unlayered field-filters-panel skin,
// keyed on the `data-part` attributes the pre-step stamps. This section is
// what `field-filters.spec.ts` photographs and reads computed styles from.
function FieldFiltersStates() {
  return (
    <Box
      data-testid="probe-field-filters"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <FieldFiltersPanel
        filters={FIELD_FILTERS_DEFINITIONS}
        presets={FIELD_FILTERS_PRESETS}
        values={FIELD_FILTERS_VALUES}
        onChange={() => undefined}
        filterVisuals={FIELD_FILTERS_VISUALS}
      />
    </Box>
  );
}

// Fixed filter set for the FilterPanel data-part probe (WO-ARC-09
// checkpoint 3). Covers every branch that paints: `query` is free-text,
// `status` is a `select` with one option per inferOptionTone branch
// (danger/warning/success/primary/info/neutral -- the modern-only
// option-icon-badge swatch), `tags` is a `multi-select`, `enabled` is a
// `boolean`, `window` is a `date-range`, and `capacity` is a
// `number-range`. Every key in FILTER_PANEL_VALUES is non-empty so the
// active-count badge (modern) and the active-filter chip row (rustic,
// inline layout) both render. A second, single-filter `sidebar` instance
// exercises the isSidebar borderRight branch. The loading branch is
// deliberately not rendered here -- its spinner/text is exempt residual
// and covered by transcription + the real-engines unit test.
const FILTER_PANEL_DEFINITIONS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search owner' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'rejected', label: 'Rejected candidate' },
      { value: 'needs-review', label: 'Needs review' },
      { value: 'completed', label: 'Completed' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'remote', label: 'Remote' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'indoor', label: 'Indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'window', label: 'Window', type: 'date-range' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

const FILTER_PANEL_VALUES: Record<string, unknown> = {
  query: 'ada',
  status: 'scheduled',
  tags: ['vip'],
  enabled: true,
  window: ['2026-01-01', '2026-02-01'],
  capacity: [10, 50],
};

// A FilterPanel with every filter branch and several active values,
// rendered only behind `?filterpanel=1` so no flagship capture sees it.
// WO-ARC-09 checkpoint 3 moves this panel's paint out of inline `style={}`
// objects into the unlayered filter-panel skin, keyed on the `data-part`
// attributes the pre-step stamps. This section is what
// `filter-panel.spec.ts` photographs and reads computed styles from.
function FilterPanelStates() {
  return (
    <Box
      data-testid="probe-filter-panel"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <PatternFilterPanel
          filters={FILTER_PANEL_DEFINITIONS}
          values={FILTER_PANEL_VALUES}
          onChange={() => undefined}
          onApply={() => undefined}
          onReset={() => undefined}
          layout="inline"
          collapsible
          title="Filters"
          activeCount={6}
          showApply
          showReset
        />
        <PatternFilterPanel
          filters={[FILTER_PANEL_DEFINITIONS[0]]}
          values={{}}
          onChange={() => undefined}
          layout="sidebar"
          title="Sidebar"
        />
      </Stack>
    </Box>
  );
}

// Fixed fixtures for the SelectionPreviewRail data-part probe (WO-ARC-09
// checkpoint 4). One row carries a subtitle-eligible `email` field and a
// column set that exercises all three `renderFallbackValue` branches
// (`role` a plain string, `verified` a boolean, `notes` null); the other
// row omits `email`/`slug`/`description` entirely so the rail's subtitle
// is provably optional. Rendered only behind `?rail=1` so no flagship
// capture sees it.
interface RailFixtureRow {
  id: string;
  fullName: string;
  email?: string;
  statusLabel: string;
  role: string;
  verified: boolean;
  notes: string | null;
}

const RAIL_ROW_WITH_SUBTITLE: RailFixtureRow = {
  id: 'rail-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  statusLabel: 'Active',
  role: 'Engineer',
  verified: true,
  notes: null,
};

const RAIL_ROW_WITHOUT_SUBTITLE: RailFixtureRow = {
  id: 'rail-2',
  fullName: 'Grace Hopper',
  statusLabel: 'Invited',
  role: 'Researcher',
  verified: false,
  notes: null,
};

const RAIL_COLUMNS: SelectionPreviewRailColumn<RailFixtureRow>[] = [
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'verified', title: 'Verified', dataIndex: 'verified' },
  { key: 'notes', title: 'Notes', dataIndex: 'notes' },
];

// A SelectionPreviewRail probe with three instances, rendered only behind
// `?rail=1` so no flagship capture sees it. WO-ARC-09 checkpoint 4 moves
// this rail's paint out of inline `style={}` objects into the unlayered
// selection-preview-rail skin, keyed on the `data-part`/`data-preview`
// attributes and the `.ds-selection-preview-rail__close` className the
// pre-step stamps. The committed container-axis `rail` baseline
// (state-gallery responsive-specs) only ever exercises the default branch
// with no subtitle, no match reason, and non-empty string columns -- this
// section is what `selection-preview-rail.spec.ts` photographs to cover
// what that baseline cannot: the customPreview branch and close button, a
// subtitle, a match-reason panel, and the boolean/empty
// renderFallbackValue paths.
function RailStates() {
  return (
    <Box
      data-testid="probe-rail"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <SelectionPreviewRail
          item={RAIL_ROW_WITH_SUBTITLE}
          itemKey={RAIL_ROW_WITH_SUBTITLE.id}
          itemIndex={0}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          getMatchReason={() => 'Current search, scope, or filters matched this record.'}
          mode="selection"
        />
        <SelectionPreviewRail
          item={RAIL_ROW_WITHOUT_SUBTITLE}
          itemKey={RAIL_ROW_WITHOUT_SUBTITLE.id}
          itemIndex={1}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          mode="click"
        />
        <SelectionPreviewRail
          item={RAIL_ROW_WITH_SUBTITLE}
          itemKey={RAIL_ROW_WITH_SUBTITLE.id}
          itemIndex={0}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          mode="selection"
          preview={{
            render: (item) => (
              <Stack spacing="xs">
                <Text size="sm" weight="semibold">
                  {item.fullName}
                </Text>
                <Text size="xs" color="secondary">
                  Custom preview content
                </Text>
              </Stack>
            ),
          }}
        />
      </Stack>
    </Box>
  );
}

// Fixed fixtures for the DetailPanel data-part probe (WO-ARC-09
// checkpoint 5). One entity carries a custom `status.color` (rustic honors
// it, modern doesn't -- a pre-existing cross-engine gap the pre-step files
// but does not fix), breadcrumbs with a link and a current crumb, 4 action
// variants (one loading, one disabled), 3 tabs (one active, one disabled,
// two with badges), a sidebar, and a footer. Rendered only behind
// `?detailpanel=1` so no flagship capture sees it.
type DetailFixtureEntity = { id: string };

const DETAIL_PANEL_ENTITY: DetailFixtureEntity = { id: 'acme-corp' };

const DETAIL_PANEL_PROPS: DetailPanelProps<DetailFixtureEntity> = {
  data: DETAIL_PANEL_ENTITY,
  title: 'Acme Corp',
  subtitle: 'Enterprise customer since 2019',
  status: { label: 'On Leave', color: '#f59e0b' },
  breadcrumbs: [
    { label: 'Customers', href: '/customers' },
    { label: 'Acme Corp' },
  ],
  onBack: () => undefined,
  actions: [
    { key: 'edit', label: 'Edit', variant: 'primary', onClick: () => undefined },
    { key: 'archive', label: 'Archive', variant: 'danger', onClick: () => undefined, loading: true },
    { key: 'view', label: 'View', variant: 'ghost', onClick: () => undefined },
    { key: 'more', label: 'More', onClick: () => undefined, disabled: true },
  ],
  tabs: [
    { key: 'overview', label: 'Overview', content: <Text size="sm">Overview content</Text>, badge: 3 },
    { key: 'billing', label: 'Billing', content: <Text size="sm">Billing content</Text> },
    { key: 'history', label: 'History', content: <Text size="sm">History content</Text>, disabled: true, badge: 'New' },
  ],
  sidebar: <Text size="sm">Sidebar content</Text>,
  footer: <Text size="sm">Footer content</Text>,
};

// A DetailPanel probe with a full instance and a loading instance, rendered
// only behind `?detailpanel=1` so no flagship capture sees it. WO-ARC-09
// checkpoint 5 moves this panel's paint out of inline `style={}` objects
// into the unlayered detail-panel skin, keyed on the `data-part` attributes
// the pre-step stamps. This section is what `detail-panel.spec.ts`
// photographs and reads computed styles from.
function DetailPanelStates() {
  return (
    <Box
      data-testid="probe-detail-panel"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <PatternDetailPanel {...DETAIL_PANEL_PROPS} />
        <PatternDetailPanel {...DETAIL_PANEL_PROPS} loading />
      </Stack>
    </Box>
  );
}

// Fixed fixtures for the DataTable data-part probe (WO-ARC-09 checkpoint 6,
// the compound case: five files, two engines). One rich instance exercises
// every conditional paint site the pre-step stamped: a selected row,
// striping, a pinned + sortable + resizable column, an expandable row, a
// two-page pagination footer, a visible bulk bar (two variants), and one
// editable column -- plus a loading instance and an empty instance.
// `groupBy`/`editable`/`resizable` are modern-only features; RusticDataTable
// simply does not destructure them, so under `?engine=rustic` they no-op
// inertly rather than crash. `defaultGroupExpanded` has no per-group
// override in the pattern's props today, so this static instance renders
// both groups expanded (the richer composition) -- the collapsed-group
// visual is captured instead by data-table.spec.ts's interactive state shot
// (click the second group's chevron). Rendered only behind `?datatable=1`
// so no flagship capture sees it.
interface DataTableFixtureRow {
  id: string;
  name: string;
  role: string;
  status: string;
  amount: number;
}

const DATA_TABLE_ROWS: DataTableFixtureRow[] = [
  { id: 'dt-1', name: 'Ada Lovelace', role: 'Engineer', status: 'active', amount: 1200 },
  { id: 'dt-2', name: 'Grace Hopper', role: 'Admiral', status: 'active', amount: 980 },
  { id: 'dt-3', name: 'Alan Turing', role: 'Researcher', status: 'inactive', amount: 640 },
  { id: 'dt-4', name: 'Katherine Johnson', role: 'Mathematician', status: 'active', amount: 1500 },
];

const DATA_TABLE_COLUMNS: ColumnDef<DataTableFixtureRow>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name', sortable: true, pin: 'left', width: 160 },
  {
    key: 'status',
    header: 'Status',
    accessorKey: 'status',
    editable: {
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  },
  { key: 'role', header: 'Role', accessorKey: 'role' },
  { key: 'amount', header: 'Amount', accessorKey: 'amount', align: 'right' },
];

function DataTableStates() {
  return (
    <Box
      data-testid="probe-data-table"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <PatternDataTable<DataTableFixtureRow>
          data={DATA_TABLE_ROWS}
          rowKey="id"
          columns={DATA_TABLE_COLUMNS}
          striped
          selectable
          selectedKeys={['dt-1']}
          resizable
          onColumnResize={() => undefined}
          groupBy="status"
          expandedRow={(row) => <Text size="sm">{`Details for ${row.name}`}</Text>}
          bulkActions={[
            { key: 'archive', label: 'Archive', variant: 'danger', onExecute: () => undefined },
            { key: 'export', label: 'Export', variant: 'primary', onExecute: () => undefined },
          ]}
          pagination={{ current: 1, pageSize: 2, total: DATA_TABLE_ROWS.length, onChange: () => undefined }}
        />
        <PatternDataTable<DataTableFixtureRow>
          data={[]}
          rowKey="id"
          columns={DATA_TABLE_COLUMNS}
          loading
        />
        <PatternDataTable<DataTableFixtureRow>
          data={[]}
          rowKey="id"
          columns={DATA_TABLE_COLUMNS}
        />
      </Stack>
    </Box>
  );
}

// WO-SKIN-02 checkpoint A field-family data-part probe (the 15 input
// components). Every instance below is deterministic -- controlled or
// defaultValue-seeded, never randomly toggling -- so the grid renders
// identically on every load. Rendered only behind `?fields=1` so no
// flagship capture sees it. This section is what `fields-batch.spec.ts`
// photographs and reads computed styles from.
function FieldsStates() {
  return (
    <Box
      data-testid="probe-fields"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-fields-input">
          <Text size="xs" color="secondary">Input</Text>
          <Input placeholder="Plain" />
          <Input prefix="$" suffix="USD" clearable defaultValue="120" />
          <Input error errorMessage="This field is required" defaultValue="bad value" />
          <Input disabled defaultValue="Disabled" />
          <Input.Group compact>
            <Input.Addon position="before">https://</Input.Addon>
            <Input placeholder="domain" />
            <Input.Addon position="after">.com</Input.Addon>
          </Input.Group>
          <Input.Password placeholder="Password" defaultValue="secret123" />
          <Input.Search placeholder="Search…" onSearch={() => undefined} />
          <Input.TextArea placeholder="Multi-line" showCount maxLength={80} defaultValue="Some text" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-slider">
          <Text size="xs" color="secondary">Slider</Text>
          <Slider defaultValue={40} />
          <Slider range defaultValue={[20, 70]} marks={{ 0: 'Min', 100: 'Max' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-inputnumber">
          <Text size="xs" color="secondary">InputNumber</Text>
          <InputNumber defaultValue={12} />
          <InputNumber prefix="$" suffix="USD" addonBefore="Qty" addonAfter="ea" defaultValue={5} />
          <InputNumber status="error" defaultValue={-1} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-passwordinput">
          <Text size="xs" color="secondary">PasswordInput</Text>
          <PasswordInput defaultValue="hunter2" />
          <PasswordInput error errorMessage="Too short" defaultValue="a" />
          <PasswordInput strengthIndicator strengthLevel="good" defaultValue="Abcd1234" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-radio">
          <Text size="xs" color="secondary">Radio</Text>
          <Radio name="probe-radio" label="Unchecked" />
          <Radio name="probe-radio" label="Checked" checked onChange={() => undefined} />
          <Radio name="probe-radio" label="Disabled" disabled />
          <Radio.Group
            options={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ]}
            value="a"
            buttonStyle="solid"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-taginput">
          <Text size="xs" color="secondary">TagInput</Text>
          <TagInput value={['design', 'system']} onChange={() => undefined} />
          <TagInput value={[]} error errorMessage="At least one tag required" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-checkbox">
          <Text size="xs" color="secondary">Checkbox</Text>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" checked onChange={() => undefined} />
          <Checkbox label="Indeterminate" indeterminate onChange={() => undefined} />
          <Checkbox label="Disabled" disabled />
          <Checkbox.Group
            options={[
              { value: 'x', label: 'X' },
              { value: 'y', label: 'Y' },
            ]}
            value={['x']}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-form">
          <Text size="xs" color="secondary">Form</Text>
          <Form>
            <Form.Item label="Email" required help="We never share it">
              <Input placeholder="you@example.com" />
            </Form.Item>
            <Form.Item label="Name" validateStatus="error" help="Name is required" hasFeedback>
              <Input />
            </Form.Item>
          </Form>
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-toggle">
          <Text size="xs" color="secondary">Toggle</Text>
          <Toggle label="Off" checked={false} onChange={() => undefined} />
          <Toggle label="On" checked onChange={() => undefined} />
          <Toggle label="Error" error checked={false} onChange={() => undefined} />
          <Toggle label="Disabled" disabled />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-switch">
          <Text size="xs" color="secondary">Switch</Text>
          <Switch checked={false} onChange={() => undefined} checkedChildren="On" unCheckedChildren="Off" />
          <Switch checked onChange={() => undefined} checkedChildren="On" unCheckedChildren="Off" />
          <Switch disabled />
          <Switch loading checked onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-otpinput">
          <Text size="xs" color="secondary">OTPInput</Text>
          <OTPInput length={6} value="12" onChange={() => undefined} />
          <OTPInput length={6} value="" error errorMessage="Invalid code" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-textarea">
          <Text size="xs" color="secondary">Textarea</Text>
          <Textarea placeholder="Comment" rows={3} />
          <Textarea status="error" defaultValue="Bad value" rows={3} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-button-icon">
          <Text size="xs" color="secondary">Button.Icon</Text>
          <Button.Icon icon={<span aria-hidden>+</span>} aria-label="Add" />
          <Button.Icon icon={<span aria-hidden>+</span>} aria-label="Add (disabled)" disabled />
          <Button.Icon icon={<span aria-hidden>+</span>} aria-label="Add (loading)" loading />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-formfield">
          <Text size="xs" color="secondary">FormField</Text>
          <FormField label="Username" name="probe-username" required help="3-20 characters">
            <Input />
          </FormField>
          <FormField label="Bio" name="probe-bio" error="Bio is too long">
            <Input />
          </FormField>
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-voiceinputbutton">
          <Text size="xs" color="secondary">VoiceInputButton</Text>
          <VoiceInputButton lang="en-US" onTranscript={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed option/tree/cascade data for the WO-SKIN-02 checkpoint B dropdown-family
// (Select, TreeSelect, Cascader, AutoComplete, Mentions) data-part probe.
const DROPDOWN_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
];

const TREE_SELECT_DATA = [
  {
    value: 'engineering',
    title: 'Engineering',
    children: [
      { value: 'frontend', title: 'Frontend' },
      { value: 'backend', title: 'Backend' },
    ],
  },
  { value: 'design', title: 'Design' },
];

const CASCADER_OPTIONS = [
  {
    value: 'us',
    label: 'United States',
    children: [
      { value: 'us-ca', label: 'California', children: [{ value: 'us-ca-sf', label: 'San Francisco' }] },
      { value: 'us-ny', label: 'New York' },
    ],
  },
  { value: 'ca', label: 'Canada' },
];

const AUTOCOMPLETE_OPTIONS = [
  { value: 'React', label: 'React' },
  { value: 'Vue', label: 'Vue' },
  { value: 'Angular', label: 'Angular' },
];

const MENTIONS_OPTIONS = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'grace', label: 'Grace Hopper' },
];

// WO-SKIN-02 checkpoint B dropdown-family data-part probe. An open popup is
// not capturable at rest (open state = interaction), so this grid only shows
// closed triggers -- with values, placeholders, tags, and disabled -- per the
// checkpoint contract; the spec's interaction shots open each popup
// separately (click trigger, wait for the listbox). Rendered only behind
// `?dropdowns=1` so no flagship capture sees it. This section is what
// `dropdowns-batch.spec.ts` photographs and reads computed styles from.
function DropdownsStates() {
  return (
    <Box
      data-testid="probe-dropdowns"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-dropdowns-select">
          <Text size="xs" color="secondary">Select</Text>
          <Select options={DROPDOWN_OPTIONS} placeholder="Choose a team" onChange={() => undefined} />
          <Select options={DROPDOWN_OPTIONS} defaultValue="engineering" onChange={() => undefined} />
          <Select
            options={DROPDOWN_OPTIONS}
            multiple
            defaultValue={['design', 'engineering', 'marketing']}
            maxTagCount={2}
            onChange={() => undefined}
          />
          <Select options={DROPDOWN_OPTIONS} error defaultValue="sales" onChange={() => undefined} />
          <Select options={DROPDOWN_OPTIONS} disabled defaultValue="design" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-treeselect">
          <Text size="xs" color="secondary">TreeSelect</Text>
          <TreeSelect treeData={TREE_SELECT_DATA} placeholder="Choose a node" onChange={() => undefined} />
          <TreeSelect treeData={TREE_SELECT_DATA} defaultValue="frontend" onChange={() => undefined} />
          <TreeSelect treeData={TREE_SELECT_DATA} disabled defaultValue="design" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-cascader">
          <Text size="xs" color="secondary">Cascader</Text>
          <Cascader options={CASCADER_OPTIONS} placeholder="Choose a location" onChange={() => undefined} />
          <Cascader options={CASCADER_OPTIONS} defaultValue={['us', 'us-ca', 'us-ca-sf']} onChange={() => undefined} />
          <Cascader options={CASCADER_OPTIONS} disabled defaultValue={['ca']} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-autocomplete">
          <Text size="xs" color="secondary">AutoComplete</Text>
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} placeholder="Search a framework" onChange={() => undefined} />
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} defaultValue="React" onChange={() => undefined} />
          <AutoComplete options={AUTOCOMPLETE_OPTIONS} disabled defaultValue="Vue" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-dropdowns-mentions">
          <Text size="xs" color="secondary">Mentions</Text>
          <Mentions options={MENTIONS_OPTIONS} placeholder="Type @ to mention someone" onChange={() => undefined} />
          <Mentions options={MENTIONS_OPTIONS} defaultValue="Hey @ada, can you review this?" onChange={() => undefined} />
          <Mentions options={MENTIONS_OPTIONS} disabled defaultValue="Assigned to @grace" onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-02 checkpoint C pickers-and-movers data-part
// probe (DatePicker, TimePicker, Upload, Transfer, ColorPicker). Every
// instance below is deterministic -- controlled/defaultValue-seeded, never a
// live clock or a real file read -- so the grid renders identically on every
// load. Rendered only behind `?pickers=1` so no flagship capture sees it.
// This section is what `pickers-batch.spec.ts` photographs and reads
// computed styles from.
const PICKERS_UPLOAD_FILES = [
  { uid: 'file-done', name: 'quarterly-report.pdf', status: 'done' as const, percent: 100 },
  { uid: 'file-uploading', name: 'roadmap-deck.pptx', status: 'uploading' as const, percent: 42 },
  { uid: 'file-error', name: 'budget.xlsx', status: 'error' as const, percent: 0 },
];

const PICKERS_TRANSFER_ITEMS = [
  { key: 'design', title: 'Design' },
  { key: 'engineering', title: 'Engineering' },
  { key: 'marketing', title: 'Marketing' },
  { key: 'sales', title: 'Sales' },
];

const PICKERS_TRANSFER_TARGET_KEYS = ['engineering'];

const PICKERS_COLOR_PRESETS = [
  { label: 'Brand', colors: ['#1677ff', '#52c41a', '#f5222d'] },
];

function PickersStates() {
  return (
    <Box
      data-testid="probe-pickers"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-pickers-datepicker">
          <Text size="xs" color="secondary">DatePicker</Text>
          <DatePicker placeholder="Choose a date" onChange={() => undefined} />
          <DatePicker defaultValue="2026-03-15" onChange={() => undefined} />
          <DatePicker disabled defaultValue="2026-01-01" onChange={() => undefined} />
          <DatePicker.RangePicker
            defaultValue={['2026-01-01', '2026-01-10']}
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-timepicker">
          <Text size="xs" color="secondary">TimePicker</Text>
          <TimePicker placeholder="Choose a time" onChange={() => undefined} />
          <TimePicker defaultValue="14:30" onChange={() => undefined} />
          <TimePicker disabled defaultValue="09:00" onChange={() => undefined} />
          <TimePicker.RangePicker
            defaultValue={['09:00', '17:00']}
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-upload">
          <Text size="xs" color="secondary">Upload</Text>
          <Upload fileList={PICKERS_UPLOAD_FILES} onChange={() => undefined} />
          <Upload.Dragger fileList={PICKERS_UPLOAD_FILES} onChange={() => undefined} height={120} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-transfer">
          <Text size="xs" color="secondary">Transfer</Text>
          <Transfer
            dataSource={PICKERS_TRANSFER_ITEMS}
            defaultTargetKeys={PICKERS_TRANSFER_TARGET_KEYS}
            showSearch
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-colorpicker">
          <Text size="xs" color="secondary">ColorPicker</Text>
          <ColorPicker defaultValue="#1677ff" showText presets={PICKERS_COLOR_PRESETS} onChange={() => undefined} />
          <ColorPicker disabled defaultValue="#52c41a" onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-03 checkpoint S status-family data-part
// probe (Skeleton, Alert, Progress, Spinner, Rate). Every instance below is
// deterministic -- controlled/defaultValue-seeded, never a live clock -- so
// the grid renders identically on every load. Rendered only behind
// `?statusfb=1` so no flagship capture sees it. This section is what
// `status-batch.spec.ts` photographs and `StatusBatch.contract.test.tsx`
// asserts the stamped data-part/data-status/data-tone/data-state attributes
// against (this page is the visual-evidence half; the contract test renders
// its own fixtures directly through React Testing Library).
function StatusFbStates() {
  return (
    <Box
      data-testid="probe-statusfb"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-statusfb-alert">
          <Text size="xs" color="secondary">Alert</Text>
          <Alert type="info" message="Info alert" description="Informational description text." />
          <Alert type="success" message="Success alert" description="Everything worked." />
          <Alert type="warning" message="Warning alert" description="Something needs attention." />
          <Alert type="error" message="Error alert" description="Something went wrong." />
          <Alert type="info" message="Closable alert" closable onClose={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-progress">
          <Text size="xs" color="secondary">Progress</Text>
          <Progress type="line" percent={42} status="normal" />
          <Progress type="line" percent={42} status="success" />
          <Progress type="line" percent={42} status="error" />
          <Progress type="line" percent={42} status="active" />
          <Progress type="circle" percent={42} status="normal" />
          <Progress.Line percent={42} />
          <Progress.Circle percent={42} size={80} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-skeleton">
          <Text size="xs" color="secondary">Skeleton</Text>
          {/* Shape-variant branch (engines/*.tsx early return) */}
          <Skeleton variant="rounded" width="100%" height={80} />
          {/* Text/default-variant branch (avatar + title + paragraph) */}
          <Skeleton avatar title paragraph={{ rows: 3 }} />
          <Skeleton.Avatar size="lg" shape="circle" />
          <Skeleton.Text lines={3} />
          <Skeleton.Paragraph lines={3} lastLineWidth="45%" />
          <Skeleton.Button size="md" shape="round" />
          <Skeleton.Card hasImage lines={2} />
          <Skeleton.ListItem hasAvatar lines={2} />
          <Skeleton.Form fields={3} />
          <Skeleton.Table rows={3} columns={4} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-spinner">
          <Text size="xs" color="secondary">Spinner</Text>
          <Spinner size="sm" label="Small" />
          <Spinner size="md" label="Medium" />
          <Spinner size="lg" label="Large" />
          <Spinner size="xl" label="Extra large" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-statusfb-rate">
          <Text size="xs" color="secondary">Rate</Text>
          <Rate defaultValue={5} count={5} onChange={() => undefined} />
          <Rate defaultValue={2.5} allowHalf onChange={() => undefined} />
          <Rate defaultValue={3} readOnly onChange={() => undefined} />
          <Rate defaultValue={3} disabled onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}

// Container-toast trigger for the WO-SKIN-03 checkpoint O overlays probe.
// Isolated into its own component so `useToast()` only needs a ToastProvider
// ancestor, not a rework of the whole torture tree -- the trigger dispatches
// an auto-dismissing toast with showProgress on, which the spec's clock-pinned
// open shot captures deterministically (see overlays-batch.spec.ts).
function OverlayFbToastTrigger() {
  const { show } = useToast();
  return (
    <Button
      data-testid="probe-overlayfb-toast-trigger"
      onClick={() =>
        show({
          variant: 'info',
          title: 'Container toast',
          description: 'Auto-dismissing with a progress bar.',
          duration: 6000,
          showProgress: true,
          closable: true,
        })
      }
    >
      Trigger container toast
    </Button>
  );
}

// Fixed fixtures for the WO-SKIN-03 checkpoint O overlays-family data-part
// probe (Modal, Drawer, Toast, Message, Notification, Result). Rendered only
// behind `?overlayfb=1` so no flagship capture sees it. Modal and Drawer stay
// closed at rest and are opened by overlays-batch.spec.ts clicking their
// trigger buttons; Result, the inline Toast, and the Message/Notification
// instances render statically (duration=0 / no-op onRemove -- no live
// timers) so the rest shots are deterministic. This page is the
// visual-evidence half; OverlaysBatch.contract.test.tsx asserts the stamped
// data-part/data-tone/data-placement/data-open attributes and portal posture
// against its own React Testing Library fixtures.
function OverlayFbStates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box
      data-testid="probe-overlayfb"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-overlayfb-modal">
          <Text size="xs" color="secondary">Modal</Text>
          <Button data-testid="probe-overlayfb-modal-trigger" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
            onOk={() => setModalOpen(false)}
            title="Modal title"
            description="Modal description text."
          >
            Modal body content.
          </Modal>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-drawer">
          <Text size="xs" color="secondary">Drawer</Text>
          <Button data-testid="probe-overlayfb-drawer-trigger" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Drawer title"
            footer={<Button onClick={() => setDrawerOpen(false)}>Close</Button>}
          >
            Drawer body content.
          </Drawer>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-toast">
          <Text size="xs" color="secondary">Toast</Text>
          <Toast
            variant="success"
            title="Inline toast"
            description="Static instance, no live timer."
            visible
            duration={0}
            showProgress={false}
            closable
          />
          <ToastProvider>
            <OverlayFbToastTrigger />
            <Toast.Container position="top-right" />
          </ToastProvider>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-message">
          <Text size="xs" color="secondary">Message</Text>
          <MessageItem
            id="probe-overlayfb-message-1"
            type="success"
            content="Static message instance."
            duration={0}
            closable
            onRemove={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-notification">
          <Text size="xs" color="secondary">Notification</Text>
          <NotificationItem
            id="probe-overlayfb-notification-1"
            type="warning"
            message="Static notification instance"
            description="No live timer -- duration is 0."
            duration={0}
            closable
            onRemove={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlayfb-result">
          <Text size="xs" color="secondary">Result</Text>
          <Result
            status="success"
            title="All done"
            subTitle="Static result fixture."
            extra={<Button variant="primary">Continue</Button>}
          />
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-04 checkpoint P overlay-primitives data-part
// probe (Modal, Tour, ConfirmDialog, AlertDialog, Popconfirm, Sheet,
// ContextMenu, Popover, Dropdown, HoverCard, Watermark -- AdaptiveOverlay owns
// no DOM of its own, per the checkpoint contract, so it has no fixture here).
// Every floating component stays closed/unopened at rest -- Modal, Tour,
// ConfirmDialog, AlertDialog, and Sheet via controlled `open` state defaulting
// false; Popconfirm/ContextMenu/Popover/Dropdown/HoverCard via their own
// uncontrolled internal state -- and is opened by overlay-batch.spec.ts
// clicking (or right-clicking, for ContextMenu; hovering, for HoverCard) the
// matching `data-testid="probe-overlay-{component}-trigger"` element. Popover
// and Dropdown are forced to `trigger="click"` here (their defaults are
// hover-based) so the spec can open them deterministically without a
// hover-delay race. Watermark renders statically -- no open/closed state.
// This page is the visual-evidence half; OverlayBatch.contract.test.tsx
// asserts the stamped data-part/data-open/data-placement/data-tone/
// data-variant attributes and portal posture against its own React Testing
// Library fixtures.
function OverlayStates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Box
      data-testid="probe-overlay"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-overlay-modal">
          <Text size="xs" color="secondary">Modal</Text>
          <Button data-testid="probe-overlay-modal-trigger" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <OverlayModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Overlay modal title"
            description="Overlay modal description text."
            footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
          >
            Overlay modal body content.
          </OverlayModal>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-tour">
          <Text size="xs" color="secondary">Tour</Text>
          <span data-testid="probe-overlay-tour-target" style={{ display: 'inline-block', padding: 4 }}>
            Target element
          </span>
          <Button data-testid="probe-overlay-tour-trigger" onClick={() => setTourOpen(true)}>
            Start tour
          </Button>
          <Tour
            open={tourOpen}
            onClose={() => setTourOpen(false)}
            type="primary"
            steps={[
              {
                target: '[data-testid="probe-overlay-tour-target"]',
                title: 'Step one',
                description: 'First step description.',
              },
              {
                target: '[data-testid="probe-overlay-tour-target"]',
                title: 'Step two',
                description: 'Second step description.',
              },
            ]}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-confirmdialog">
          <Text size="xs" color="secondary">ConfirmDialog</Text>
          <Button data-testid="probe-overlay-confirmdialog-trigger" onClick={() => setConfirmDialogOpen(true)}>
            Open confirm dialog
          </Button>
          <ConfirmDialog
            open={confirmDialogOpen}
            title="Delete item?"
            description="This cannot be undone."
            variant="danger"
            onConfirm={() => setConfirmDialogOpen(false)}
            onCancel={() => setConfirmDialogOpen(false)}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-alertdialog">
          <Text size="xs" color="secondary">AlertDialog</Text>
          <Button data-testid="probe-overlay-alertdialog-trigger" onClick={() => setAlertDialogOpen(true)}>
            Open alert dialog
          </Button>
          <AlertDialog
            open={alertDialogOpen}
            onOpenChange={setAlertDialogOpen}
            title="Revoke access?"
            description="All sessions will be terminated."
            action={
              <Button variant="danger" onClick={() => setAlertDialogOpen(false)}>
                Revoke
              </Button>
            }
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-popconfirm">
          <Text size="xs" color="secondary">Popconfirm</Text>
          <Popconfirm
            title="Remove item?"
            description="This action cannot be undone."
            okType="danger"
            onConfirm={() => undefined}
            onCancel={() => undefined}
          >
            <Button data-testid="probe-overlay-popconfirm-trigger">Remove</Button>
          </Popconfirm>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-sheet">
          <Text size="xs" color="secondary">Sheet</Text>
          <Button data-testid="probe-overlay-sheet-trigger" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="bottom" title="Sheet title">
            Sheet body content.
          </Sheet>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-contextmenu">
          <Text size="xs" color="secondary">ContextMenu</Text>
          <ContextMenu
            items={[
              { key: 'edit', label: 'Edit', shortcut: 'Ctrl+E' },
              { key: 'group', label: 'Actions', type: 'group' },
              { key: 'divider', label: '', type: 'divider' },
              { key: 'delete', label: 'Delete', danger: true },
            ]}
            onSelect={() => undefined}
            trigger={
              <Box
                data-testid="probe-overlay-contextmenu-trigger"
                style={{
                  padding: 12,
                  border: '1px dashed var(--ds-color-border)',
                  borderRadius: 8,
                  textAlign: 'center' as const,
                }}
              >
                <Text size="xs" color="secondary">Right-click here</Text>
              </Box>
            }
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-popover">
          <Text size="xs" color="secondary">Popover</Text>
          <Popover title="Popover title" content="Popover content text." trigger="click" arrow>
            <Button data-testid="probe-overlay-popover-trigger">Open popover</Button>
          </Popover>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-dropdown">
          <Text size="xs" color="secondary">Dropdown</Text>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'profile', label: 'Profile' },
                { key: 'group', label: 'Actions', type: 'group' },
                { key: 'divider', label: '', type: 'divider' },
                { key: 'delete', label: 'Delete', danger: true },
              ],
              onClick: () => undefined,
            }}
          >
            <Button data-testid="probe-overlay-dropdown-trigger">Open dropdown</Button>
          </Dropdown>
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-hovercard">
          <Text size="xs" color="secondary">HoverCard</Text>
          <HoverCard
            content="Hover card content."
            openDelay={0}
            closeDelay={0}
            trigger={<Button data-testid="probe-overlay-hovercard-trigger">@username</Button>}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-overlay-watermark">
          <Text size="xs" color="secondary">Watermark</Text>
          <Watermark content="Draft">
            <Box style={{ padding: 24, minHeight: 100, background: 'var(--ds-color-bg-primary)' }}>
              <Text size="sm">Watermarked content</Text>
            </Box>
          </Watermark>
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-04 checkpoint N navigation-family data-part
// probe (Menu, FloatButton, Tabs, Steps, Stepper, Pagination, Segmented,
// BackTop, Breadcrumb, BottomTabBar, Anchor, MobileHeader, ActionDock, Affix,
// Link). Every instance below is deterministic -- forced status/state props,
// never a live clock or real scroll position -- so the grid renders
// identically on every load. Rendered only behind `?nav=1` so no flagship
// capture sees it. This page is the visual-evidence half; the contract test
// renders its own fixtures directly through React Testing Library.
const NAV_MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: <TagIcon /> },
  { key: 'selected', label: 'Selected item' },
  { key: 'disabled', label: 'Disabled item', disabled: true },
  { key: 'danger', label: 'Danger item', danger: true },
  {
    key: 'submenu',
    label: 'Submenu',
    children: [
      { key: 'submenu-child-1', label: 'Child 1' },
      { key: 'submenu-child-2', label: 'Child 2' },
    ],
  },
  { key: 'divider-1', label: '', type: 'divider' as const },
  {
    key: 'group-1',
    type: 'group' as const,
    label: 'Group',
    children: [{ key: 'group-child-1', label: 'Group child' }],
  },
];

const NAV_STEPS_ITEMS = [
  { title: 'Finished', status: 'finish' as const },
  { title: 'In progress', status: 'process' as const },
  { title: 'Error', status: 'error' as const },
  { title: 'Waiting', status: 'wait' as const },
];

const NAV_TABS_ITEMS = [
  { key: 'tab-1', label: 'Overview', children: <Text size="xs">Overview content</Text> },
  { key: 'tab-2', label: 'Activity 4', children: <Text size="xs">Activity content</Text> },
  { key: 'tab-3', label: 'Settings', disabled: true, children: <Text size="xs">Settings content</Text> },
];

const NAV_SEGMENTED_OPTIONS = [
  { label: 'List', value: 'list', icon: <TagIcon /> },
  { label: 'Grid', value: 'grid' },
  { label: 'Disabled', value: 'disabled', disabled: true },
];

const NAV_BREADCRUMB_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'docs', label: 'Docs', href: '/docs', icon: <TagIcon /> },
  { key: 'current', label: 'Current Page' },
];

const NAV_BOTTOMTABBAR_ITEMS = [
  { key: 'home', label: 'Home', icon: <TagIcon /> },
  { key: 'search', label: 'Search', icon: <TagIcon /> },
  { key: 'profile', label: 'Profile', icon: <TagIcon />, badge: 3 },
];

function NavFbStates() {
  return (
    <Box
      data-testid="probe-nav"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-nav-menu">
          <Text size="xs" color="secondary">Menu (items form)</Text>
          <Menu items={NAV_MENU_ITEMS} selectedKeys={['selected']} defaultOpenKeys={['submenu']} onSelect={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-menu-compound">
          <Text size="xs" color="secondary">Menu (compound form)</Text>
          <Menu selectedKeys={['compound-selected']} onSelect={() => undefined}>
            <Menu.Item itemKey="compound-home" icon={<TagIcon />}>Home</Menu.Item>
            <Menu.Item itemKey="compound-selected">Selected item</Menu.Item>
            <Menu.Item itemKey="compound-disabled" disabled>Disabled item</Menu.Item>
            <Menu.Item itemKey="compound-danger" danger>Danger item</Menu.Item>
            <Menu.Divider />
            <Menu.SubMenu itemKey="compound-submenu" title="Submenu">
              <Menu.Item itemKey="compound-submenu-child">Child</Menu.Item>
            </Menu.SubMenu>
            <Menu.Group title="Group">
              <Menu.Item itemKey="compound-group-child">Group child</Menu.Item>
            </Menu.Group>
          </Menu>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-floatbutton">
          <Text size="xs" color="secondary">FloatButton</Text>
          <Box style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <FloatButton icon={<TagIcon />} type="default" badge={{ count: 3 }} style={{ position: 'static' }} />
            <FloatButton icon={<TagIcon />} type="primary" shape="circle" badge={{ dot: true }} style={{ position: 'static' }} />
          </Box>
          <FloatButton.Group trigger="click" icon={<TagIcon />} style={{ position: 'static' }}>
            <FloatButton icon={<TagIcon />} style={{ position: 'static' }} />
          </FloatButton.Group>
          <FloatButton.BackTop visibilityHeight={0} style={{ position: 'static' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-tabs">
          <Text size="xs" color="secondary">Tabs</Text>
          <Tabs items={NAV_TABS_ITEMS} activeKey="tab-1" type="line" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-steps">
          <Text size="xs" color="secondary">Steps</Text>
          <Steps items={NAV_STEPS_ITEMS} current={1} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-stepper">
          <Text size="xs" color="secondary">Stepper (items form)</Text>
          <Stepper items={NAV_STEPS_ITEMS} current={1} clickable onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-stepper-compound">
          <Text size="xs" color="secondary">Stepper (compound form)</Text>
          <Stepper current={0}>
            <Stepper.Step title="Account" status="finish" />
            <Stepper.Step title="Profile" status="process" />
            <Stepper.Step title="Error step" status="error" />
            <Stepper.Content stepIndex={0}>
              <Text size="xs">Account step content</Text>
            </Stepper.Content>
          </Stepper>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-pagination">
          <Text size="xs" color="secondary">Pagination</Text>
          <Pagination current={1} total={100} pageSize={10} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-segmented">
          <Text size="xs" color="secondary">Segmented</Text>
          <Segmented options={NAV_SEGMENTED_OPTIONS} value="list" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-backtop">
          <Text size="xs" color="secondary">BackTop</Text>
          <BackTop visibilityHeight={0} style={{ position: 'static' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-breadcrumb">
          <Text size="xs" color="secondary">Breadcrumb (items form)</Text>
          <Breadcrumb items={NAV_BREADCRUMB_ITEMS} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-breadcrumb-compound">
          <Text size="xs" color="secondary">Breadcrumb (compound form)</Text>
          <Breadcrumb items={[]}>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/docs" icon={<TagIcon />}>Docs</Breadcrumb.Item>
            <Breadcrumb.Item>Current page</Breadcrumb.Item>
          </Breadcrumb>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-bottomtabbar">
          <Text size="xs" color="secondary">BottomTabBar</Text>
          <Box style={{ position: 'relative', height: 64 }}>
            <BottomTabBar items={NAV_BOTTOMTABBAR_ITEMS} activeKey="home" onChange={() => undefined} style={{ position: 'static' }} />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-anchor">
          <Text size="xs" color="secondary">Anchor</Text>
          <Anchor affix={false}>
            <Anchor.Link href="#nav-anchor-intro" title="Introduction" />
            <Anchor.Link href="#nav-anchor-features" title="Features">
              <Anchor.Link href="#nav-anchor-feature-1" title="Feature 1" />
            </Anchor.Link>
          </Anchor>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-mobileheader">
          <Text size="xs" color="secondary">MobileHeader</Text>
          <Box style={{ position: 'relative' }}>
            <MobileHeader title="Order Details" onBack={() => undefined} style={{ position: 'static' }} />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-actiondock">
          <Text size="xs" color="secondary">ActionDock</Text>
          <Box style={{ position: 'relative', height: 64 }}>
            <ActionDock position="bottom" style={{ position: 'static' }}>
              <Button variant="secondary" style={{ flex: 1 }}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1 }}>Save</Button>
            </ActionDock>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-affix">
          <Text size="xs" color="secondary">Affix</Text>
          <Affix offsetTop={0}>
            <Box style={{ padding: 8, background: 'var(--ds-color-bg-primary)' }}>
              <Text size="xs">Affixed content</Text>
            </Box>
          </Affix>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-link">
          <Text size="xs" color="secondary">Link</Text>
          <Stack spacing="xs">
            <NavLink href="/nav-link-default">Default link</NavLink>
            <NavLink href="/nav-link-primary" type="primary">Primary link</NavLink>
            <NavLink href="/nav-link-disabled" disabled>Disabled link</NavLink>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function sanitizeFixture(raw: string | null): TortureFixture {
  return raw && (TORTURE_FIXTURES as string[]).includes(raw) ? (raw as TortureFixture) : 'torture-dark';
}

function TortureContent() {
  const searchParams = useSearchParams();

  const fixture = useMemo(() => sanitizeFixture(searchParams.get('fixture')), [searchParams]);
  const rtl = useMemo(() => searchParams.get('rtl') === '1', [searchParams]);
  const interactive = useMemo(() => searchParams.get('interactive') === '1', [searchParams]);
  const tableStates = useMemo(() => searchParams.get('tablestates') === '1', [searchParams]);
  const fieldFilters = useMemo(() => searchParams.get('fieldfilters') === '1', [searchParams]);
  const filterPanel = useMemo(() => searchParams.get('filterpanel') === '1', [searchParams]);
  const rail = useMemo(() => searchParams.get('rail') === '1', [searchParams]);
  const detailPanel = useMemo(() => searchParams.get('detailpanel') === '1', [searchParams]);
  const datatable = useMemo(() => searchParams.get('datatable') === '1', [searchParams]);
  const fields = useMemo(() => searchParams.get('fields') === '1', [searchParams]);
  const dropdowns = useMemo(() => searchParams.get('dropdowns') === '1', [searchParams]);
  const pickers = useMemo(() => searchParams.get('pickers') === '1', [searchParams]);
  const statusfb = useMemo(() => searchParams.get('statusfb') === '1', [searchParams]);
  const overlayfb = useMemo(() => searchParams.get('overlayfb') === '1', [searchParams]);
  const overlay = useMemo(() => searchParams.get('overlay') === '1', [searchParams]);
  const nav = useMemo(() => searchParams.get('nav') === '1', [searchParams]);

  // WO-ENG-11 compares engines on an otherwise identical surface.
  const engine = useMemo<ProbeEngine>(() => {
    const raw = searchParams.get('engine');
    return raw === 'rustic' || raw === 'classic' ? raw : 'modern';
  }, [searchParams]);

  const contentWidth = useMemo(() => {
    const raw = searchParams.get('w');
    return raw && CAPTURE_WIDTHS[raw] ? CAPTURE_WIDTHS[raw] : undefined;
  }, [searchParams]);

  const slugs = useMemo(() => {
    const only = searchParams.get('slug');
    return only && FLAGSHIP_SLUGS.includes(only) ? [only] : FLAGSHIP_SLUGS;
  }, [searchParams]);

  return (
    <TortureSurface fixture={fixture} rtl={rtl} engine={engine}>
      <Box
        data-testid="probe-ground"
        style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}
      >
        <Box style={{ maxWidth: contentWidth ?? 1360, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Box>
              <Text
                as={'h1' as never}
                size="lg"
                weight="bold"
                style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
              >
                Whitelabel torture — {fixture}
              </Text>
              <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                Hostile-tenant proof: every color, font, and radius below derives from the {fixture} fixture, never
                hardcoded. Load ?fixture=rottay for the reference comparison.
              </Text>
            </Box>

            {interactive && <InteractiveCards />}

            {tableStates && <TableStates />}

            {fieldFilters && <FieldFiltersStates />}

            {filterPanel && <FilterPanelStates />}

            {rail && <RailStates />}

            {detailPanel && <DetailPanelStates />}

            {datatable && <DataTableStates />}

            {fields && <FieldsStates />}

            {dropdowns && <DropdownsStates />}

            {pickers && <PickersStates />}

            {statusfb && <StatusFbStates />}

            {overlayfb && <OverlayFbStates />}

            {overlay && <OverlayStates />}

            {nav && <NavFbStates />}

            <Box
              data-testid="probe-extras"
              style={{
                borderRadius: 16,
                border: '1px solid var(--ds-color-border)',
                background: 'var(--ds-color-bg-elevated)',
                padding: 16,
              }}
            >
              <ChromeExtras />
            </Box>

            {rtl && (
              <Box
                data-testid="probe-rtl"
                style={{
                  maxWidth: 480,
                  borderRadius: 16,
                  border: '1px solid var(--ds-color-border)',
                  background: 'var(--ds-color-bg-elevated)',
                  padding: 16,
                }}
              >
                <Stack spacing="md" fullWidth>
                  <Button variant="primary">{ARABIC_LONG_LABEL}</Button>
                  <Box>
                    <Badge variant="primary" content={ARABIC_LONG_LABEL} />
                  </Box>
                  <Input defaultValue={ARABIC_LONG_VALUE} />
                  <Card title={ARABIC_LONG_TITLE} />
                </Stack>
              </Box>
            )}

            {slugs.map((slug) => (
              <Stack key={slug} spacing="sm">
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ display: 'block', color: 'var(--ds-color-text-secondary)', textTransform: 'capitalize' }}
                >
                  {slug}
                </Text>
                <Box
                  data-testid={`probe-${slug}`}
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--ds-color-border)',
                    background: 'var(--ds-color-bg-elevated)',
                    padding: 16,
                  }}
                >
                  <StateGallery slug={slug} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </TortureSurface>
  );
}

export default function WhitelabelTorturePage() {
  return (
    <Suspense fallback={null}>
      <TortureContent />
    </Suspense>
  );
}
