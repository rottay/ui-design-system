'use client';

import { Suspense, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Stack,
  Text,
  Button,
  Badge,
  Input,
  Card,
  Image,
  Carousel,
  QRCode,
  Avatar,
  Tag,
  Kbd,
  Empty,
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
  Layout,
  Collapse,
  Divider,
  Splitter,
  Tree,
  Calendar,
  List,
  Timeline,
  Descriptions,
  Statistic,
  Heading,
  Paragraph,
  Link,
  Tooltip,
  Callout,
  PatternFilterBuilder,
  PatternFormBuilder,
  PatternStepWizard,
  PatternInvoiceTemplate,
  FormSections,
  FormFactsCard,
  RecordSummaryStrip,
  RecordFieldGrid,
  RecordField,
  RecordActionBar,
  RecordPanel,
  InlineEditorGroup,
  InlineEditor,
  InlineEditGrid,
  InlineEditField,
  MoreFieldsToggle,
  InlineEditFooter,
  PatternApprovalWorkflow,
  GuidedDraftFormSurface,
  FormSurface,
  WizardSurface,
  DetailFormSurface,
  DetailHeader,
  EditHeader,
  FormHeader,
  CollectionHeader,
  DashboardHeader,
  PatternCockpitHeader,
  PatternPageShell,
  PatternWorkbenchHeader,
  type CockpitStatus,
  type WorkbenchQuickAction,
  type TreeDataNode,
  type FieldFilterDefinition,
  type FieldFilterPreset,
  type FieldFilterVisual,
  type FilterDef,
  type SelectionPreviewRailColumn,
  type DetailPanelProps,
  type ColumnDef,
  type FilterFieldDefinition,
  type FilterGroup,
  type FieldDef,
  type WizardStep,
  type InvoiceData,
  type FormSection,
  type ApprovalStep,
  type FormSurfaceConfig,
  type WizardSurfaceConfig,
  type DetailFormSurfaceConfig,
  PatternCommandPalette,
  PatternEnvironmentToggle,
  PatternWorkspaceSwitcher,
  PatternShortcutsOverlay,
  PatternLocaleSwitcher,
  DEFAULT_LOCALES,
  ActivityTicker,
  ActivityTimeline,
  ActivityCompact,
  ActivityCards,
  MetricsMinimal,
  MetricsCards,
  MetricsChart,
  MetricsRows,
  DataTerminalCard,
  DataTerminalStat,
  StatsHeader,
  PatternCommentThread,
  PatternNotificationCenter,
  PatternActivityLog,
  PatternLiveFeed,
  AssistantStatusBadge,
  StreamingText,
  TypingIndicator,
  ToolCallCard,
  AssistantStatusIndicator,
  PreviewDiffCard,
  ConfirmActionCard,
  MessageBubble,
  PresenceBar,
  PresenceTypingIndicator,
  LiveCursor,
  PatternListToolbar,
  PatternSavedViewsBar,
  StatusFilterPills,
  ColumnMenu,
  SavedViewsMenu,
  ExportButton,
  ActiveFiltersBar,
  ScopeSwitcher,
  ViewModeSwitcher,
  TableToolbar,
  SearchCommandBar,
} from '@rottay/design-system';
import type { ActivityItem, KeyMetric, StatItem, FilterPillConfig } from '@rottay/design-system';
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

// Fixed fixtures for the WO-SKIN-05 checkpoint D1 surfaces+media data-part
// probe (Card, Image, Carousel, QRCode, Avatar, Badge, Tag, Kbd, Empty).
// Every instance below is deterministic: forced variant/status/size props, a
// `src=""` Image permanently pinned in its `loading` status (per the HTML
// spec an empty `src` queues no request, so neither load nor error ever
// fires), and a syntactically invalid data-URI Image pinned in `error`
// (decode failure is synchronous -- no network, no flake). Rendered only
// behind `?display1=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// The Avatar row is the D1.1 mandatory baseline (P-75): xs/md/xl sizes are
// photographed as-is, unfixed, so the shipped 40x40 clip (xl gets cropped)
// and halo (xs shows the container's tint around a too-small child) are both
// captured before anyone touches that component.
const DISPLAY1_VALID_IMG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNGY0NmU1Ii8+PC9zdmc+';
const DISPLAY1_BROKEN_IMG = 'data:image/png;base64,not-a-real-image';

