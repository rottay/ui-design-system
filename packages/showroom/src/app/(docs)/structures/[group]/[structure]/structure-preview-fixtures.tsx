'use client';

import { useState, type ReactNode } from 'react';
import {
  ActiveFiltersBar,
  ActivityCompact,
  Badge,
  Box,
  Button,
  CollectionHeader,
  ColumnMenu,
  DashboardHeader,
  DataTerminalCard,
  DetailHeader,
  EditHeader,
  ExportButton,
  FieldFiltersPanel,
  Flex,
  FormHeader,
  FormSections,
  InlineEditField,
  InlineEditFooter,
  InlineEditGrid,
  InlineEditor,
  InlineEditorGroup,
  Input,
  LoadingOverlay,
  MetricsMinimal,
  MoreFieldsToggle,
  RecordActionBar,
  RecordField,
  RecordFieldGrid,
  RecordPanel,
  RecordSummaryStrip,
  SavedViewsMenu,
  ScopeSwitcher,
  SearchCommandBar,
  SelectionPreviewRail,
  Select,
  Stack,
  StatsHeader,
  TableToolbar,
  Text,
  ViewModeSwitcher,
  buildViewModes,
  type ActiveFilter,
  type ColumnMenuColumn,
  type ExportColumn,
  type FieldFilterDefinition,
  type FieldFilterPreset,
  type FieldFilterVisual,
  type SavedViewsMenuEntry,
  type ScopeDefinition,
  type SearchCommandBarCommand,
  type SearchCommandSuggestion,
  type SelectionPreviewRailColumn,
} from '@rottay/design-system';
import {
  Activity,
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Globe2,
  LifeBuoy,
  MapPinned,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';

const noop = () => {};

type WorkspaceRow = {
  id: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
  owner: string;
  region: string;
  scope: string;
  status: 'active' | 'inactive' | 'invited';
  statusLabel: string;
  joinedAt: string;
  usage: number;
};

type WorkspaceColumn = ColumnMenuColumn & {
  group?: string;
};

const WORKSPACE_ROWS: WorkspaceRow[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    fullName: 'Alice Johnson',
    email: 'alice@rottay.com',
    role: 'Platform Admin',
    owner: 'Sarah Johnson',
    region: 'North America',
    scope: 'Core platform',
    status: 'active',
    statusLabel: 'Active',
    joinedAt: '2026-01-15',
    usage: 92,
  },
  {
    id: '2',
    name: 'Bob Martinez',
    fullName: 'Bob Martinez',
    email: 'bob@rottay.com',
    role: 'Success Lead',
    owner: 'Sarah Johnson',
    region: 'EMEA',
    scope: 'Customer success',
    status: 'inactive',
    statusLabel: 'Paused',
    joinedAt: '2025-11-02',
    usage: 48,
  },
  {
    id: '3',
    name: 'Charlie Kim',
    fullName: 'Charlie Kim',
    email: 'charlie@rottay.com',
    role: 'Operations Analyst',
    owner: 'Miguel Ortiz',
    region: 'APAC',
    scope: 'Ops analytics',
    status: 'invited',
    statusLabel: 'Invited',
    joinedAt: '2026-04-18',
    usage: 16,
  },
];

const WORKSPACE_COLUMNS: WorkspaceColumn[] = [
  { key: 'name', title: 'Name', group: 'identity' },
  { key: 'email', title: 'Email', group: 'identity' },
  { key: 'role', title: 'Role', group: 'operations' },
  { key: 'statusLabel', title: 'Status', group: 'operations' },
  { key: 'owner', title: 'Owner', group: 'operations' },
  { key: 'region', title: 'Region', group: 'coverage' },
  { key: 'scope', title: 'Scope', group: 'coverage' },
  { key: 'usage', title: 'Usage', group: 'coverage' },
];

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'statusLabel', header: 'Status' },
  { key: 'usage', header: 'Usage', accessorFn: (row: WorkspaceRow) => `${row.usage}%` },
];

const ACTIVE_FILTERS: ActiveFilter[] = [
  {
    key: 'status',
    label: 'Status',
    value: 'active',
    displayValue: 'Active seats',
    field: 'status',
  },
  {
    key: 'region',
    label: 'Region',
    value: 'emea',
    displayValue: 'EMEA',
    field: 'region',
  },
  {
    key: 'owner',
    label: 'Owner',
    value: 'sarah',
    displayValue: 'Sarah Johnson',
    field: 'owner',
  },
];

const FIELD_FILTERS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Paused' },
      { value: 'invited', label: 'Invited' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'enum',
    placeholder: 'All regions',
    options: [
      { value: 'north-america', label: 'North America' },
      { value: 'emea', label: 'EMEA' },
      { value: 'apac', label: 'APAC' },
    ],
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    type: 'date-range',
    placeholder: 'Any join window',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: 'qtd', label: 'Quarter to date' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    type: 'select',
    placeholder: 'Any owner',
    options: [
      { value: 'sarah', label: 'Sarah Johnson' },
      { value: 'miguel', label: 'Miguel Ortiz' },
      { value: 'helen', label: 'Helen Park' },
    ],
  },
];

const FIELD_FILTER_PRESETS: FieldFilterPreset[] = [
  {
    key: 'risk-review',
    label: 'Risk review',
    values: {
      status: 'inactive',
      region: 'emea',
    },
  },
  {
    key: 'new-joins',
    label: 'New joins',
    values: {
      joinedAt: '30d',
      status: 'active',
    },
  },
];

const FIELD_FILTER_VISUALS: Record<string, FieldFilterVisual> = {
  status: {
    icon: <ShieldCheck size={16} />,
    description: 'Separate active seats from paused or invitation-only access.',
  },
  region: {
    icon: <Globe2 size={16} />,
    description: 'Focus operational follow-up by coverage region.',
  },
  joinedAt: {
    icon: <CalendarDays size={16} />,
    description: 'Audit recent onboarding waves and rollout windows.',
  },
  owner: {
    icon: <Users size={16} />,
    description: 'Route review queues to the accountable team lead.',
  },
};

const VIEW_MODES = buildViewModes(
  ['table', 'cards', 'kanban', 'calendar'],
  {
    calendar: {
      disabled: true,
      disabledReason: 'Add a date field to unlock calendar mode.',
    },
  },
);

const SCOPES: ScopeDefinition[] = [
  { key: 'all', label: 'All workspaces', count: 124 },
  { key: 'priority', label: 'Priority review', count: 19, filter: { priority: true } },
  { key: 'shared', label: 'Shared coverage', count: 42, filter: { shared: true } },
  { key: 'archived', label: 'Archived', count: 8, filter: { archived: true } },
];

const SAVED_VIEWS: SavedViewsMenuEntry[] = [
  {
    key: 'system-risk',
    label: 'Risk review',
    kind: 'system',
    isDefault: true,
    state: {
      scope: 'priority',
      query: 'inactive',
      filters: ACTIVE_FILTERS,
      visibleColumns: ['name', 'role', 'statusLabel', 'owner'],
      columnOrder: ['name', 'role', 'statusLabel', 'owner'],
      density: 'comfortable',
      sort: { field: 'usage', direction: 'desc' },
    },
  },
  {
    key: 'persona-success',
    label: 'Success follow-up',
    kind: 'persona',
    state: {
      scope: 'shared',
      query: 'owner:sarah',
      filters: [ACTIVE_FILTERS[2]],
      visibleColumns: ['name', 'owner', 'email', 'usage'],
      columnOrder: ['name', 'owner', 'email', 'usage'],
      density: 'compact',
      sort: { field: 'owner', direction: 'asc' },
    },
  },
  {
    key: 'custom-emea',
    label: 'EMEA seats',
    kind: 'custom',
    state: {
      scope: 'all',
      query: 'emea',
      filters: [ACTIVE_FILTERS[1]],
      visibleColumns: ['name', 'region', 'statusLabel', 'role'],
      columnOrder: ['name', 'region', 'statusLabel', 'role'],
      density: 'comfortable',
      sort: { field: 'region', direction: 'asc' },
    },
  },
];

const SEARCH_COMMANDS: SearchCommandBarCommand[] = [
  {
    id: 'invite-user',
    label: 'Invite teammate',
    description: 'Open the member invite flow.',
    category: 'Workspace',
    icon: <UserPlus size={14} />,
    shortcut: 'I',
    action: noop,
  },
  {
    id: 'export-risk-view',
    label: 'Export current view',
    description: 'Download the current workspace slice.',
    category: 'Workspace',
    icon: <Upload size={14} />,
    shortcut: 'E',
    action: noop,
  },
  {
    id: 'open-support-queue',
    label: 'Open support queue',
    description: 'Jump to escalations tied to this collection.',
    category: 'Operations',
    icon: <LifeBuoy size={14} />,
    shortcut: 'Q',
    action: noop,
  },
];

const PREVIEW_RAIL_COLUMNS: SelectionPreviewRailColumn<WorkspaceRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'email', title: 'Email', dataIndex: 'email' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
  { key: 'region', title: 'Region', dataIndex: 'region' },
  {
    key: 'usage',
    title: 'Usage',
    render: (_value, record) => `${record.usage}%`,
  },
];