function Display1States() {
  return (
    <Box
      data-testid="probe-display1"
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
        <Stack spacing="xs" data-testid="probe-display1-card">
          <Text size="xs" color="secondary">Card</Text>
          <Stack spacing="sm">
            <Card variant="elevated" title="Elevated" description="Rest state" />
            <Card variant="outlined" title="Outlined" hoverable divider actions={[<Button key="a" size="xs">Action</Button>]} />
            <Card variant="filled" colorVariant="success" title="Toned" clickable onClick={() => undefined} />
            <Card variant="ghost" loading title="Loading" />
            <Card.Header title="Header title" subtitle="Header subtitle" divider avatar={<Avatar size="sm" name="AB" />} extra={<Button size="xs">Extra</Button>} />
            <Card.Body padding="sm">Body content</Card.Body>
            <Card.Footer divider align="space-between" actions={[<Button key="f" size="xs">Save</Button>]} />
            <Card.Image src={DISPLAY1_VALID_IMG} alt="Cover" height={64} overlay={<Badge variant="success" content="New" />} gradient />
          </Stack>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-image">
          <Text size="xs" color="secondary">Image (loaded / loading / error)</Text>
          <Box style={{ display: 'flex', gap: 8 }}>
            <Image src={DISPLAY1_VALID_IMG} alt="Loaded" width={64} height={64} bordered shadow />
            <Image src="" alt="Loading" width={64} height={64} />
            <Image src={DISPLAY1_BROKEN_IMG} alt="Errored" width={64} height={64} />
            <Image src={DISPLAY1_VALID_IMG} alt="Zoomable" width={64} height={64} zoomable hoverOverlay={<Text size="xs">View</Text>} />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-carousel">
          <Text size="xs" color="secondary">Carousel</Text>
          <Box style={{ position: 'relative', height: 120 }}>
            <Carousel arrows dots>
              <div style={{ background: 'var(--ds-color-primary)', width: '100%', height: '100%' }} />
              <div style={{ background: 'var(--ds-color-secondary)', width: '100%', height: '100%' }} />
              <div style={{ background: 'var(--ds-color-success)', width: '100%', height: '100%' }} />
            </Carousel>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-qrcode">
          <Text size="xs" color="secondary">QRCode (active / loading / expired / scanned)</Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <QRCode value="https://rottay.com" size={72} bordered />
            <QRCode value="https://rottay.com" size={72} status="loading" />
            <QRCode value="https://rottay.com" size={72} status="expired" onRefresh={() => undefined} />
            <QRCode value="https://rottay.com" size={72} status="scanned" />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-avatar">
          <Text size="xs" color="secondary">Avatar (xs / md / xl -- P-75 clip/halo baseline, unfixed)</Text>
          <Box style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar size="xs" name="AB" />
            <Avatar size="md" name="CD" />
            <Avatar size="xl" name="EF" />
            <Avatar size="md" name="GH" status="online" bordered />
            <Avatar.Badge status="busy">
              <Avatar size="md" name="IJ" />
            </Avatar.Badge>
            <Avatar.Group max={2}>
              <Avatar name="A1" />
              <Avatar name="A2" />
              <Avatar name="A3" />
            </Avatar.Group>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-badge">
          <Text size="xs" color="secondary">Badge</Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant="primary" content="Solid" badgeStyle="solid" />
            <Badge variant="success" content="Soft" badgeStyle="soft" />
            <Badge variant="warning" content="Outline" badgeStyle="outline" bordered />
            <Badge variant="error" dot />
            <Badge tone="info" content="Closable" closable onClose={() => undefined} />
            <Badge variant="primary" count={5}>
              <Box style={{ width: 32, height: 32, background: 'var(--ds-surface-panel)', borderRadius: 6 }} />
            </Badge>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-tag">
          <Text size="xs" color="secondary">Tag</Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag variant="default">Default</Tag>
            <Tag variant="primary" outlined>Outlined</Tag>
            <Tag variant="success" bordered>Bordered</Tag>
            <Tag variant="warning" closable onClose={() => undefined}>Closable</Tag>
            <Tag variant="error" clickable onClick={() => undefined} icon={<TagIcon />}>Clickable</Tag>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-kbd">
          <Text size="xs" color="secondary">Kbd</Text>
          <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Kbd size="sm">Shift</Kbd>
            <Kbd size="md">Ctrl</Kbd>
            <Kbd size="lg">Enter</Kbd>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display1-empty">
          <Text size="xs" color="secondary">Empty</Text>
          <Box style={{ display: 'flex', gap: 16 }}>
            <Empty description="No records" image="default">
              <Button size="xs">Create</Button>
            </Empty>
            <Empty description="Nothing to show" image="simple" />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-05 checkpoint D2 data-display data-part
// probe (Tree, Calendar, List, Timeline, Descriptions, Statistic, Typography,
// Tooltip, Callout). Every instance below is deterministic: forced
// selected/expanded/disabled props and a controlled Calendar `value` distinct
// from the pinned recording day. Calendar's own "today" ring is compiled from
// a real `new Date()` inside the component with no override prop -- the e2e
// spec freezes the browser clock via `page.clock.setFixedTime` before
// navigating (same recipe as WO-SKIN-02's DatePicker pin) so the ring does
// not silently move day to day. Tooltip stays closed at rest (matching every
// other floating component's rest posture) and is opened by the spec's own
// hover interaction pin, not by this fixture. Rendered only behind
// `?display2=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// Two checkpoint-anticipated states have no corresponding prop in source
// today (WO-SKIN-05 D2 pre-step finding, code over inventory): List.Item has
// no `selected`/`clickable` prop, and Calendar renders no outside-month
// cells (only true blanks before day 1, never adjacent-month dates) -- both
// rows below demonstrate the states that DO exist rather than inventing new
// component API.
const DISPLAY2_TREE_DATA: TreeDataNode[] = [
  {
    key: 'documents',
    title: 'Documents',
    children: [
      { key: 'selected-file', title: 'Selected file' },
      { key: 'disabled-file', title: 'Disabled file', disabled: true },
      { key: 'leaf-file', title: 'Plain file', isLeaf: true },
    ],
  },
  { key: 'archive', title: 'Archive', isLeaf: true },
];

function Display2States() {
  return (
    <Box
      data-testid="probe-display2"
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
        <Stack spacing="xs" data-testid="probe-display2-tree">
          <Text size="xs" color="secondary">Tree (selected / expanded / disabled / checkable)</Text>
          <Tree
            treeData={DISPLAY2_TREE_DATA}
            defaultExpandedKeys={['documents']}
            defaultSelectedKeys={['selected-file']}
            checkable
            showLine
            onSelect={() => undefined}
            onExpand={() => undefined}
            onCheck={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-calendar">
          <Text size="xs" color="secondary">Calendar (selected != today, disabled Sundays)</Text>
          <Calendar
            value={new Date(2026, 6, 8)}
            disabledDate={(date) => date.getDay() === 0}
            fullscreen={false}
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-list">
          <Text size="xs" color="secondary">List (bordered, header/footer, split)</Text>
          <List
            header="Team members"
            footer="3 members"
            bordered
            dataSource={['Ada Lovelace', 'Alan Turing', 'Grace Hopper']}
            renderItem={(item) => {
              const name = String(item);
              return (
                <List.Item key={name} actions={[<Button key="edit" size="xs">Edit</Button>]}>
                  <List.Item.Meta
                    avatar={<Avatar size="sm" name={name.split(' ').map((part) => part[0]).join('')} />}
                    title={name}
                    description="Member"
                  />
                </List.Item>
              );
            }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-timeline">
          <Text size="xs" color="secondary">Timeline (tones + pending)</Text>
          <Timeline pending="Recording...">
            <Timeline.Item color="success" label="09:00">Order placed</Timeline.Item>
            <Timeline.Item color="warning" label="09:15">Payment pending</Timeline.Item>
            <Timeline.Item color="error" label="09:30">Payment failed</Timeline.Item>
          </Timeline>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-descriptions">
          <Text size="xs" color="secondary">Descriptions (bordered, horizontal, spanning cell)</Text>
          <Descriptions title="Order #1029" bordered column={2}>
            <Descriptions.Item label="Status">Shipped</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>$128.00</Descriptions.Item>
          </Descriptions>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-statistic">
          <Text size="xs" color="secondary">Statistic + Countdown (trend variants, loading)</Text>
          <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Statistic title="Revenue" value={128000} prefix="$" valueType="positive" />
            <Statistic title="Errors" value={12} valueType="negative" />
            <Statistic title="Loading" value={0} loading />
            <Statistic.Countdown title="Sale ends" value={Date.now() + 3600000} valueType="warning" />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-typography">
          <Text size="xs" color="secondary">Typography (Heading / Text / Paragraph / Link)</Text>
          <Stack spacing="xs">
            <Heading level="h3" color="primary">Section heading</Heading>
            <Text color="muted">Muted inline text</Text>
            <Paragraph color="secondary">A short paragraph of body copy for size comparison.</Paragraph>
            <Link href="/display2-link" color="primary">Learn more</Link>
          </Stack>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-tooltip">
          <Text size="xs" color="secondary">Tooltip (closed at rest; hover to open)</Text>
          <Box style={{ paddingTop: 32, paddingBottom: 16 }}>
            <Tooltip content="Pinned tooltip content" placement="top">
              <Button data-testid="probe-display2-tooltip-trigger" size="xs">Hover me</Button>
            </Tooltip>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-display2-callout">
          <Text size="xs" color="secondary">Callout (tones + closable + action)</Text>
          <Stack spacing="xs">
            <Callout tone="info" title="Heads up" closable onClose={() => undefined}>Informational message.</Callout>
            <Callout tone="danger" title="Error" action={<Button size="xs">Retry</Button>}>Something failed.</Callout>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-05 checkpoint L layout-family data-part
// probe (Box, Layout, Collapse, Divider, Splitter). Every instance below is
// deterministic -- forced controlled props, never a live drag or toggle --
// so the grid renders identically on every load. Rendered only behind
// `?layout=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// Layout.Sider is shown TWICE (collapsed=false and collapsed=true, both
// controlled) so the P-76-adjacent data-collapsed state is photographed in
// both positions without any interaction. The outer Layout's own
// `min-h-screen` Tailwind class is overridden via the `style` prop it
// already merges last -- the same "style={{ position: 'static' }}"
// torture-page idiom already used above for FloatButton/BackTop/
// MobileHeader/ActionDock/Affix, not a change to the component itself.
function LayoutStates() {
  return (
    <Box
      data-testid="probe-layout"
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
        <Stack spacing="xs" data-testid="probe-layout-box">
          <Text size="xs" color="secondary">Box</Text>
          <Box style={{ padding: 12, border: '1px dashed var(--ds-color-border)' }}>
            <Text size="xs">Plain style-injection Box</Text>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-layout">
          <Text size="xs" color="secondary">Layout (Sider expanded / Sider collapsed / Header / Content / Footer)</Text>
          <Layout hasSider style={{ minHeight: 220, border: '1px solid var(--ds-color-border)', borderRadius: 8, overflow: 'hidden' }}>
            <Layout.Sider theme="dark" collapsible collapsed={false} width={140} style={{ minHeight: 220 }}>
              <Text size="xs" style={{ padding: 8, display: 'block' }}>Nav (expanded)</Text>
            </Layout.Sider>
            <Layout.Sider theme="light" collapsible collapsed width={80} style={{ minHeight: 220 }}>
              <Text size="xs" style={{ padding: 8, display: 'block' }}>Nav</Text>
            </Layout.Sider>
            <Layout style={{ minHeight: 220 }}>
              <Layout.Header height={48}>
                <Text size="xs">Header</Text>
              </Layout.Header>
              <Layout.Content>
                <Text size="xs">Content</Text>
              </Layout.Content>
              <Layout.Footer>
                <Text size="xs">Footer</Text>
              </Layout.Footer>
            </Layout>
          </Layout>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-collapse">
          <Text size="xs" color="secondary">Collapse (expanded / collapsed / disabled)</Text>
          <Collapse defaultActiveKey={['open']}>
            <Collapse.Panel header="Open panel" panelKey="open">
              <Text size="xs">Expanded content</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Closed panel" panelKey="closed">
              <Text size="xs">Collapsed content</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Disabled panel" panelKey="disabled" disabled>
              <Text size="xs">Disabled content</Text>
            </Collapse.Panel>
          </Collapse>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-divider">
          <Text size="xs" color="secondary">Divider (horizontal/vertical x plain/with-text)</Text>
          <Stack spacing="sm">
            <Divider />
            <Divider>With text</Divider>
          </Stack>
          <Box style={{ display: 'flex', alignItems: 'center', height: 48, gap: 12 }}>
            <Text size="xs">Left</Text>
            <Divider orientation="vertical" />
            <Text size="xs">Mid</Text>
            <Divider orientation="vertical">Tag</Divider>
            <Text size="xs">Right</Text>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-splitter">
          <Text size="xs" color="secondary">Splitter (horizontal / vertical, at rest)</Text>
          <Box style={{ height: 100, border: '1px solid var(--ds-color-border)', borderRadius: 8, overflow: 'hidden' }}>
            <Splitter layout="horizontal">
              <Splitter.Panel defaultSize={40}>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>Left</Text>
              </Splitter.Panel>
              <Splitter.Panel>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>Right</Text>
              </Splitter.Panel>
            </Splitter>
          </Box>
          <Box style={{ height: 100, border: '1px solid var(--ds-color-border)', borderRadius: 8, overflow: 'hidden' }}>
            <Splitter layout="vertical">
              <Splitter.Panel defaultSize={40}>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>Top</Text>
              </Splitter.Panel>
              <Splitter.Panel>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>Bottom</Text>
              </Splitter.Panel>
            </Splitter>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-D/F patterns/forms
// data-part probe (FilterBuilder, FormBuilder, StepWizard, InvoiceTemplate).
// Per the checkpoint contract these are SIX INDEPENDENT SKINS (each
// component owns its own enum-to-style map; there is no shared tone
// vocabulary across them) -- fixtures below are deliberately per-component,
// not unified. Every instance is deterministic: controlled `currentStep`/
// `values` props stand in for what would otherwise be internal React state,
// so the grid renders identically on every load. Rendered only behind
// `?forms=1` so no flagship capture sees it. This page is the
// visual-evidence half; FormsBatch.contract.test.tsx renders its own
// fixtures directly through React Testing Library.
const FORMS_FILTER_FIELDS: FilterFieldDefinition[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ] },
  { key: 'joined', label: 'Joined', type: 'date' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'tags', label: 'Tags', type: 'multiSelect', options: [
    { value: 'vip', label: 'VIP' },
    { value: 'new', label: 'New' },
  ] },
];

// Root group (AND) with a first text rule, a second number rule ("AND"
// label), and a nested OR group covering select/date/boolean/multiSelect --
// exercises every FilterFieldType's data-field-type on `value-input`, both
// `data-logic` values on `logic-toggle`, both `data-root` states on `group`,
// and both "Where"/"AND"/"OR" positions of `rule-logic-label`.
const FORMS_FILTER_VALUE: FilterGroup = {
  id: 'fb-root',
  logic: 'and',
  rules: [
    { id: 'fb-r1', field: 'name', operator: 'contains', value: 'ada' },
    { id: 'fb-r2', field: 'age', operator: 'gt', value: 21 },
    {
      id: 'fb-g1',
      logic: 'or',
      rules: [
        { id: 'fb-r3', field: 'status', operator: 'equals', value: 'active' },
        { id: 'fb-r4', field: 'joined', operator: 'equals', value: '2026-01-01' },
        { id: 'fb-r5', field: 'active', operator: 'equals', value: true },
        { id: 'fb-r6', field: 'tags', operator: 'in', value: 'vip' },
      ],
    },
  ],
};

const FORMS_BUILDER_FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'select', options: [
    { label: 'Engineer', value: 'engineer' },
    { label: 'Designer', value: 'designer' },
  ] },
  { name: 'active', label: 'Active', type: 'checkbox' },
  { name: 'plan', label: 'Plan', type: 'radio', options: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
  ] },
  { name: 'notify', label: 'Notify', type: 'switch' },
  { name: 'startDate', label: 'Start date', type: 'date' },
  { name: 'resume', label: 'Resume', type: 'file' },
  { name: 'brandColor', label: 'Brand color', type: 'color' },
  { name: 'satisfaction', label: 'Satisfaction', type: 'slider' },
  { name: 'rating', label: 'Rating', type: 'rating' },
];

// Read-only fixture: one value per readOnly-branch (checkbox/select/
// multi-select/color/rating/file/default) plus one omitted field (empty
// branch), exercising every `data-field-type` the read-only switch keys on
// and the category-B color-swatch (SKIN-EXEMPT-RUNTIME-VALUE, `background:
// String(val)` -- deliberately not a token, transcribed byte-exact).
const FORMS_BUILDER_READONLY_FIELDS: FieldDef[] = [
  { name: 'active', label: 'Active', type: 'checkbox' },
  { name: 'role', label: 'Role', type: 'select', options: [{ label: 'Engineer', value: 'engineer' }] },
  { name: 'tags', label: 'Tags', type: 'multi-select', options: [{ label: 'VIP', value: 'vip' }] },
  { name: 'brandColor', label: 'Brand color', type: 'color' },
  { name: 'rating', label: 'Rating', type: 'rating' },
  { name: 'resume', label: 'Resume', type: 'file' },
  { name: 'notes', label: 'Notes', type: 'text' },
  { name: 'empty', label: 'Empty', type: 'text' },
];
const FORMS_BUILDER_READONLY_VALUES: Record<string, unknown> = {
  active: true,
  role: 'engineer',
  tags: ['vip'],
  brandColor: '#4f46e5',
  rating: 4,
  resume: 'resume.pdf',
  notes: 'Some notes',
  // `empty` intentionally omitted -- exercises the empty/'--' branch.
};

const FORMS_WIZARD_STEPS: WizardStep[] = [
  { key: 'account', title: 'Account', description: 'Basic info', content: <Text size="xs">Account step content</Text> },
  { key: 'profile', title: 'Profile', description: 'Tell us more', content: <Text size="xs">Profile step content</Text>, optional: true },
  { key: 'review', title: 'Review', content: <Text size="xs">Review step content</Text> },
];

const FORMS_INVOICE_BASE: InvoiceData = {
  number: 'INV-2026-0042',
  date: '2026-07-01',
  dueDate: '2026-07-15',
  currency: '$',
  company: {
    name: 'Rottay Inc.',
    address: '1 Market St',
    city: 'San Francisco',
    country: 'US',
    taxId: '94-1234567',
    email: 'billing@rottay.com',
  },
  client: {
    name: 'Acme Corp',
    address: '500 Main Ave',
    city: 'Austin',
    country: 'US',
    taxId: '74-7654321',
    email: 'ap@acme.example',
  },
  items: [
    { id: 'li-1', description: 'Design system license', quantity: 1, unitPrice: 4800, total: 4800 },
    { id: 'li-2', description: 'Onboarding support', quantity: 2, unitPrice: 600, total: 1200 },
  ],
  subtotal: 6000,
  taxRate: 8.5,
  tax: 510,
  total: 6510,
  notes: 'Thank you for your business.\nPayment due within 14 days.',
};

// One minimal invoice per status -- exercises every `data-status` value on
// `status-badge` (draft/sent/paid/overdue).
const FORMS_INVOICE_STATUSES: Array<'draft' | 'sent' | 'paid' | 'overdue'> = [
  'draft',
  'sent',
  'paid',
  'overdue',
];

function FormsFbFilterBuilder() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-filter-builder">
      <Text size="xs" color="secondary">FilterBuilder</Text>
      <PatternFilterBuilder
        fields={FORMS_FILTER_FIELDS}
        value={FORMS_FILTER_VALUE}
        onChange={() => undefined}
        allowGrouping
        showAddFilter
        showClear
        onClear={() => undefined}
      />
      <PatternFilterBuilder
        fields={FORMS_FILTER_FIELDS}
        value={{ id: 'fb-loading-root', logic: 'and', rules: [] }}
        onChange={() => undefined}
        loading
      />
    </Stack>
  );
}

function FormsFbFormBuilder() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-form-builder">
      <Text size="xs" color="secondary">FormBuilder (vertical)</Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_FIELDS}
        layout="vertical"
        title="Team member"
        description="Basic profile details."
        onSubmit={() => undefined}
        actions={<Button size="sm" variant="primary">Save</Button>}
      />
      <Text size="xs" color="secondary">FormBuilder (steps -- active/completed/upcoming)</Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_FIELDS}
        layout="steps"
        stepLabels={['Info', 'Review', 'Done']}
        currentStep={1}
        onStepChange={() => undefined}
        onSubmit={() => undefined}
      />
      <Text size="xs" color="secondary">FormBuilder (read-only)</Text>
      <PatternFormBuilder
        fields={FORMS_BUILDER_READONLY_FIELDS}
        readOnly
        values={FORMS_BUILDER_READONLY_VALUES}
        onSubmit={() => undefined}
      />
      <Text size="xs" color="secondary">FormBuilder (loading)</Text>
      <PatternFormBuilder fields={FORMS_BUILDER_FIELDS} onSubmit={() => undefined} loading />
    </Stack>
  );
}

function FormsFbStepWizard() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-step-wizard">
      <Text size="xs" color="secondary">StepWizard (horizontal, mid-step, skip)</Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        allowSkip
        orientation="horizontal"
      />
      <Text size="xs" color="secondary">StepWizard (horizontal, last step)</Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={FORMS_WIZARD_STEPS.length - 1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        orientation="horizontal"
      />
      <Text size="xs" color="secondary">StepWizard (vertical)</Text>
      <PatternStepWizard
        steps={FORMS_WIZARD_STEPS}
        currentStep={1}
        onStepChange={() => undefined}
        onComplete={() => undefined}
        orientation="vertical"
      />
      <Text size="xs" color="secondary">StepWizard (loading)</Text>
      <PatternStepWizard steps={FORMS_WIZARD_STEPS} onComplete={() => undefined} loading />
    </Stack>
  );
}

function FormsFbInvoiceTemplate() {
  return (
    <Stack spacing="xs" data-testid="probe-forms-invoice-template">
      <Text size="xs" color="secondary">InvoiceTemplate (full, paid)</Text>
      <PatternInvoiceTemplate
        invoice={{ ...FORMS_INVOICE_BASE, status: 'paid' }}
        onPrint={() => undefined}
        onExport={() => undefined}
      />
      {FORMS_INVOICE_STATUSES.map((status) => (
        <Box key={status}>
          <Text size="xs" color="secondary">{`InvoiceTemplate (status: ${status})`}</Text>
          <PatternInvoiceTemplate
            invoice={{
              number: `INV-STATUS-${status}`,
              date: '2026-07-01',
              company: { name: 'Rottay Inc.' },
              client: { name: 'Acme Corp' },
              items: [{ id: 'li-1', description: 'Line item', quantity: 1, unitPrice: 100, total: 100 }],
              subtotal: 100,
              tax: 0,
              total: 100,
              status,
            }}
            showActions={false}
          />
        </Box>
      ))}
      <Text size="xs" color="secondary">InvoiceTemplate (loading)</Text>
      <PatternInvoiceTemplate
        invoice={{ number: 'INV-LOADING', date: '2026-07-01', company: { name: 'Rottay Inc.' }, client: { name: 'Acme Corp' }, items: [], subtotal: 0, tax: 0, total: 0 }}
        loading
      />
    </Stack>
  );
}