const STATS = [
  {
    key: 'tickets',
    label: 'Tickets',
    value: 3248,
    accentColor: 'primary' as const,
    insight: 'Velocity still rising',
    change: 118,
    changeType: 'increase' as const,
    periodLabel: 'vs last week',
    sparkDots: [42, 55, 60, 51, 68, 74, 81],
    icon: <LifeBuoy size={16} />,
  },
  {
    key: 'finance',
    label: 'Revenue',
    value: '$182k',
    accentColor: 'success' as const,
    insight: 'Ahead of forecast',
    changeLabel: '+12.4%',
    changeType: 'increase' as const,
    periodLabel: 'month to date',
    sparkDots: [52, 58, 61, 67, 70, 78, 84],
    icon: <CreditCard size={16} />,
  },
  {
    key: 'coverage',
    label: 'Coverage',
    value: '97%',
    accentColor: 'info' as const,
    insight: 'APAC shift fully staffed',
    changeLabel: '+3 pts',
    changeType: 'increase' as const,
    periodLabel: 'this week',
    sparkDots: [61, 60, 64, 66, 72, 77, 79],
    icon: <Globe2 size={16} />,
  },
];

const DASHBOARD_INSIGHT_METRICS = [
  {
    label: 'Seats at risk',
    value: '18',
    change: '-12%',
    positive: true,
    icon: Users,
  },
  {
    label: 'Weekly invites',
    value: '41',
    change: '+8%',
    positive: true,
    icon: UserPlus,
  },
  {
    label: 'Queue SLA',
    value: '94%',
    change: '+2%',
    positive: true,
    icon: ShieldCheck,
  },
  {
    label: 'Coverage gaps',
    value: '6',
    change: '+1',
    positive: false,
    icon: MapPinned,
  },
];

const DASHBOARD_ACTIVITY_ITEMS = [
  {
    text: 'Alice escalated three inactive seats for review',
    time: '4m',
    type: 'warning' as const,
  },
  {
    text: 'Revenue sync finished across billing workspaces',
    time: '12m',
    type: 'success' as const,
  },
  {
    text: 'Support imported a new priority coverage list',
    time: '28m',
    type: 'primary' as const,
  },
  {
    text: 'Charlie acknowledged the APAC onboarding queue',
    time: '43m',
    type: 'info' as const,
  },
];

function CollectionHeaderPreview() {
  return (
    <CollectionHeader
      eyebrow="Platform workspace"
      title="Tenant access reviews"
      subtitle="Permission changes, invite follow-up, and seat utilization in one operational collection."
      titleTreatment="dotted"
      subtitleTreatment="mono-technical"
      layoutVariant="editorial-tech"
      surfaceVariant="embedded"
      metaItems={[
        { key: 'records', label: '124 workspaces', tone: 'primary' },
        { key: 'flagged', label: '19 flagged', tone: 'success' },
      ]}
      metaItemsPlacement="inline-start"
      shortcuts={[
        { key: 'slash', label: '/ search' },
        { key: 'cmdk', label: 'Cmd+K actions' },
      ]}
      quickActions={[
        { key: 'invite', label: 'Invite teammate', onClick: noop, variant: 'primary' },
        { key: 'import', label: 'Import CSV', onClick: noop, variant: 'secondary' },
      ]}
    />
  );
}

function DashboardHeaderPreview() {
  return (
    <DashboardHeader
      title="Platform health"
      subtitle="Live view of workspace utilization, queue pressure, and coverage drift."
      metrics={[
        {
          key: 'uptime',
          label: 'Uptime',
          value: '99.98%',
          change: { value: '0.2%', direction: 'up' },
        },
        {
          key: 'pending',
          label: 'Pending reviews',
          value: 18,
          change: { value: '3', direction: 'down' },
        },
        {
          key: 'sla',
          label: 'SLA hit rate',
          value: '94%',
          change: { value: '2%', direction: 'up' },
        },
      ]}
      status={{ state: 'live', label: 'Streaming now' }}
      actions={[
        { key: 'refresh', label: 'Refresh', icon: <RefreshCw size={14} />, onClick: noop },
        { key: 'share', label: 'Share board', onClick: noop, variant: 'primary' },
      ]}
      searchSlot={
        <Input
          placeholder="Search metrics or drilldowns"
          style={{ width: 'min(100%, 240px)' }}
        />
      }
      timeRangeSlot={
        <Badge variant="secondary" size="sm">
          Last 24 hours
        </Badge>
      }
      icon={<BarChart3 size={18} />}
    />
  );
}