function FormsFbStates() {
  return (
    <Box
      data-testid="probe-forms"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <FormsFbFilterBuilder />
        <FormsFbFormBuilder />
        <FormsFbStepWizard />
        <FormsFbInvoiceTemplate />
      </Stack>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-D/R data-part probe
// (FormSections, FormFactsCard, record's five exports, edit-fields' eight
// exports, ApprovalWorkflow, GuidedDraftFormSurface, and the three tiny
// composition-only surfaces FormSurface/WizardSurface/DetailFormSurface).
// Per the checkpoint contract these are SIX INDEPENDENT SKINS -- form-sections'
// tone map and record's variant map share two border values by coincidence,
// not by shared code, so fixtures are deliberately per-component. Every
// instance is deterministic: controlled props stand in for internal state
// (isOpen via activeKeys, currentStep via a fixed index) so the grid renders
// identically on every load. Rendered only behind `?record=1` so no flagship
// capture sees it. This page is the visual-evidence half; RecordBatch.
// contract.test.tsx renders its own fixtures directly through React Testing
// Library.
const RECORD_FORM_SECTIONS = [
  {
    key: 'fs-default',
    title: 'General',
    description: 'Default tone, open.',
    tone: 'default' as const,
    required: true,
    children: <Text size="xs">Default tone content</Text>,
  },
  {
    key: 'fs-editorial',
    title: 'Narrative',
    description: 'Editorial tone, open, with a summary chip.',
    tone: 'editorial' as const,
    optional: true,
    summary: '3 fields',
    children: <Text size="xs">Editorial tone content</Text>,
  },
  {
    key: 'fs-technical',
    title: 'Configuration',
    description: 'Technical tone, closed.',
    tone: 'technical' as const,
    children: <Text size="xs">Technical tone content</Text>,
  },
  {
    key: 'fs-governance',
    title: 'Compliance',
    description: 'Governance tone, closed.',
    tone: 'governance' as const,
    children: <Text size="xs">Governance tone content</Text>,
  },
];

function RecordFbFormSections() {
  return (
    <Stack spacing="xs" data-testid="probe-record-form-sections">
      <Text size="xs" color="secondary">FormSections (card, collapsible -- two open, two closed)</Text>
      <FormSections
        sections={RECORD_FORM_SECTIONS}
        collapsible
        activeKeys={['fs-default', 'fs-editorial']}
        onChange={() => undefined}
      />
      <Text size="xs" color="secondary">FormSections (divided, non-collapsible)</Text>
      <FormSections sections={RECORD_FORM_SECTIONS.slice(0, 2)} appearance="divided" />
      <Text size="xs" color="secondary">FormFactsCard</Text>
      <FormFactsCard
        eyebrow="Summary"
        title="Account facts"
        description="Read-only key facts."
        items={[
          { label: 'Plan', value: 'Enterprise', helper: 'Renews annually' },
          { label: 'Owner', value: 'Ada Lovelace', mono: false },
          { label: 'Reference', value: 'ACC-0042', mono: true },
        ]}
      />
    </Stack>
  );
}

const RECORD_SUMMARY_VARIANTS = ['default', 'editorial', 'technical', 'governance', 'metrics'] as const;
const RECORD_SUMMARY_ITEMS = [
  { label: 'Status', value: 'Active' },
  { label: 'Owner', value: 'Ada Lovelace', helper: 'Assigned 3 days ago' },
  { label: 'Reference', value: 'REC-0091', mono: true },
];

function RecordFbRecord() {
  return (
    <Stack spacing="xs" data-testid="probe-record-record">
      <Text size="xs" color="secondary">RecordSummaryStrip (all 5 variants)</Text>
      {RECORD_SUMMARY_VARIANTS.map((variant) => (
        <RecordSummaryStrip key={variant} items={RECORD_SUMMARY_ITEMS} variant={variant} />
      ))}
      <Text size="xs" color="secondary">RecordFieldGrid (plain / mono / empty / href / copy)</Text>
      <RecordFieldGrid>
        <RecordField label="Name" value="Ada Lovelace" />
        <RecordField label="Reference" value="REC-0091" mono />
        <RecordField label="Notes" value={undefined} />
        <RecordField label="Profile" value="View profile" href="/probe/record" />
        <RecordField label="API key" value="sk_live_••••" mono copyValue="sk_live_secret" />
      </RecordFieldGrid>
      <Text size="xs" color="secondary">RecordActionBar</Text>
      <RecordActionBar
        meta="3 unsaved changes"
        actionItems={[
          { label: 'Cancel', onClick: () => undefined },
          { label: 'Save', variant: 'primary', onClick: () => undefined },
        ]}
      />
      <Text size="xs" color="secondary">RecordPanel</Text>
      <RecordPanel>
        <Text size="sm">Generic panel content.</Text>
      </RecordPanel>
    </Stack>
  );
}

function RecordFbEditFields() {
  const [advancedExpanded, setAdvancedExpanded] = useState(true);
  return (
    <Stack spacing="xs" data-testid="probe-record-edit-fields">
      <Text size="xs" color="secondary">InlineEditorGroup (two editors, one headerless)</Text>
      <InlineEditorGroup>
        <InlineEditor title="Profile" eyebrow="Section 01" description="Primary identity fields.">
          <InlineEditGrid kind="primary">
            <InlineEditField label="Full name" fieldNumber="01" requirement="required" htmlFor="probe-edit-name">
              <Input id="probe-edit-name" defaultValue="Ada Lovelace" />
            </InlineEditField>
            <InlineEditField label="Nickname" fieldNumber="02" requirement="recommended">
              <Input placeholder="Optional" />
            </InlineEditField>
            <InlineEditField
              label="Email"
              fieldNumber="03"
              requirement="optional"
              hasError
              errorMessage="Enter a valid email address"
            >
              <Input defaultValue="not-an-email" />
            </InlineEditField>
          </InlineEditGrid>
          <InlineEditGrid kind="advanced" expanded={advancedExpanded} unmountWhenCollapsed={false}>
            <InlineEditField label="Internal ID" fieldNumber="04" requirement="optional">
              <Input disabled defaultValue="usr_0042" />
            </InlineEditField>
          </InlineEditGrid>
          <MoreFieldsToggle expanded={advancedExpanded} onToggle={() => setAdvancedExpanded((v) => !v)} />
        </InlineEditor>
        <InlineEditor title="Preferences" headerless>
          <InlineEditGrid kind="primary" columns="repeat(2, minmax(0, 1fr))">
            <InlineEditField label="Timezone" requirement="recommended">
              <Input defaultValue="UTC" />
            </InlineEditField>
          </InlineEditGrid>
        </InlineEditor>
      </InlineEditorGroup>
      <Text size="xs" color="secondary">InlineEditFooter (plain / error / saving)</Text>
      <InlineEditFooter summary="No changes yet" onCancel={() => undefined} onSave={() => undefined} />
      <InlineEditFooter
        error="Fix the highlighted fields before saving"
        onCancel={() => undefined}
        onSave={() => undefined}
      />
      <InlineEditFooter
        dirtySummary="3 fields changed"
        onCancel={() => undefined}
        onSave={() => undefined}
        isSaving
      />
    </Stack>
  );
}

const APPROVAL_WORKFLOW_STEPS: ApprovalStep[] = [
  { key: 'manager', approver: 'Jane Smith', status: 'approved', timestamp: '2026-07-01T09:00:00Z', comments: 'Looks good' },
  { key: 'director', approver: 'Bob Johnson', status: 'pending' },
  { key: 'finance', approver: 'Finance Team', status: 'skipped' },
  { key: 'legal', approver: 'Legal Dept', status: 'rejected', comments: 'Needs revision' },
  { key: 'exec', approver: 'Executive Sponsor', status: 'escalated' },
];

function RecordFbApprovalWorkflow() {
  return (
    <Stack spacing="xs" data-testid="probe-record-approval-workflow">
      <Text size="xs" color="secondary">ApprovalWorkflow (all 5 statuses, current step pending)</Text>
      <PatternApprovalWorkflow
        title="Expense Report"
        entity="EXP-9981"
        steps={APPROVAL_WORKFLOW_STEPS}
        currentStep={1}
        onApprove={() => undefined}
        onReject={() => undefined}
        onEscalate={() => undefined}
      />
      <Text size="xs" color="secondary">ApprovalWorkflow (loading)</Text>
      <PatternApprovalWorkflow title="Loading" steps={[]} loading />
    </Stack>
  );
}

function buildGuidedDraftSections(): FormSection[] {
  return [
    { key: 'basics', title: 'Basics', render: () => <Text size="xs">Basics content</Text>, isComplete: true },
    { key: 'details', title: 'Details', render: () => <Text size="xs">Details content</Text>, hasErrors: true },
    { key: 'review', title: 'Review', render: () => <Text size="xs">Review content</Text> },
  ];
}

function RecordFbGuidedDraftForm() {
  const sections = buildGuidedDraftSections();
  return (
    <Stack spacing="xs" data-testid="probe-record-guided-draft-form">
      <Text size="xs" color="secondary">GuidedDraftFormSurface (scroll, sidebar nav, unsaved)</Text>
      <GuidedDraftFormSurface
        title="New job posting"
        subtitle="Draft-heavy create flow"
        sections={sections}
        draftStatus="unsaved"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'sidebar-nav' } }}
      />
      <Text size="xs" color="secondary">GuidedDraftFormSurface (scroll, pill nav, saving)</Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        draftStatus="saving"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'pill-nav' } }}
      />
      <Text size="xs" color="secondary">GuidedDraftFormSurface (scroll, dropdown nav, saved, with templates + recovery)</Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        draftStatus="saved"
        lastSavedAt="2 min ago"
        onSubmit={() => undefined}
        adaptive={{ desktop: { formLayout: 'dropdown-nav' } }}
        draftRecovery={{ hasDraft: true, onRecover: () => undefined, onDiscard: () => undefined, draftDate: 'yesterday' }}
        templates={{ items: [{ id: 't1', name: 'Standard template', description: 'Common fields pre-filled.' }], onSelect: () => undefined }}
      />
      <Text size="xs" color="secondary">GuidedDraftFormSurface (wizard mode, error status, validation issues)</Text>
      <GuidedDraftFormSurface
        title="New job posting"
        sections={sections}
        mode="wizard"
        draftStatus="error"
        onSubmit={() => undefined}
        validationIssues={[
          { field: 'Title', message: 'Title is required', severity: 'error' },
          { field: 'Budget', message: 'Budget looks unusually high', severity: 'warning' },
        ]}
      />
    </Stack>
  );
}