function DetailHeaderPreview() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DetailHeader
      title="Alice Johnson"
      subtitle="Primary owner for the shared access review queue."
      avatar="AJ"
      status={{ label: 'Healthy', variant: 'success' }}
      backHref="/members"
      backLabel="Back to workspace"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Members', href: '/workspace/members' },
        { label: 'Alice Johnson' },
      ]}
      actions={[
        {
          label: 'Message owner',
          icon: MessageSquare,
          onClick: noop,
          variant: 'secondary',
        },
        {
          label: 'Adjust access',
          icon: UserCog,
          onClick: noop,
          variant: 'primary',
        },
      ]}
      tabs={[
        { id: 'overview', label: 'Overview', icon: Users },
        { id: 'activity', label: 'Activity', count: 12, icon: Activity },
        { id: 'billing', label: 'Billing', count: 2, icon: CreditCard },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      metadata={[
        { label: 'Owner', value: 'Sarah Johnson', icon: Users },
        { label: 'Region', value: 'North America', icon: Globe2 },
        { label: 'Trust tier', value: 'Tier 1', icon: ShieldCheck },
      ]}
      eyebrow="Member detail"
      archetype="technical"
      contextRail={
        <Flex gap={8} wrap="wrap">
          <Badge variant="secondary" size="sm">
            Seat utilization 92%
          </Badge>
          <Badge variant="secondary" size="sm">
            Last review Apr 18
          </Badge>
        </Flex>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Shared context and operational state stay attached to the header instead of being buried in the body.
      </Text>
    </DetailHeader>
  );
}

function EditHeaderPreview() {
  return (
    <EditHeader
      icon={UserCog}
      title="Edit tenant access policy"
      subtitle="Adjust reviewers, escalation paths, and required approvals before publishing."
      entityId="tap_4918a21c"
      backHref="/workspace/policies"
      backLabel="Back to policies"
      colorVariant="primary"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Policies', href: '/workspace/policies' },
        { label: 'Edit access policy' },
      ]}
      onSave={noop}
      onCancel={noop}
      extraActions={
        <Button size="sm" variant="ghost" onClick={noop}>
          Preview changes
        </Button>
      }
      status={{ label: 'Draft', color: 'warning' }}
      eyebrow="Policy editor"
      archetype="control"
      contextRail={
        <Badge variant="secondary" size="sm">
          Autosave off
        </Badge>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Save, cancel, and draft-state cues stay in the header so the form body can focus on the policy rules.
      </Text>
    </EditHeader>
  );
}

function FormHeaderPreview() {
  return (
    <FormHeader
      icon={UserPlus}
      title="Create teammate profile"
      subtitle="Start with workspace identity, access level, and routing preferences."
      backHref="/workspace/members"
      backLabel="Back to members"
      secondaryAction={{ label: 'Save draft', onClick: noop, variant: 'secondary' }}
      action={{ label: 'Create member', onClick: noop, variant: 'primary' }}
      colorVariant="primary"
      mode="create"
      breadcrumb={[
        { label: 'Workspace', href: '/workspace' },
        { label: 'Members', href: '/workspace/members' },
        { label: 'New member' },
      ]}
      eyebrow="Onboarding"
      archetype="editorial"
      contextRail={
        <Flex gap={8} wrap="wrap">
          <Badge variant="secondary" size="sm">
            3 required fields
          </Badge>
          <Badge variant="secondary" size="sm">
            Invite sends immediately
          </Badge>
        </Flex>
      }
    >
      <Text
        size="sm"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        The header carries route context, action intent, and field expectations before the form begins.
      </Text>
    </FormHeader>
  );
}

function SearchCommandBarPreview() {
  const [query, setQuery] = useState('inactive seats');

  const suggestions: SearchCommandSuggestion[] = [
    {
      key: 'flagged',
      label: 'Flagged this week',
      query: 'flagged:week',
      onSelect: () => setQuery('flagged:week'),
    },
    {
      key: 'emea',
      label: 'EMEA owners',
      query: 'region:emea owner:*',
      onSelect: () => setQuery('region:emea owner:*'),
    },
    {
      key: 'reviewers',
      label: 'Needs reviewer',
      query: 'reviewer:none',
      onSelect: () => setQuery('reviewer:none'),
    },
  ];

  return (
    <SearchCommandBar
      command={{
        placeholder: 'Search workspaces, people, and commands',
        value: query,
        onSearch: setQuery,
        hint: 'Press / to focus or Cmd+K for actions',
        suggestions,
        recentQueries: suggestions,
      }}
      commands={SEARCH_COMMANDS}
      topRailSlot={
        <Text
          size="xs"
          style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
        >
          Unified command and search rail for the active workspace slice.
        </Text>
      }
      actionsSlot={
        <Flex gap={8} wrap="wrap" align="center">
          <Badge variant="secondary" size="sm">
            3 scopes
          </Badge>
          <Button size="sm" variant="ghost" onClick={noop}>
            New view
          </Button>
        </Flex>
      }
      surfaceVariant="embedded"
      layoutVariant="editorial-tech"
    />
  );
}

function TableToolbarPreview() {
  const [search, setSearch] = useState('alice');
  const [isFiltered, setIsFiltered] = useState(true);

  return (
    <TableToolbar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search members"
      isFiltered={isFiltered}
      onResetFilters={() => setIsFiltered(false)}
      leftContent={
        <Badge variant="secondary" size="sm">
          12 flagged
        </Badge>
      }
      filters={
        <Flex gap={8} wrap="wrap" align="center">
          <Badge variant="secondary" size="sm">
            Status: Active
          </Badge>
          <Badge variant="secondary" size="sm">
            Region: EMEA
          </Badge>
        </Flex>
      }
      actions={
        <Flex gap={8} wrap="wrap" align="center">
          <Button size="sm" variant="ghost" onClick={noop}>
            Columns
          </Button>
          <Button size="sm" variant="ghost" onClick={noop}>
            Export
          </Button>
        </Flex>
      }
      primaryAction={{ label: 'Invite member', onClick: noop }}
    />
  );
}

function ActiveFiltersBarPreview() {
  const [filters, setFilters] = useState(ACTIVE_FILTERS);

  return (
    <ActiveFiltersBar
      activeFilters={filters}
      onRemoveFilter={(filterKey) => {
        setFilters((current) => current.filter((filter) => filter.key !== filterKey));
      }}
      onClearAll={() => setFilters([])}
      onAddFilter={() => {
        setFilters((current) => {
          if (current.some((filter) => filter.key === 'scope')) {
            return current;
          }

          return [
            ...current,
            {
              key: 'scope',
              label: 'Scope',
              value: 'shared',
              displayValue: 'Shared coverage',
              field: 'scope',
            },
          ];
        });
      }}
      surfaceVariant="embedded"
    />
  );
}

function ViewModeSwitcherPreview() {
  const [mode, setMode] = useState<(typeof VIEW_MODES)[number]['key']>('table');

  return (
    <Flex align="center" gap={12} wrap="wrap">
      <ViewModeSwitcher
        modes={VIEW_MODES}
        value={mode}
        onChange={(nextMode) => setMode(nextMode)}
        size="sm"
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Active mode: {mode}
      </Text>
    </Flex>
  );
}

function ExportButtonPreview() {
  return (
    <Stack spacing={8}>
      <ExportButton
        data={WORKSPACE_ROWS}
        columns={EXPORT_COLUMNS}
        filename="tenant-access-review"
        formats={['csv', 'json', 'clipboard']}
        size="sm"
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Exports 3 workspace rows with 5 mapped columns.
      </Text>
    </Stack>
  );
}

function ColumnMenuPreview() {
  const initialVisible = ['name', 'email', 'role', 'statusLabel', 'owner'];
  const initialOrder = WORKSPACE_COLUMNS.map((column) => column.key);

  const [visibleColumns, setVisibleColumns] = useState(initialVisible);
  const [columnOrder, setColumnOrder] = useState(initialOrder);
  const [visibleActions, setVisibleActions] = useState(['open', 'message']);
  const [pinnedColumns, setPinnedColumns] = useState({ left: ['name'], right: ['statusLabel'] });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    name: 240,
    email: 260,
    role: 180,
  });

  return (
    <Stack spacing={8}>
      <ColumnMenu
        columns={WORKSPACE_COLUMNS}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onColumnsChange={(nextVisible, nextOrder) => {
          setVisibleColumns(nextVisible);
          setColumnOrder(nextOrder);
        }}
        actions={[
          { key: 'open', title: 'Open record' },
          { key: 'message', title: 'Message owner' },
          { key: 'suspend', title: 'Suspend access', locked: true },
        ]}
        visibleActions={visibleActions}
        onVisibleActionsChange={setVisibleActions}
        onReset={() => {
          setVisibleColumns(initialVisible);
          setColumnOrder(initialOrder);
          setVisibleActions(['open', 'message']);
          setPinnedColumns({ left: ['name'], right: ['statusLabel'] });
          setColumnWidths({ name: 240, email: 260, role: 180 });
        }}
        pinnedColumns={pinnedColumns}
        onPinChange={setPinnedColumns}
        columnWidths={columnWidths}
        onColumnResize={(key, width) => {
          setColumnWidths((current) => ({ ...current, [key]: width }));
        }}
        groups={[
          { key: 'identity', label: 'Identity', columns: ['name', 'email'] },
          { key: 'operations', label: 'Operations', columns: ['role', 'statusLabel', 'owner'] },
          { key: 'coverage', label: 'Coverage', columns: ['region', 'scope', 'usage'] },
        ]}
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Visible now: {visibleColumns.join(', ')}
      </Text>
    </Stack>
  );
}