function RecordFbSurfaces() {
  const formConfig: FormSurfaceConfig = {
    visual: { layout: 'horizontal', columns: 2 },
    presentation: {
      chrome: { title: 'Create record' },
      description: 'Standard single-page form shell.',
      aside: <Text size="xs">Helpful aside content</Text>,
      error: <Text size="xs">Something went wrong saving this record.</Text>,
    },
    behavior: {
      fields: [],
      submitAction: { id: 'submit-record', label: 'Create record', variant: 'primary', onClick: () => undefined },
      cancelAction: { id: 'cancel-record', label: 'Cancel', onClick: () => undefined },
    },
  };

  const wizardConfig: WizardSurfaceConfig = {
    visual: {},
    presentation: {
      chrome: { title: 'Setup flow' },
      error: <Text size="xs">A step failed validation.</Text>,
      aside: <Text size="xs">Setup guidance</Text>,
    },
    behavior: {
      steps: [{ key: 'review', title: 'Review', content: <Text size="xs">Review the setup</Text> }],
      submitAction: { id: 'complete-setup', label: 'Complete setup', variant: 'primary', onClick: () => undefined },
    },
  };

  const detailFormConfig: DetailFormSurfaceConfig = {
    visual: {},
    presentation: {
      chrome: { title: 'Edit workspace' },
      summary: <Text size="xs">Workspace summary</Text>,
      error: <Text size="xs">Unable to save this workspace.</Text>,
    },
    behavior: {
      fields: [],
      submitAction: { id: 'save-workspace', label: 'Save changes', variant: 'primary', onClick: () => undefined },
      cancelAction: { id: 'cancel-edit', label: 'Cancel', onClick: () => undefined },
    },
  };

  return (
    <Stack spacing="xs" data-testid="probe-record-surfaces">
      <Text size="xs" color="secondary">FormSurface</Text>
      <FormSurface config={formConfig} />
      <Text size="xs" color="secondary">WizardSurface</Text>
      <WizardSurface config={wizardConfig} />
      <Text size="xs" color="secondary">DetailFormSurface</Text>
      <DetailFormSurface config={detailFormConfig} />
    </Stack>
  );
}

function RecordFbStates() {
  return (
    <Box
      data-testid="probe-record"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <RecordFbFormSections />
        <RecordFbRecord />
        <RecordFbEditFields />
        <RecordFbApprovalWorkflow />
        <RecordFbGuidedDraftForm />
        <RecordFbSurfaces />
      </Stack>
    </Box>
  );
}

// Fixed fixtures for the WO-SKIN-06 checkpoint CK-B/S structures/headers
// data-part probe (DetailHeader, EditHeader, FormHeader, CollectionHeader,
// DashboardHeader). Per the checkpoint contract this half is FOUR
// independent token sets (Edit=Form share one archetype recipe byte-for-
// byte; Detail is the same 8-layer shape with every numeric value
// diverging; Collection and Dashboard are unrelated) -- fixtures below are
// deliberately per-component and, for the archetype recipe, cover all four
// `archetype` values for Detail AND separately for Edit/Form, since their
// numbers are NOT interchangeable. Every instance is deterministic --
// controlled props only, no live clock, no real navigation -- so the grid
// renders identically on every load. Rendered only behind `?headers=1` so
// no flagship capture sees it. This page is the visual-evidence half;
// HeadersBatch.contract.test.tsx renders its own fixtures directly through
// React Testing Library.
//
// EditHeader's back-button/breadcrumb-link `<style>` block (§4 of the
// contract) is DEAD today -- both rules lose to inline styles on the same
// elements. This page renders EditHeader normally (the dead rule is not
// disarmed here); headers-structures-batch.spec.ts's hover pins are what
// prove the deadness photographically.
const HEADERS_DETAIL_ARCHETYPES = ['editorial', 'control', 'technical', 'governance'] as const;
const HEADERS_DETAIL_SECONDARY_ARCHETYPES = ['control', 'technical', 'governance'] as const;
const HEADERS_TABS = [
  { id: 'overview', label: 'Overview', count: 3 },
  { id: 'activity', label: 'Activity', count: 0 },
  { id: 'settings', label: 'Settings' },
];

function HeadersFbDetailHeader() {
  // Controlled `activeTab` state (not a fixed prop) so
  // headers-structures-batch.spec.ts's tab-click interaction pin actually
  // exercises the isActive->CSS mapping instead of clicking a tab whose
  // "active" prop never changes. This is the first-rendered DetailHeader
  // instance (archetype 'editorial') so the spec's `.first()` selector
  // reaches it.
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Stack spacing="xs" data-testid="probe-headers-detail">
      <Text size="xs" color="secondary">DetailHeader (all 4 archetypes -- Detail-specific numbers, not Edit/Form&apos;s)</Text>
      <DetailHeader
        title="Acme Corp (editorial)"
        subtitle="Enterprise customer since 2019"
        avatar="AC"
        status={{ label: 'Active', variant: 'success' }}
        backHref="/customers"
        breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
        actions={[{ label: 'Edit', onClick: () => undefined }]}
        tabs={HEADERS_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metadata={[
          { label: 'Owner', value: 'Ada Lovelace' },
          { label: 'Region', value: 'EMEA', mono: true },
        ]}
        eyebrow="Customer"
        archetype="editorial"
      />
      {HEADERS_DETAIL_SECONDARY_ARCHETYPES.map((archetype) => (
        <DetailHeader
          key={archetype}
          title={`Acme Corp (${archetype})`}
          subtitle="Enterprise customer since 2019"
          avatar="AC"
          status={{ label: 'Active', variant: 'success' }}
          backHref="/customers"
          breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
          actions={[{ label: 'Edit', onClick: () => undefined }]}
          tabs={HEADERS_TABS}
          activeTab="overview"
          onTabChange={() => undefined}
          metadata={[
            { label: 'Owner', value: 'Ada Lovelace' },
            { label: 'Region', value: 'EMEA', mono: true },
          ]}
          eyebrow="Customer"
          archetype={archetype}
        />
      ))}
      <Text size="xs" color="secondary">DetailHeader (avatar image variant, no tabs, no metadata)</Text>
      {/* renderAvatarNode picks the image branch only for a string
          starting with 'http' or '/' -- a broken-image glyph is fine
          evidence for the chrome/layout this probe captures. */}
      <DetailHeader
        title="Grace Hopper"
        backHref="/people"
        avatar="/probe-avatar-placeholder.png"
      />
    </Stack>
  );
}

function HeadersFbEditHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-edit">
      <Text size="xs" color="secondary">EditHeader (all 4 archetypes -- byte-identical recipe to FormHeader, NOT Detail&apos;s)</Text>
      {HEADERS_DETAIL_ARCHETYPES.map((archetype) => (
        <EditHeader
          key={archetype}
          icon={TagIcon}
          title={`Edit workspace (${archetype})`}
          subtitle="Editing workspace settings"
          entityId="ws_9f8e7d6c5b4a"
          backHref="/workspaces"
          colorVariant="primary"
          breadcrumb={[{ label: 'Workspaces', href: '/workspaces' }, { label: 'Current' }]}
          status={{ label: 'Draft', color: 'warning' }}
          archetype={archetype}
          eyebrow="Workspace"
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      ))}
      <Text size="xs" color="secondary">EditHeader (loading)</Text>
      <EditHeader title="Loading" backHref="/x" loading />
    </Stack>
  );
}

function HeadersFbFormHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-form">
      <Text size="xs" color="secondary">FormHeader (all 4 archetypes -- byte-identical recipe to EditHeader)</Text>
      {HEADERS_DETAIL_ARCHETYPES.map((archetype) => (
        <FormHeader
          key={archetype}
          icon={TagIcon}
          title={`Create workspace (${archetype})`}
          subtitle="Set up a new workspace"
          backHref="/workspaces"
          colorVariant="success"
          breadcrumb={[{ label: 'Workspaces', href: '/workspaces' }]}
          actions={[{ label: 'Create', onClick: () => undefined }]}
          archetype={archetype}
          eyebrow="New"
        />
      ))}
    </Stack>
  );
}

function HeadersFbCollectionHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-collection">
      <Text size="xs" color="secondary">CollectionHeader (dotted title, editorial-tech, quickActions all 3 variants, meta-item all 3 tones)</Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Candidates"
        titleTreatment="dotted"
        subtitle="All active candidates across the pipeline"
        layoutVariant="editorial-tech"
        metaItems={[
          { key: 'a', label: '12 active', tone: 'primary' },
          { key: 'b', label: '3 flagged', tone: 'success' },
          { key: 'c', label: 'Neutral', tone: 'neutral' },
        ]}
        shortcuts={[{ key: 's', label: '⌘K search' }]}
        quickActions={[
          { key: 'q1', label: 'Invite', onClick: () => undefined, variant: 'primary' },
          { key: 'q2', label: 'Export', onClick: () => undefined, variant: 'secondary' },
          { key: 'q3', label: 'More', onClick: () => undefined },
        ]}
        surfaceVariant="default"
      />
      <Text size="xs" color="secondary">CollectionHeader (display title, embedded, no quickActions -- title-accent + no-quickActions secondary-rail branch)</Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Overview"
        titleTreatment="display"
        subtitle="Program overview"
        metaItems={[{ key: 'a', label: '4 items', tone: 'neutral' }]}
        shortcuts={[{ key: 's', label: '⌘K search' }]}
        surfaceVariant="embedded"
      />
      <Text size="xs" color="secondary">CollectionHeader (default title treatment, default layout, not embedded)</Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Reports"
        subtitle="Weekly report summary"
        surfaceVariant="default"
      />
      {/* The quick-actions PILL container's background/boxShadow only
          branch on `editorialTech` when `embedded` is true (not-embedded
          collapses to one value regardless of editorialTech), and the pill
          only renders at all when quickActions is non-empty. These two
          instances cover the two embedded+quickActions states. */}
      <Text size="xs" color="secondary">CollectionHeader (embedded, editorial-tech, quickActions -- quick-actions pill embedded+editorialTech branch)</Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Pipeline"
        titleTreatment="dotted"
        subtitle="Embedded editorial-tech with quick actions"
        layoutVariant="editorial-tech"
        quickActions={[{ key: 'q1', label: 'Invite', onClick: () => undefined, variant: 'primary' }]}
        surfaceVariant="embedded"
      />
      <Text size="xs" color="secondary">CollectionHeader (embedded, default layout, quickActions -- quick-actions pill embedded+non-editorialTech branch)</Text>
      <CollectionHeader
        eyebrow="Workspace"
        title="Pipeline"
        subtitle="Embedded default layout with quick actions"
        quickActions={[{ key: 'q1', label: 'Invite', onClick: () => undefined }]}
        surfaceVariant="embedded"
      />
    </Stack>
  );
}