function FieldFiltersPanelPreview() {
  const [values, setValues] = useState<Record<string, string>>({
    status: 'active',
    region: 'emea',
    joinedAt: '30d',
    owner: 'sarah',
  });

  return (
    <FieldFiltersPanel
      filters={FIELD_FILTERS}
      presets={FIELD_FILTER_PRESETS}
      values={values}
      onChange={(filterKey, value) => {
        setValues((current) => ({ ...current, [filterKey]: value }));
      }}
      filterVisuals={FIELD_FILTER_VISUALS}
    />
  );
}

function SavedViewsMenuPreview() {
  const [views, setViews] = useState(SAVED_VIEWS);
  const [activeViewKey, setActiveViewKey] = useState(SAVED_VIEWS[0].key);

  const activeView =
    views.find((view) => view.key === activeViewKey) ??
    views.find((view) => view.isDefault) ??
    views[0];

  return (
    <Stack spacing={8}>
      <SavedViewsMenu
        views={views}
        activeViewKey={activeViewKey}
        onViewSelect={setActiveViewKey}
        onViewDelete={(viewKey) => {
          setViews((current) => current.filter((view) => view.key !== viewKey));
          if (viewKey === activeViewKey) {
            const next = views.find((view) => view.key !== viewKey);
            if (next) {
              setActiveViewKey(next.key);
            }
          }
        }}
        onViewSave={(view) => {
          setViews((current) => [...current, view]);
          setActiveViewKey(view.key);
        }}
        onSaveCurrentView={() => {
          const nextIndex = views.filter((view) => view.kind === 'custom').length + 1;
          const nextView: SavedViewsMenuEntry = {
            key: `custom-${nextIndex}`,
            label: `Ops draft ${nextIndex}`,
            kind: 'custom',
            state: activeView?.state ?? {
              filters: [],
              visibleColumns: initialVisibleColumns(),
            },
          };

          setViews((current) => [...current, nextView]);
          setActiveViewKey(nextView.key);
        }}
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Active view: {activeView?.label ?? 'None'}
      </Text>
    </Stack>
  );
}

function ScopeSwitcherPreview() {
  const [activeScope, setActiveScope] = useState('priority');

  return (
    <ScopeSwitcher
      scopes={SCOPES}
      activeScope={activeScope}
      onScopeChange={setActiveScope}
      variant="section"
    />
  );
}

function SelectionPreviewRailPreview() {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        minHeight: 280,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 88%, transparent), transparent)',
        borderRadius: 18,
      }}
    >
      <SelectionPreviewRail
        item={WORKSPACE_ROWS[0]}
        itemKey={WORKSPACE_ROWS[0].id}
        itemIndex={0}
        columns={PREVIEW_RAIL_COLUMNS}
        visibleColumns={['name', 'email', 'role', 'owner', 'region', 'usage']}
        rowActions={() => [
          {
            key: 'message',
            label: 'Message owner',
            icon: <MessageSquare size={14} />,
            onClick: noop,
          },
          {
            key: 'review',
            label: 'Review access',
            icon: <ShieldCheck size={14} />,
            onClick: noop,
            variant: 'primary',
          },
          {
            key: 'log',
            label: 'Open activity',
            icon: <FileText size={14} />,
            onClick: noop,
          },
        ]}
        onOpenItem={noop}
        onClose={noop}
        getMatchReason={(item) =>
          `${item.region} coverage match with ${item.statusLabel.toLowerCase()} seat activity.`
        }
        mode="selection"
      />
    </Box>
  );
}

function RecordFamilyPreview() {
  return (
    <Stack spacing={12}>
      <Flex gap={8} wrap="wrap">
        <Badge variant="secondary" size="sm">
          RecordSummaryStrip
        </Badge>
        <Badge variant="secondary" size="sm">
          RecordFieldGrid
        </Badge>
        <Badge variant="secondary" size="sm">
          RecordActionBar
        </Badge>
      </Flex>

      <RecordSummaryStrip
        variant="metrics"
        items={[
          { label: 'Role', value: 'Platform Admin' },
          { label: 'Status', value: <Badge variant="success">Active</Badge> },
          { label: 'Owner', value: 'Sarah Johnson' },
          { label: 'Region', value: 'North America' },
        ]}
      />

      <RecordPanel>
        <Stack spacing={12}>
          <Text size="sm" weight="semibold">
            Core record facts
          </Text>
          <RecordFieldGrid columns="repeat(auto-fit, minmax(220px, 1fr))">
            <RecordField
              label="Member"
              value="Alice Johnson"
              helper="Primary reviewer for shared workspace coverage."
            />
            <RecordField label="Email" value="alice@rottay.com" href="/members/alice-johnson" />
            <RecordField label="Seat ID" value="seat_01HYN4K92" mono copyValue="seat_01HYN4K92" />
            <RecordField label="Joined" value="2026-01-15" />
          </RecordFieldGrid>

          <RecordActionBar
            meta="High-signal details stay grouped while supporting actions remain pinned to the bottom."
            actions={
              <Flex gap={8} wrap="wrap">
                <Button size="sm" variant="ghost" onClick={noop}>
                  View timeline
                </Button>
                <Button size="sm" onClick={noop}>
                  Edit member
                </Button>
              </Flex>
            }
          />
        </Stack>
      </RecordPanel>
    </Stack>
  );
}

function FormSectionsPreview() {
  const [activeKeys, setActiveKeys] = useState<string[]>(['identity', 'access']);

  return (
    <FormSections
      appearance="card"
      tone="technical"
      sections={[
        {
          key: 'identity',
          title: 'Identity',
          description: 'Name, email, and workspace routing.',
          summary: <Badge variant="secondary">Required</Badge>,
          required: true,
          defaultOpen: true,
          children: (
            <Stack spacing={10}>
              <Input placeholder="Full name" value="Alice Johnson" onChange={noop} />
              <Input placeholder="Work email" value="alice@rottay.com" onChange={noop} />
            </Stack>
          ),
        },
        {
          key: 'access',
          title: 'Access & role',
          description: 'Assign the operational role and review scope.',
          summary: <Badge variant="secondary">2 fields</Badge>,
          defaultOpen: true,
          children: (
            <Stack spacing={10}>
              <Select
                value="platform-admin"
                onChange={noop}
                options={[
                  { value: 'platform-admin', label: 'Platform Admin' },
                  { value: 'operations-analyst', label: 'Operations Analyst' },
                  { value: 'success-lead', label: 'Success Lead' },
                ]}
              />
              <Input placeholder="Primary scope" value="Core platform" onChange={noop} />
            </Stack>
          ),
        },
        {
          key: 'notifications',
          title: 'Notifications',
          description: 'Choose how review changes should reach the owner.',
          optional: true,
          children: (
            <Stack spacing={8}>
              <Text
                size="sm"
                style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
              >
                Weekly digest enabled for escalations and new-seat review.
              </Text>
              <Flex gap={8} wrap="wrap">
                <Badge variant="secondary">Email digest</Badge>
                <Badge variant="secondary">Slack handoff</Badge>
              </Flex>
            </Stack>
          ),
        },
      ]}
      activeKeys={activeKeys}
      onChange={(nextKeys) => {
        setActiveKeys(Array.isArray(nextKeys) ? nextKeys : [nextKeys]);
      }}
    />
  );
}

function EditFieldsPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <InlineEditorGroup>
      <InlineEditor
        eyebrow="Edit"
        title="Member profile"
        description="Fields save to the same record; advanced fields stay collapsed until needed."
        footerProps={{
          dirtySummary: '2 fields changed',
          saveLabel: 'Save changes',
          onCancel: () => setExpanded(false),
          onSave: () => setExpanded(false),
        }}
      >
        <InlineEditGrid kind="primary" columns="repeat(2, minmax(0, 1fr))">
          <InlineEditField label="Full name" htmlFor="preview-name" requirement="required">
            <Input id="preview-name" value="Alice Johnson" onChange={noop} />
          </InlineEditField>
          <InlineEditField label="Work email" htmlFor="preview-email" requirement="required">
            <Input id="preview-email" value="alice@rottay.com" onChange={noop} />
          </InlineEditField>
        </InlineEditGrid>
        <InlineEditGrid kind="advanced" expanded={expanded} columns="repeat(2, minmax(0, 1fr))">
          <InlineEditField label="Secondary phone" htmlFor="preview-phone" requirement="optional" hint="Used only for after-hours escalation.">
            <Input id="preview-phone" placeholder="+1 (555) 000-0000" onChange={noop} />
          </InlineEditField>
          <InlineEditField label="Internal notes" htmlFor="preview-notes" requirement="recommended">
            <Input id="preview-notes" placeholder="Visible to teammates only" onChange={noop} />
          </InlineEditField>
        </InlineEditGrid>
        <MoreFieldsToggle expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
      </InlineEditor>
    </InlineEditorGroup>
  );
}