function HeadersFbDashboardHeader() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-dashboard">
      <Text size="xs" color="secondary">DashboardHeader (compact, status=live -- animating; toHaveScreenshot freezes CSS animations by default, see REST TRUTH note in the spec)</Text>
      <DashboardHeader
        title="Overview"
        icon={<TagIcon style={{ width: 16, height: 16 }} />}
        status={{ state: 'live' }}
        metrics={[{ key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } }]}
        actions={[{ key: 'a1', label: 'Refresh', onClick: () => undefined }]}
        compact
      />
      <Text size="xs" color="secondary">DashboardHeader (full, status=connected -- static, all 3 metric-change directions)</Text>
      <DashboardHeader
        title="Overview"
        subtitle="Live operational metrics"
        icon={<TagIcon style={{ width: 18, height: 18 }} />}
        status={{ state: 'connected' }}
        metrics={[
          { key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } },
          { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
          { key: 'm3', label: 'Latency', value: '120ms', change: { value: '0%', direction: 'flat' } },
        ]}
        actions={[
          { key: 'a1', label: 'Refresh', onClick: () => undefined },
          { key: 'a2', label: 'Export', onClick: () => undefined, variant: 'primary' },
        ]}
      />
      <Text size="xs" color="secondary">DashboardHeader (full, status=syncing -- animating)</Text>
      <DashboardHeader title="Overview" status={{ state: 'syncing' }} metrics={[{ key: 'm1', label: 'Sync', value: '82%' }]} />
      <Text size="xs" color="secondary">DashboardHeader (full, status=offline)</Text>
      <DashboardHeader title="Overview" status={{ state: 'offline' }} />
      <Text size="xs" color="secondary">DashboardHeader (full, status=warning)</Text>
      <DashboardHeader title="Overview" status={{ state: 'warning' }} />
    </Stack>
  );
}

function HeadersFbStates() {
  return (
    <Box
      data-testid="probe-headers"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <HeadersFbDetailHeader />
        <HeadersFbEditHeader />
        <HeadersFbFormHeader />
        <HeadersFbCollectionHeader />
        <HeadersFbDashboardHeader />
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Fixed fixtures for the WO-SKIN-06 checkpoint CK-B/P patterns/misc header
// data-part probe (CockpitHeader, PageShell, WorkbenchHeader). Every value is a
// literal, so the section renders identically on every load. Rendered only
// behind `?headers-patterns=1` so no flagship capture sees it.
//
// Renders every state a skin rule in this checkpoint keys on: all five
// CockpitStatus variants (STATUS_PILL_STYLES is a 5-way map), all three
// WorkbenchQuickAction variants plus a disabled one (variantStyles is a 3-way
// map whose `hover` sub-object is SPREAD over its `base` — the P-78 shape),
// active/inactive tabs in both tab strips, the terminal `isLast` crumb, a
// labelled back button, PageShell's no-tabs `rule` branch, and all three
// loading-skeleton branches.
//
// `isCompact` is NOT driven from here. headers-patterns-batch.spec.ts stubs
// `window.scrollY` and dispatches the scroll event CockpitHeader listens for,
// so the viewport never moves and no other fixture in this grid shifts under
// it. The sticky instance below exists only so that listener is attached.
//
// Only PageShell has a rustic engine. CockpitHeader and WorkbenchHeader map
// rustic -> `./engines/classic`, so under `?engine=rustic` those two bands
// render the CLASSIC engine, which this checkpoint does not own.
// ---------------------------------------------------------------------------

const HP_CRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Event #1234' },
];

const HP_STATUS: CockpitStatus[] = [
  { label: 'Active', variant: 'success' },
  { label: 'Pending', variant: 'warning' },
  { label: 'Failed', variant: 'error' },
  { label: 'VIP', variant: 'info' },
  { label: 'Draft', variant: 'default' },
];

const HP_QUICK_ACTIONS: WorkbenchQuickAction[] = [
  { label: 'Save', onClick: () => undefined, variant: 'primary' },
  { label: 'Delete', onClick: () => undefined, variant: 'danger' },
  { label: 'Archive', onClick: () => undefined, variant: 'default' },
  { label: 'Locked', onClick: () => undefined, variant: 'default', disabled: true },
];

const HP_SAVED_VIEWS = [
  { id: 'default', label: 'Default View' },
  { id: 'compact', label: 'Compact View' },
];

function HeadersPatternsFbCockpit() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-cockpit">
      <Text size="xs" color="secondary">CockpitHeader (all five status variants)</Text>
      <PatternCockpitHeader
        title="Event #1234"
        subtitle="Summer Music Festival — Main Stage"
        breadcrumbs={HP_CRUMBS}
        status={HP_STATUS}
        onBack={() => undefined}
        actions={<Button size="sm">Edit</Button>}
      />
    </Stack>
  );
}

function HeadersPatternsFbCockpitSticky() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-cockpit-sticky">
      <Text size="xs" color="secondary">CockpitHeader (sticky — compact on scroll)</Text>
      <PatternCockpitHeader
        title="Event #1234"
        subtitle="Sticky instance"
        breadcrumbs={HP_CRUMBS}
        status={[HP_STATUS[0]]}
        onBack={() => undefined}
        sticky
      />
    </Stack>
  );
}

function HeadersPatternsFbPageShell() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-page-shell">
      <Text size="xs" color="secondary">PageShell (tabs, labelled back, badge, header content)</Text>
      <PatternPageShell
        title="Users"
        subtitle="Manage platform users"
        breadcrumbs={HP_CRUMBS}
        back={{ label: 'Settings', onClick: () => undefined }}
        badge={<Badge variant="primary">beta</Badge>}
        headerContent={<Text size="xs">Header content slot</Text>}
        actions={<Button size="sm">Add User</Button>}
        tabs={[
          { key: 'all', label: 'All', content: <Text size="xs">All records</Text> },
          { key: 'archived', label: 'Archived', content: <Text size="xs">Archived records</Text> },
        ]}
        activeTab="all"
        onTabChange={() => undefined}
      >
        {/* PageShellProps.children is required even when tabs supply the body:
            with tabs present the modern engine renders the active tab's content
            and ignores children. */}
        <Text size="xs">Tab-driven body</Text>
      </PatternPageShell>
    </Stack>
  );
}

function HeadersPatternsFbPageShellNoTabs() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-page-shell-notabs">
      <Text size="xs" color="secondary">PageShell (no tabs — the bare rule branch)</Text>
      <PatternPageShell title="Users" subtitle="No tabs">
        <Text size="xs">Content</Text>
      </PatternPageShell>
    </Stack>
  );
}

function HeadersPatternsFbWorkbench() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-workbench">
      <Text size="xs" color="secondary">WorkbenchHeader (three quick-action variants + disabled)</Text>
      <PatternWorkbenchHeader
        title="Operations Dashboard"
        subtitle="Morning briefing"
        exceptionCount={3}
        quickActions={HP_QUICK_ACTIONS}
        savedViews={HP_SAVED_VIEWS}
        activeViewId="default"
        onViewChange={() => undefined}
      />
    </Stack>
  );
}

function HeadersPatternsFbLoading() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-loading">
      <Text size="xs" color="secondary">Loading branches (cockpit 6 blocks / page-shell 5 / workbench 6)</Text>
      <PatternCockpitHeader title="Loading" loading />
      <PatternPageShell title="Loading" loading>
        <Text size="xs">Body</Text>
      </PatternPageShell>
      <PatternWorkbenchHeader title="Loading" loading />
    </Stack>
  );
}