function StatsHeaderPreview() {
  return <StatsHeader stats={STATS} />;
}

function DataTerminalCardPreview() {
  return (
    <Box style={{ maxWidth: 360 }}>
      <DataTerminalCard
        label="Revenue pipeline"
        value="$182k"
        change="+12.5%"
        trend="up"
        icon={BarChart3}
        path="/analytics/revenue"
        progress={74}
        subtitle="target attainment"
        variant={2}
      />
    </Box>
  );
}

function DashboardInsightsFamilyPreview() {
  return (
    <Stack spacing={12}>
      <Flex gap={8} wrap="wrap">
        <Badge variant="secondary" size="sm">
          MetricsMinimal
        </Badge>
        <Badge variant="secondary" size="sm">
          ActivityCompact
        </Badge>
      </Flex>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        <MetricsMinimal metrics={DASHBOARD_INSIGHT_METRICS} />
        <ActivityCompact
          items={DASHBOARD_ACTIVITY_ITEMS}
          viewAllHref="/workspace/activity"
          viewAllLabel="Open feed"
        />
      </Box>
    </Stack>
  );
}

function LoadingOverlayPreview() {
  return (
    <Box
      style={{
        position: 'relative',
        minHeight: 180,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--ds-color-border-secondary)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent), color-mix(in srgb, var(--ds-color-bg-primary) 96%, transparent))',
      }}
    >
      <Stack spacing={12} style={{ padding: 18 }}>
        <Text size="sm" weight="semibold">
          Syncing workspace snapshots
        </Text>
        <Text
          size="sm"
          style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
        >
          Refreshing queue totals, usage deltas, and escalation routing.
        </Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[62, 48, 76].map((width, index) => (
            <Box
              key={`${width}-${index}`}
              style={{
                height: 72,
                borderRadius: 14,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 86%, transparent), color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent))',
                padding: 12,
              }}
            >
              <Box
                style={{
                  width: `${width}%`,
                  height: 10,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)',
                  marginBottom: 12,
                }}
              />
              <Box
                style={{
                  width: `${Math.max(width - 20, 28)}%`,
                  height: 8,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--ds-color-text-muted) 18%, transparent)',
                }}
              />
            </Box>
          ))}
        </Box>
      </Stack>

      <LoadingOverlay
        visible
        message="Syncing records"
        logo={
          <Box
            style={{
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              background: 'color-mix(in srgb, var(--ds-color-primary) 18%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)',
            }}
          >
            <Text size="sm" weight="bold" style={{ color: 'var(--ds-color-primary)' }}>
              RT
            </Text>
          </Box>
        }
      />
    </Box>
  );
}

function initialVisibleColumns() {
  return ['name', 'email', 'role', 'statusLabel', 'owner'];
}

export const STRUCTURE_PREVIEWS: Record<string, ReactNode> = {
  'collection-header': <CollectionHeaderPreview />,
  'dashboard-header': <DashboardHeaderPreview />,
  'detail-header': <DetailHeaderPreview />,
  'edit-header': <EditHeaderPreview />,
  'form-header': <FormHeaderPreview />,
  'active-filters-bar': <ActiveFiltersBarPreview />,
  'column-menu': <ColumnMenuPreview />,
  'export-button': <ExportButtonPreview />,
  'field-filters-panel': <FieldFiltersPanelPreview />,
  'saved-views-menu': <SavedViewsMenuPreview />,
  'scope-switcher': <ScopeSwitcherPreview />,
  'search-command-bar': <SearchCommandBarPreview />,
  'selection-preview-rail': <SelectionPreviewRailPreview />,
  'table-toolbar': <TableToolbarPreview />,
  'view-mode-switcher': <ViewModeSwitcherPreview />,
  record: <RecordFamilyPreview />,
  'form-sections': <FormSectionsPreview />,
  'edit-fields': <EditFieldsPreview />,
  'stats-header': <StatsHeaderPreview />,
  'data-terminal-card': <DataTerminalCardPreview />,
  'dashboard-insights': <DashboardInsightsFamilyPreview />,
  'loading-overlay': <LoadingOverlayPreview />,
};