function HeadersPatternsFbStates() {
  return (
    <Box
      data-testid="probe-headers-patterns"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <HeadersPatternsFbCockpit />
        <HeadersPatternsFbCockpitSticky />
        <HeadersPatternsFbPageShell />
        <HeadersPatternsFbPageShellNoTabs />
        <HeadersPatternsFbWorkbench />
        <HeadersPatternsFbLoading />
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-G -- patterns/navigation family torture section (?navigation=1).
//
// Distinct from the WO-SKIN-04 PRIMITIVES navigation family (?nav=1 /
// probe-nav): this is the five PATTERNS (command-palette, environment-toggle,
// workspace-switcher, shortcuts-overlay, locale-switcher).
//
// The two position:fixed overlays (command-palette, shortcuts-overlay) are
// wrapped in a transform'd ancestor so their fixed position resolves to the
// band instead of the viewport -- a CSS containing-block trick that changes
// ONLY where they sit, never their paint, and lives here in the showroom, never
// in a component. Both render `open`. command-palette carries recent + grouped
// items so BOTH duplicated result sections and a group-label render, and so the
// spec has a keyboard-active row (activeIndex 0) to hover a DIFFERENT row
// against (the guard). The two absolute-dropdown switchers render at rest --
// their `open` is internal state, and per the inventory both are 100%
// STATE-SELECTED with zero imperative writes, so the imperative-write risk the
// visual pins exist to catch lives entirely in command-palette.
// ---------------------------------------------------------------------------

const NAV_ENVIRONMENTS = [
  { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
  { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
  { id: 'prod', name: 'Production', color: '#ef4444', badge: 'PROD' },
];

const NAV_COMMAND_ITEMS = [
  { id: 'nav-dashboard', label: 'Open dashboard', description: 'Jump to the control plane', group: 'Navigation', shortcut: 'G D', onSelect: () => undefined },
  { id: 'nav-approvals', label: 'Review approvals', description: 'Pending sign-offs', group: 'Actions', shortcut: 'A', onSelect: () => undefined },
];

const NAV_COMMAND_RECENT = [
  { id: 'nav-recent', label: 'Create event', description: 'Last used', shortcut: 'C', onSelect: () => undefined },
];

const NAV_SHORTCUTS = [
  { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
  { key: 'shift+?', description: 'Show keyboard shortcuts', category: 'Global' },
  { key: 'g d', description: 'Go to dashboard', category: 'Navigation' },
];

const NAV_WORKSPACES = [
  { id: 'ws-1', name: 'Rottay Shell', role: 'Admin', plan: 'enterprise', unreadCount: 5, online: 23 },
  { id: 'ws-2', name: 'BitHire Ops', role: 'Member', plan: 'pro' },
];

const NAV_OVERLAY_BAND: CSSProperties = {
  position: 'relative',
  transform: 'translateZ(0)',
  height: 520,
  overflow: 'hidden',
  borderRadius: 12,
  border: '1px solid var(--ds-color-border)',
};

const DASH_ACTIVITY: ActivityItem[] = [
  { text: 'Deployed release v2.4', time: '2m', type: 'success' },
  { text: 'New candidate applied', time: '5m', type: 'primary' },
  { text: 'Weekly report generated', time: '12m', type: 'info' },
  { text: 'Storage quota near limit', time: '30m', type: 'warning' },
  { text: 'Sync job failed', time: '1h', type: 'error' },
];

const DASH_METRICS: KeyMetric[] = [
  { label: 'Open roles', value: '42', change: '+3', positive: true, icon: TagIcon, trend: 'up', progress: 80 },
  { label: 'Time to hire', value: '18d', change: '-2', positive: false, icon: TagIcon, trend: 'down', progress: 40 },
  { label: 'Offers out', value: '12', change: '+5', positive: true, icon: TagIcon, trend: 'up', progress: 65 },
  { label: 'Declines', value: '4', change: '-1', positive: false, icon: TagIcon, trend: 'down', progress: 20 },
];

const DASH_STATS: StatItem[] = [
  { key: 'rev', label: 'Revenue', value: 128400, change: 8, changeType: 'increase', periodLabel: 'this week', prefix: '$', icon: <TagIcon />, insight: 'Ahead of plan', sparkDots: [30, 45, 60, 40, 80, 70, 95], accentColor: 'primary' },
  { key: 'churn', label: 'Churn', value: 12, change: 2, changeType: 'decrease', periodLabel: 'this week', suffix: '%', icon: <TagIcon />, insight: 'Watch closely', sparkDots: [20, 25, 30, 22, 40, 35, 50], accentColor: 'error' },
  { key: 'nps', label: 'NPS', value: 52, change: 0, changeType: 'neutral', periodLabel: 'this week', icon: <TagIcon />, accentColor: 'success' },
  { key: 'load', label: 'Load', value: 60, suffix: '%', progress: 60, icon: <TagIcon />, accentColor: 'warning' },
];

// WO-SKIN-06 CK-A -- dashboard-widgets family. Every ActivityItem type (all 5)
// renders in each activity variant; both metric.positive branches render; the
// four DataTerminalCard variant bodies are pinned via the `variant` prop (the
// only door to the private CommandCard/HUDCard/CircuitCard/MatrixCard) with
// progress spanning the three getProgressColor bands and both trends;
// DataTerminalStat and StatsHeader (all three changeType values + sparkline +
// a progress-only card) round it out.
function DashboardWidgetsStates() {
  return (
    <Stack spacing="md" data-testid="probe-dashboard">
      <Text size="xs" color="secondary">
        Dashboard widgets — CK-A (activity ×4, metrics ×4, data-terminal ×4 variants + stat, stats-header)
      </Text>

      <Box
        data-testid="probe-dashboard-activity"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}
      >
        <Box data-testid="probe-dashboard-activity-ticker">
          <ActivityTicker items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-timeline">
          <ActivityTimeline items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-compact">
          <ActivityCompact items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
        <Box data-testid="probe-dashboard-activity-cards">
          <ActivityCards items={DASH_ACTIVITY} viewAllHref="#" />
        </Box>
      </Box>

      <Box
        data-testid="probe-dashboard-metrics"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}
      >
        <Box data-testid="probe-dashboard-metrics-minimal">
          <MetricsMinimal metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-cards">
          <MetricsCards metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-chart">
          <MetricsChart metrics={DASH_METRICS} />
        </Box>
        <Box data-testid="probe-dashboard-metrics-rows">
          <MetricsRows metrics={DASH_METRICS} />
        </Box>
      </Box>

      <Box
        data-testid="probe-dashboard-terminal"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}
      >
        <Box data-testid="probe-dashboard-terminal-1">
          <DataTerminalCard variant={1} label="Tickets" value={1234} change="+12%" trend="up" progress={85} path="#" subtitle="This week" icon={TagIcon} hideOnFocus={false} />
        </Box>
        <Box data-testid="probe-dashboard-terminal-2">
          <DataTerminalCard variant={2} label="Revenue" value={982} change="-4%" trend="down" progress={60} path="#" subtitle="This week" icon={TagIcon} hideOnFocus={false} />
        </Box>
        <Box data-testid="probe-dashboard-terminal-3">
          <DataTerminalCard variant={3} label="Signups" value={451} change="+8%" trend="up" progress={30} path="#" subtitle="This week" icon={TagIcon} hideOnFocus={false} />
        </Box>
        <Box data-testid="probe-dashboard-terminal-4">
          <DataTerminalCard variant={4} label="Latency" value={73} change="-2%" trend="down" progress={90} path="#" subtitle="This week" icon={TagIcon} hideOnFocus={false} />
        </Box>
        <Box data-testid="probe-dashboard-terminal-stat">
          <DataTerminalStat label="Errors" value={12} change="+1" trend="up" progress={50} icon={TagIcon} />
        </Box>
      </Box>

      <Box data-testid="probe-dashboard-stats">
        <StatsHeader stats={DASH_STATS} />
      </Box>
    </Stack>
  );
}

function NavigationPatternsFbStates() {
  return (
    <Box
      data-testid="probe-navigation-patterns"
      style={{ borderRadius: 16, border: '1px solid var(--ds-color-border)', background: 'var(--ds-color-bg-elevated)', padding: 16 }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-navigation-patterns-command-palette">
          <Box style={NAV_OVERLAY_BAND}>
            <PatternCommandPalette
              open
              onOpenChange={() => undefined}
              placeholder="Jump to a surface or action"
              items={NAV_COMMAND_ITEMS}
              recentItems={NAV_COMMAND_RECENT}
              footer="Press Esc to close"
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-shortcuts-overlay">
          <Box style={NAV_OVERLAY_BAND}>
            <PatternShortcutsOverlay
              open
              onOpenChange={() => undefined}
              title="Keyboard shortcuts"
              shortcuts={NAV_SHORTCUTS}
              footer="Press Esc to close"
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-environment-toggle">
          <PatternEnvironmentToggle
            environments={NAV_ENVIRONMENTS}
            activeEnvironment="staging"
            onChange={() => undefined}
            productionId="prod"
            variant="toggle"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-workspace-switcher">
          <PatternWorkspaceSwitcher
            workspaces={NAV_WORKSPACES}
            activeWorkspaceId="ws-1"
            onSwitch={() => undefined}
            onCreate={() => undefined}
            onSettings={() => undefined}
            currentUser={{ name: 'Jane Doe', email: 'jane@rottay.com' }}
            position="sidebar"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-locale-switcher">
          <PatternLocaleSwitcher
            locale="en"
            onChange={() => undefined}
            locales={DEFAULT_LOCALES}
            showLabel
          />
        </Stack>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-F -- patterns/communication family torture section
// (?communication=1). Six components: the four engine-split patterns
// (comment-thread, notification-center, activity-log, live-feed) plus
// assistant's 8 exports and presence's 3 exports (both engine-agnostic).
//
// Fixture data is chosen to hit every stamped state attribute at least once:
// comment-thread's reaction pill (active + inactive) and a nested reply;
// notification-center's 4 types are not all exercised (2 shown is enough to
// prove data-type renders per row) plus one read + one unread row and one
// action button; activity-log's three classifier categories (create/update/
// delete) plus a diff and both avatar branches (image + fallback initial);
// live-feed's refresh/banner/load-more; assistant's AssistantStatusIndicator
// across all 5 statuses and PreviewDiffCard's 3 change values; presence's
// PresenceBar overflow badge and a LiveCursor in its own relative band.
// ---------------------------------------------------------------------------

const COMM_COMMENTS = [
  {
    id: 'cm-1',
    author: { name: 'Priya Shah' },
    content: 'Can we ship this by Friday?',
    timestamp: '2h ago',
    edited: true,
    reactions: [
      { emoji: '👍', count: 4, active: true },
      { emoji: '👀', count: 1, active: false },
    ],
    replies: [
      { id: 'cm-1-r1', author: { name: 'Dev Costa' }, content: 'Yes, on track.', timestamp: '1h ago' },
    ],
  },
];

const COMM_NOTIFICATIONS = [
  { id: 'cn-1', title: 'Deployment succeeded', message: 'v2.4 is live on production', type: 'success' as const, read: false, timestamp: '5m ago', action: { label: 'View', onClick: () => undefined } },
  { id: 'cn-2', title: 'License expiring soon', message: 'Renew within 14 days', type: 'warning' as const, read: true, timestamp: '1d ago' },
];

const COMM_ACTIVITIES = [
  { id: 'ca-1', user: { name: 'Priya Shah' }, action: 'created record', timestamp: new Date().toISOString(), entityType: 'order', entityId: '881' },
  {
    id: 'ca-2',
    user: { name: 'Dev Costa', avatar: 'https://i.pravatar.cc/48?img=12' },
    action: 'updated record',
    timestamp: new Date().toISOString(),
    diff: { status: { from: 'draft', to: 'active' } },
  },
  { id: 'ca-3', user: { name: 'Ana Ruiz' }, action: 'deleted record', timestamp: new Date().toISOString() },
];

interface CommFeedItem {
  key: string;
  isNew?: boolean;
  label: string;
  [extra: string]: unknown;
}

const COMM_FEED_ITEMS: CommFeedItem[] = [
  { key: 'cf-1', isNew: true, label: 'New signup: Dev Costa' },
  { key: 'cf-2', label: 'Report exported' },
];

const COMM_DIFF_ROWS = [
  { label: 'name', before: 'Q1 Draft', after: 'Q1 Final', change: 'updated' as const },
  { label: 'owner', after: 'Priya Shah', change: 'added' as const },
  { label: 'legacy_id', before: 'ORD-881', change: 'removed' as const },
];

const COMM_STATUSES = ['thinking', 'streaming', 'acting', 'error', 'idle'] as const;

function CommunicationFbStates() {
  return (
    <Box
      data-testid="probe-communication"
      style={{ borderRadius: 16, border: '1px solid var(--ds-color-border)', background: 'var(--ds-color-bg-elevated)', padding: 16 }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-communication-comment-thread">
          <PatternCommentThread
            comments={COMM_COMMENTS}
            currentUser={{ name: 'Priya Shah' }}
            onAdd={() => undefined}
            onEdit={() => undefined}
            onDelete={() => undefined}
            onReply={() => undefined}
            onReaction={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-notification-center">
          <PatternNotificationCenter
            notifications={COMM_NOTIFICATIONS}
            unreadCount={1}
            open
            onRead={() => undefined}
            onReadAll={() => undefined}
            onClear={() => undefined}
            onClearAll={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-activity-log">
          <PatternActivityLog
            activities={COMM_ACTIVITIES}
            actionTypes={['created', 'updated', 'deleted']}
            users={[{ name: 'Priya Shah' }, { name: 'Dev Costa' }]}
            onFilterChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-communication-live-feed">
          <PatternLiveFeed
            items={COMM_FEED_ITEMS}
            renderItem={(item) => <Text size="sm">{(item as CommFeedItem).label}</Text>}
            onRefresh={() => undefined}
            header={<Text weight="semibold">Live activity</Text>}
            newItemsCount={2}
            onShowNewItems={() => undefined}
            hasMore
            onLoadMore={() => undefined}
          />
        </Stack>

        <Stack spacing="sm" data-testid="probe-communication-assistant">
          <Text size="xs" color="secondary">assistant -- 8 exports</Text>
          <Stack direction="horizontal" spacing="sm" align="center">
            <AssistantStatusBadge label="Streaming" tone="info" />
            <StreamingText text="Drafting a response..." streaming />
            <TypingIndicator />
          </Stack>
          <ToolCallCard name="search_records" status="complete" duration="0.8s" summary="3 matches" />
          <Stack direction="horizontal" spacing="sm" align="center">
            {COMM_STATUSES.map((status) => (
              <AssistantStatusIndicator key={status} status={status} />
            ))}
          </Stack>
          <PreviewDiffCard title="Proposed change" rows={COMM_DIFF_ROWS} />
          <ConfirmActionCard
            summary="Apply this change to the live record?"
            onConfirm={() => undefined}
            onCancel={() => undefined}
          />
          <MessageBubble
            author="Priya Shah"
            parts={[{ type: 'text', content: 'Looks good to me.' }]}
            timestamp="2m ago"
            align="end"
          />
        </Stack>

        <Stack spacing="sm" data-testid="probe-communication-presence">
          <Text size="xs" color="secondary">presence -- 3 exports</Text>
          <PresenceBar
            users={[
              { id: 'pu-1', name: 'Priya Shah', avatar: 'https://i.pravatar.cc/48?img=12', color: '#e74c3c' },
              { id: 'pu-2', name: 'Dev Costa', color: '#3498db' },
              { id: 'pu-3', name: 'Ana Ruiz', color: '#2ecc71' },
              { id: 'pu-4', name: 'Sam Lee', color: '#9b59b6' },
            ]}
            maxVisible={2}
          />
          <PresenceTypingIndicator users={[{ name: 'Priya Shah' }, { name: 'Dev Costa' }]} />
          <Box style={{ position: 'relative', height: 100, borderRadius: 8, border: '1px dashed var(--ds-color-border)' }}>
            <LiveCursor user={{ name: 'Priya Shah', color: '#e74c3c' }} position={{ x: 40, y: 30 }} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-C -- the workspace-chrome family torture section
// (?workspace=1). 11 components: list-toolbar (modern only -- rustic
// re-exports classic), saved-views (both engines), status-filter-pills, and
// the 8 structures/workspace components. column-menu/saved-views-menu/
// export-button portal their panels to document.body -- rendered `open` here
// so the panel content (and its standalone scope class) shows up in the
// screenshot even though it is not a DOM descendant of this band.
// ---------------------------------------------------------------------------

const WC_FILTER_PILLS: FilterPillConfig[] = [
  { key: 'status', label: 'Status', value: 'active', options: [{ value: 'active', label: 'Active' }, { value: 'all', label: 'All' }] },
  { key: 'owner', label: 'Owner', value: '', options: [{ value: '', label: 'Anyone' }] },
];

function WorkspaceChromeFbStates() {
  return (
    <Box
      data-testid="probe-workspace"
      style={{ borderRadius: 16, border: '1px solid var(--ds-color-border)', background: 'var(--ds-color-bg-elevated)', padding: 16 }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-workspace-list-toolbar">
          <PatternListToolbar
            title="Candidates"
            totalCount={42}
            search=""
            onSearchChange={() => undefined}
            filterPills={WC_FILTER_PILLS}
            activeFilters={{ status: 'active' }}
            activeFilterCount={1}
            viewMode="list"
            onViewModeChange={() => undefined}
            density="comfortable"
            onDensityChange={() => undefined}
            onExport={() => undefined}
            onFilterChange={() => undefined}
            onClearFilters={() => undefined}
            primaryAction={{ label: 'New candidate', onClick: () => undefined }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-saved-views">
          <PatternSavedViewsBar
            views={[
              { id: 'v1', name: 'My tasks', isDefault: true, config: {} },
              { id: 'v2', name: 'All open', config: {} },
            ]}
            activeViewId="v1"
            onViewSelect={() => undefined}
            onViewSave={() => undefined}
            onViewDelete={() => undefined}
            onViewRename={() => undefined}
            onViewCreate={() => undefined}
            onViewDuplicate={() => undefined}
            allowCreate
            allowDelete
            allowRename
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-status-filter-pills">
          <StatusFilterPills
            options={[
              { value: 'open', label: 'Open', count: 4 },
              { value: 'closed', label: 'Closed', count: 1 },
            ]}
            value="open"
            onChange={() => undefined}
            showCounts
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-column-menu">
          <ColumnMenu
            columns={[{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }]}
            visibleColumns={['name']}
            onColumnsChange={() => undefined}
            onReset={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-saved-views-menu">
          <SavedViewsMenu
            views={[
              { key: 'sys-1', label: 'All', kind: 'system', isSystem: true, isDefault: true, state: {} },
              { key: 'custom-1', label: 'Mine', kind: 'custom', state: { query: 'x' } },
            ]}
            activeViewKey="sys-1"
            onViewSelect={() => undefined}
            onViewDelete={() => undefined}
            onViewSave={() => undefined}
            onSaveCurrentView={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-export-button">
          <ExportButton data={[{ a: 1 }]} columns={[{ key: 'a', header: 'A' }]} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-active-filters-bar">
          <ActiveFiltersBar
            activeFilters={[{ key: 'status', label: 'Status', value: 'active', displayValue: 'Active' }]}
            onRemoveFilter={() => undefined}
            onClearAll={() => undefined}
            onAddFilter={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-scope-switcher">
          <ScopeSwitcher
            scopes={[{ key: 'all', label: 'All', count: 12 }, { key: 'mine', label: 'Mine', count: 3 }]}
            activeScope="all"
            onScopeChange={() => undefined}
            variant="inline"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-view-mode-switcher">
          <ViewModeSwitcher
            modes={[
              { key: 'table', icon: <TagIcon />, label: 'Table' },
              { key: 'cards', icon: <TagIcon />, label: 'Cards', disabled: true },
            ]}
            value="table"
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-table-toolbar">
          <TableToolbar
            search=""
            onSearchChange={() => undefined}
            primaryAction={{ label: 'New', onClick: () => undefined }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-search-command-bar">
          <SearchCommandBar
            command={{ placeholder: 'Search...', value: '', onSearch: () => undefined, hint: 'Try a name or ID' }}
            surfaceVariant="embedded"
            layoutVariant="editorial-tech"
          />
        </Stack>
      </Stack>
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
  const display1 = useMemo(() => searchParams.get('display1') === '1', [searchParams]);
  const display2 = useMemo(() => searchParams.get('display2') === '1', [searchParams]);
  const layout = useMemo(() => searchParams.get('layout') === '1', [searchParams]);
  const forms = useMemo(() => searchParams.get('forms') === '1', [searchParams]);
  const record = useMemo(() => searchParams.get('record') === '1', [searchParams]);
  const headers = useMemo(() => searchParams.get('headers') === '1', [searchParams]);
  const headersPatterns = useMemo(() => searchParams.get('headers-patterns') === '1', [searchParams]);
  const navigationPatterns = useMemo(() => searchParams.get('navigation') === '1', [searchParams]);
  const dashboard = useMemo(() => searchParams.get('dashboard') === '1', [searchParams]);
  const communication = useMemo(() => searchParams.get('communication') === '1', [searchParams]);
  const workspace = useMemo(() => searchParams.get('workspace') === '1', [searchParams]);

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

            {display1 && <Display1States />}

            {display2 && <Display2States />}

            {layout && <LayoutStates />}

            {forms && <FormsFbStates />}

            {record && <RecordFbStates />}

            {headers && <HeadersFbStates />}
            {headersPatterns && <HeadersPatternsFbStates />}
            {navigationPatterns && <NavigationPatternsFbStates />}
            {dashboard && <DashboardWidgetsStates />}
            {communication && <CommunicationFbStates />}
            {workspace && <WorkspaceChromeFbStates />}

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
