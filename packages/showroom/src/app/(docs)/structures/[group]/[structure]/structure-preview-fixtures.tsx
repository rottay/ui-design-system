'use client';

import { forwardRef, useState, type ReactNode, type SVGProps } from 'react';
import {
  ActiveFiltersBar,
  ActionDock,
  ActivityCompact,
  AppShell,
  Badge,
  BottomTabBar,
  Box,
  Button,
  CollectionHeader,
  ColumnMenu,
  CommandRegistryProvider,
  ConnectedCommandPalette,
  DashboardHeader,
  DataTerminalCard,
  DetailHeader,
  EditHeader,
  ExportButton,
  FieldFiltersPanel,
  Flex,
  FormHeader,
  FormSections,
  HeaderSurface,
  InlineEditField,
  InlineEditGrid,
  InlineEditor,
  InlineEditorGroup,
  Input,
  LoadingOverlay,
  MetricsMinimal,
  MobileHeader,
  MoreFieldsToggle,
  PageShellSurface,
  RecordActionBar,
  RecordField,
  RecordFieldGrid,
  RecordPanel,
  RecordSummaryStrip,
  SavedViewsMenu,
  ScopeSwitcher,
  SearchCommandBar,
  SectionFrame,
  SelectionPreviewRail,
  Select,
  SidebarSurface,
  Stack,
  StatsHeader,
  SurfaceActionBar,
  SurfaceCapabilityAnatomy,
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
  SurfaceOfflineBanner,
  SurfaceSectionCard,
  SurfaceStaleBanner,
  SurfaceTabbedLabel,
  TableToolbar,
  Text,
  ViewModeSwitcher,
  buildViewModes,
  useRegisterCommands,
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
  WorkspaceShell,
} from '@rottay/design-system';
import {
  ActionRefreshIcon as ActionRefreshSemanticIcon,
  ActionUploadIcon as ActionUploadSemanticIcon,
  CommunicationMessageIcon as CommunicationMessageSemanticIcon,
  ContentDocumentIcon as ContentDocumentSemanticIcon,
  EntityGroupIcon as EntityGroupSemanticIcon,
  LocationGlobalIcon as LocationGlobalSemanticIcon,
  LocationPlaceIcon as LocationPlaceSemanticIcon,
  TimeDateIcon as TimeDateSemanticIcon,
  type SemanticIconComponent,
} from '@rottay/design-system/icons/foundation';
import {
  AccessAdminIcon as AccessAdminSemanticIcon,
  IdentityProvisioningIcon as IdentityProvisioningSemanticIcon,
  SecurityProtectionIcon as SecurityProtectionSemanticIcon,
} from '@rottay/design-system/icons/identity';
import {
  AnalyticsActivityIcon as AnalyticsActivitySemanticIcon,
  AnalyticsBarIcon as AnalyticsBarSemanticIcon,
} from '@rottay/design-system/icons/intelligence';
import {
  BillingCreditCardIcon as BillingCreditCardSemanticIcon,
  OperationsSupportIcon as OperationsSupportSemanticIcon,
} from '@rottay/design-system/icons/operations';

type FixtureIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: string | number;
  'data-testid'?: string;
};

function createDecorativeFixtureIcon(
  SemanticIcon: SemanticIconComponent,
  displayName: string,
) {
  const FixtureIcon = forwardRef<SVGSVGElement, FixtureIconProps>(
    function DecorativeFixtureIcon(
      {
        size = 20,
        className,
        style,
        id,
        'aria-describedby': ariaDescribedBy,
        'data-testid': testId,
      },
      ref,
    ) {
      return (
        <SemanticIcon
          ref={ref}
          decorative
          size={typeof size === 'number' ? size : 'md'}
          className={className}
          style={style}
          id={id}
          aria-describedby={ariaDescribedBy}
          data-testid={testId}
        />
      );
    },
  );

  FixtureIcon.displayName = displayName;
  return FixtureIcon;
}

const ActionRefreshIcon = createDecorativeFixtureIcon(
  ActionRefreshSemanticIcon,
  'ActionRefreshFixtureIcon',
);
const ActionUploadIcon = createDecorativeFixtureIcon(
  ActionUploadSemanticIcon,
  'ActionUploadFixtureIcon',
);
const CommunicationMessageIcon = createDecorativeFixtureIcon(
  CommunicationMessageSemanticIcon,
  'CommunicationMessageFixtureIcon',
);
const ContentDocumentIcon = createDecorativeFixtureIcon(
  ContentDocumentSemanticIcon,
  'ContentDocumentFixtureIcon',
);
const EntityGroupIcon = createDecorativeFixtureIcon(
  EntityGroupSemanticIcon,
  'EntityGroupFixtureIcon',
);
const LocationGlobalIcon = createDecorativeFixtureIcon(
  LocationGlobalSemanticIcon,
  'LocationGlobalFixtureIcon',
);
const LocationPlaceIcon = createDecorativeFixtureIcon(
  LocationPlaceSemanticIcon,
  'LocationPlaceFixtureIcon',
);
const TimeDateIcon = createDecorativeFixtureIcon(TimeDateSemanticIcon, 'TimeDateFixtureIcon');
const AccessAdminIcon = createDecorativeFixtureIcon(
  AccessAdminSemanticIcon,
  'AccessAdminFixtureIcon',
);
const IdentityProvisioningIcon = createDecorativeFixtureIcon(
  IdentityProvisioningSemanticIcon,
  'IdentityProvisioningFixtureIcon',
);
const SecurityProtectionIcon = createDecorativeFixtureIcon(
  SecurityProtectionSemanticIcon,
  'SecurityProtectionFixtureIcon',
);
const AnalyticsActivityIcon = createDecorativeFixtureIcon(
  AnalyticsActivitySemanticIcon,
  'AnalyticsActivityFixtureIcon',
);
const AnalyticsBarIcon = createDecorativeFixtureIcon(
  AnalyticsBarSemanticIcon,
  'AnalyticsBarFixtureIcon',
);
const BillingCreditCardIcon = createDecorativeFixtureIcon(
  BillingCreditCardSemanticIcon,
  'BillingCreditCardFixtureIcon',
);
const OperationsSupportIcon = createDecorativeFixtureIcon(
  OperationsSupportSemanticIcon,
  'OperationsSupportFixtureIcon',
);

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
    role: 'Operations Admin',
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
    icon: <SecurityProtectionIcon size={16} />,
    description: 'Separate active seats from paused or invitation-only access.',
  },
  region: {
    icon: <LocationGlobalIcon size={16} />,
    description: 'Focus operational follow-up by coverage region.',
  },
  joinedAt: {
    icon: <TimeDateIcon size={16} />,
    description: 'Audit recent onboarding waves and rollout windows.',
  },
  owner: {
    icon: <EntityGroupIcon size={16} />,
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
    icon: <IdentityProvisioningIcon size={14} />,
    shortcut: 'I',
    action: noop,
  },
  {
    id: 'export-risk-view',
    label: 'Export current view',
    description: 'Download the current workspace slice.',
    category: 'Workspace',
    icon: <ActionUploadIcon size={14} />,
    shortcut: 'E',
    action: noop,
  },
  {
    id: 'open-support-queue',
    label: 'Open support queue',
    description: 'Jump to escalations tied to this collection.',
    category: 'Operations',
    icon: <OperationsSupportIcon size={14} />,
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
    icon: <OperationsSupportIcon size={16} />,
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
    icon: <BillingCreditCardIcon size={16} />,
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
    icon: <LocationGlobalIcon size={16} />,
  },
];

const DASHBOARD_INSIGHT_METRICS = [
  {
    label: 'Seats at risk',
    value: '18',
    change: '-12%',
    positive: true,
    icon: EntityGroupIcon,
  },
  {
    label: 'Weekly invites',
    value: '41',
    change: '+8%',
    positive: true,
    icon: IdentityProvisioningIcon,
  },
  {
    label: 'Queue SLA',
    value: '94%',
    change: '+2%',
    positive: true,
    icon: SecurityProtectionIcon,
  },
  {
    label: 'Coverage gaps',
    value: '6',
    change: '+1',
    positive: false,
    icon: LocationPlaceIcon,
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
      eyebrow="Rottay workspace"
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
      title="Rottay health"
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
        {
          key: 'refresh',
          label: 'Refresh',
          icon: <ActionRefreshIcon size={14} />,
          onClick: noop,
        },
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
      icon={<AnalyticsBarIcon size={18} />}
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
          icon: CommunicationMessageIcon,
          onClick: noop,
          variant: 'secondary',
        },
        {
          label: 'Adjust access',
          icon: AccessAdminIcon,
          onClick: noop,
          variant: 'primary',
        },
      ]}
      tabs={[
        { id: 'overview', label: 'Overview', icon: EntityGroupIcon },
        { id: 'activity', label: 'Activity', count: 12, icon: AnalyticsActivityIcon },
        { id: 'billing', label: 'Billing', count: 2, icon: BillingCreditCardIcon },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      metadata={[
        { label: 'Owner', value: 'Sarah Johnson', icon: EntityGroupIcon },
        { label: 'Region', value: 'North America', icon: LocationGlobalIcon },
        { label: 'Trust tier', value: 'Tier 1', icon: SecurityProtectionIcon },
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
      icon={AccessAdminIcon}
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
      icon={IdentityProvisioningIcon}
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
            icon: <CommunicationMessageIcon size={14} />,
            onClick: noop,
          },
          {
            key: 'review',
            label: 'Review access',
            icon: <SecurityProtectionIcon size={14} />,
            onClick: noop,
            variant: 'primary',
          },
          {
            key: 'log',
            label: 'Open activity',
            icon: <ContentDocumentIcon size={14} />,
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

// The record group used to have a single composite preview keyed "record",
// standing in for five components at once. Each component is now catalogued on
// its own, so each renders on its own here: a preview that shows five things is
// evidence for none of them.

function RecordSummaryStripPreview() {
  return (
    <RecordSummaryStrip
      variant="metrics"
      items={[
        { label: 'Role', value: 'Operations Admin' },
        { label: 'Status', value: <Badge variant="success">Active</Badge> },
        { label: 'Owner', value: 'Sarah Johnson' },
        { label: 'Region', value: 'North America' },
      ]}
    />
  );
}

function RecordFieldPreview() {
  return (
    <Stack spacing={12}>
      <RecordField
        label="Member"
        value="Alice Johnson"
        helper="Primary reviewer for shared workspace coverage."
      />
      <RecordField label="Email" value="alice@rottay.com" href="/members/alice-johnson" />
      <RecordField label="Seat ID" value="seat_01HYN4K92" mono copyValue="seat_01HYN4K92" />
    </Stack>
  );
}

function RecordFieldGridPreview() {
  return (
    <RecordFieldGrid columns="repeat(auto-fit, minmax(220px, 1fr))">
      <RecordField label="Member" value="Alice Johnson" />
      <RecordField label="Email" value="alice@rottay.com" />
      <RecordField label="Seat ID" value="seat_01HYN4K92" mono copyValue="seat_01HYN4K92" />
      <RecordField label="Joined" value="2026-01-15" />
    </RecordFieldGrid>
  );
}

function RecordPanelPreview() {
  return (
    <RecordPanel>
      <Stack spacing={12}>
        <Text size="sm" weight="semibold">
          Core record facts
        </Text>
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          The panel contributes frame, padding and elevation, and deliberately no
          behavior of its own.
        </Text>
      </Stack>
    </RecordPanel>
  );
}

function RecordActionBarPreview() {
  return (
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
                  { value: 'operations-admin', label: 'Operations Admin' },
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
        icon={AnalyticsBarIcon}
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

function MobileHeaderPreview() {
  return (
    <Box
      style={{
        maxWidth: 420,
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
      }}
    >
      <MobileHeader
        title="Candidate review"
        onBack={noop}
        rightActions={<Button size="sm" variant="ghost">Share</Button>}
      />
    </Box>
  );
}

function ActionDockPreview() {
  return (
    <Box
      style={{
        maxWidth: 480,
        padding: 16,
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
        background: 'var(--ds-color-bg-secondary)',
      }}
    >
      <Text size="sm" style={{ display: 'block', marginBottom: 16 }}>
        Review changes before publishing this workspace.
      </Text>
      <ActionDock mode="sticky" style={{ position: 'relative' }}>
        <Button variant="secondary" style={{ flex: 1 }}>Save draft</Button>
        <Button variant="primary" style={{ flex: 1 }}>Publish</Button>
      </ActionDock>
    </Box>
  );
}

function BottomTabBarPreview() {
  const [activeKey, setActiveKey] = useState('workspace');

  return (
    <Box
      style={{
        maxWidth: 420,
        paddingTop: 48,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border-secondary)',
        background: 'var(--ds-color-bg-secondary)',
      }}
    >
      <BottomTabBar
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          { key: 'workspace', label: 'Workspace', icon: <EntityGroupIcon size={20} /> },
          {
            key: 'activity',
            label: 'Activity',
            icon: <AnalyticsActivityIcon size={20} />,
            badge: 3,
          },
          { key: 'coverage', label: 'Coverage', icon: <LocationGlobalIcon size={20} /> },
        ]}
        style={{ position: 'relative' }}
      />
    </Box>
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

// ---------------------------------------------------------------------------
// Header surfaces and page chrome
// ---------------------------------------------------------------------------

const HEADER_SURFACE_TABS = [
  {
    key: 'members',
    label: 'Members',
    badge: <Badge>12</Badge>,
    content: <Text>12 active members across 3 roles.</Text>,
  },
  { key: 'roles', label: 'Roles', content: <Text>3 roles: Admin, Editor, Viewer.</Text> },
  {
    key: 'defaults',
    label: 'Defaults',
    content: <Text>Default role for new invitations: Viewer.</Text>,
  },
];

function HeaderSurfacePreview() {
  return (
    <HeaderSurface
      config={{
        visual: { tabsType: 'line' },
        presentation: {
          chrome: {
            title: 'Team settings',
            subtitle: 'Manage members, roles and defaults for this workspace.',
            breadcrumbs: [{ label: 'Workspace', onClick: noop }, { label: 'Team settings' }],
            badge: <Badge>12 members</Badge>,
            back: { label: 'Workspace', onClick: noop },
          },
          description: 'Changes apply to every member of this workspace.',
          metadata: (
            <Text size="xs" color="muted">
              Last updated 2026-07-11
            </Text>
          ),
        },
        behavior: {
          tabs: HEADER_SURFACE_TABS,
          activeTab: 'members',
          onTabChange: noop,
          actions: [
            { id: 'invite', label: 'Invite member', variant: 'primary', onClick: noop },
            { id: 'export', label: 'Export roster', onClick: noop },
          ],
        },
      }}
    />
  );
}

function SectionFramePreview() {
  return (
    <Stack spacing={16}>
      <SectionFrame index={1} title="Framing" meta="Numbered boundary">
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          The mono [01] marker and the rule carry the section boundary; the
          heading level stays a prop so the document outline remains correct.
        </Text>
      </SectionFrame>
      <SectionFrame index={2} title="Sequence" meta="Second section">
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          Indices are authored, not derived, so a section keeps its number when
          the page is reordered.
        </Text>
      </SectionFrame>
    </Stack>
  );
}

function PageShellSurfacePreview() {
  return (
    <PageShellSurface
      chrome={{
        title: 'Quarterly launch plan',
        subtitle: 'Tracks milestones and sign-offs for this quarter.',
        metadata: (
          <Text size="xs" color="muted">
            Updated 2026-07-14 - 7 of 10 milestones complete
          </Text>
        ),
        breadcrumbs: [{ label: 'Records', onClick: noop }, { label: 'Quarterly launch plan' }],
        badge: <Badge tone="success">Active</Badge>,
        back: { label: 'Records', onClick: noop },
      }}
      actions={
        <Flex gap={8}>
          <Button variant="secondary" onClick={noop}>
            Export
          </Button>
          <Button variant="primary" onClick={noop}>
            Edit plan
          </Button>
        </Flex>
      }
    >
      <Stack spacing={12}>
        <Text>Owner: Alex Rivera. Last reviewed 2026-07-12.</Text>
        <Stack spacing={6}>
          {[
            { key: 'm1', label: 'Launch readiness review', status: 'Complete' },
            { key: 'm2', label: 'Budget sign-off', status: 'In progress' },
            { key: 'm3', label: 'Vendor onboarding', status: 'Not started' },
          ].map((milestone) => (
            <Flex key={milestone.key} justify="between">
              <Text weight="medium">{milestone.label}</Text>
              <Text size="sm" color="muted">
                {milestone.status}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </PageShellSurface>
  );
}

// ---------------------------------------------------------------------------
// Shell layouts
// ---------------------------------------------------------------------------

const SHELL_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', active: true },
  { key: 'analytics', label: 'Analytics' },
  { key: 'files', label: 'Files' },
];

function ShellNavList({ items }: { items: { key: string; label: string; active?: boolean }[] }) {
  return (
    <Stack spacing={4}>
      {items.map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={item.active ? 'primary' : 'ghost'}
          fullWidth
          aria-current={item.active ? 'page' : undefined}
          onClick={noop}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );
}

function AppShellPreview() {
  return (
    <Box
      style={{
        height: 320,
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
      }}
    >
      <AppShell
        geometry={{ sidebarWidth: 200, sidebarCollapsedWidth: 72, headerHeight: 56, sidebarHeaderHeight: 64 }}
        sidebar={{
          logo: (
            <Text size="sm" weight="semibold">
              Acme
            </Text>
          ),
          nav: <ShellNavList items={SHELL_NAV_ITEMS} />,
          footer: (
            <Text size="xs" color="muted">
              v2.4.0
            </Text>
          ),
        }}
        header={{
          left: <Text weight="semibold">Dashboard</Text>,
          right: (
            <Button size="sm" variant="secondary" onClick={noop}>
              New
            </Button>
          ),
        }}
      >
        <Stack spacing={8}>
          <Text weight="semibold">Page content</Text>
          <Text size="sm" color="muted">
            The shell owns sidebar collapse, header height and the compact
            posture; the page owns everything inside this region.
          </Text>
        </Stack>
      </AppShell>
    </Box>
  );
}

function SidebarSurfacePreview() {
  return (
    <SidebarSurface
      config={{
        visual: { collapsible: true, bordered: true, sidebarWidth: 216, asideWidth: 200 },
        presentation: {
          header: <Text weight="semibold">Acme Workspace</Text>,
          sidebar: (
            <Stack spacing={16}>
              <Stack spacing={6}>
                <Text size="xs" color="muted">
                  Workspace
                </Text>
                <ShellNavList items={SHELL_NAV_ITEMS} />
              </Stack>
              <Stack spacing={6}>
                <Text size="xs" color="muted">
                  Account
                </Text>
                <ShellNavList
                  items={[
                    { key: 'settings', label: 'Settings' },
                    { key: 'profile', label: 'Profile' },
                  ]}
                />
              </Stack>
            </Stack>
          ),
          content: (
            <Stack spacing={8}>
              <Text weight="semibold">Dashboard</Text>
              <Text size="sm" color="muted">
                Overview of workspace activity for the current week.
              </Text>
            </Stack>
          ),
          footer: (
            <Text size="xs" color="muted">
              v2.4.0
            </Text>
          ),
          aside: (
            <Stack spacing={8}>
              <Text size="sm" weight="medium">
                Recent activity
              </Text>
              <Text size="xs" color="muted">
                Priya Shah updated the Q3 roadmap.
              </Text>
            </Stack>
          ),
        },
        behavior: { toggleLabel: 'Collapse navigation', onCollapsedChange: noop },
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Connected command palette
//
// The palette is registry-backed: it renders nothing at rest and populates
// itself from CommandRegistryProvider. The preview therefore mounts the real
// provider, registers real commands, and opens it by dispatching the same
// mod+K chord the component listens for -- so a regression in that listener
// shows up here as a button that stops working.
// ---------------------------------------------------------------------------

function isMacPlatform() {
  return typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function CommandPaletteCommands() {
  useRegisterCommands([
    { id: 'preview-dashboard', label: 'Open dashboard', category: 'Navigation', action: noop },
    { id: 'preview-approvals', label: 'Review approvals', category: 'Actions', action: noop },
    { id: 'preview-invite', label: 'Invite member', category: 'Actions', shortcut: 'i', action: noop },
  ]);
  return null;
}

function ConnectedCommandPalettePreview() {
  return (
    <CommandRegistryProvider>
      <CommandPaletteCommands />
      <Stack spacing={12}>
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          Press Cmd/Ctrl+K to open the palette, or ? for the cheatsheet built
          from every registered command.
        </Text>
        <Flex gap={8}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const mac = isMacPlatform();
              document.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: mac,
                  ctrlKey: !mac,
                  bubbles: true,
                }),
              );
            }}
          >
            Open palette
          </Button>
        </Flex>
        <ConnectedCommandPalette placeholder="Type a command or search..." />
      </Stack>
    </CommandRegistryProvider>
  );
}

/**
 * One row of the lifecycle preview. The family's whole point is that a surface
 * shows exactly one of these at a time, so the preview labels each moment
 * instead of stacking them anonymously.
 */
function LifecycleMoment({ moment, children }: { moment: string; children: ReactNode }) {
  return (
    <Stack spacing={8}>
      <Text size="xs" color="muted">
        {moment}
      </Text>
      {children}
    </Stack>
  );
}

function SurfaceLifecyclePreview() {
  return (
    <Stack spacing={24}>
      <LifecycleMoment moment="loading — replaces content">
        <SurfaceLoadingSkeleton rows={3} showHeader />
      </LifecycleMoment>
      <LifecycleMoment moment="empty — replaces content">
        <SurfaceEmptyState
          title="No saved views yet"
          description="Save a filter combination to reuse it across sessions."
          action={{ id: 'create-view', label: 'Create view', variant: 'primary', onClick: noop }}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="error — replaces content">
        <SurfaceErrorState
          error={new Error('Request timed out after 30s')}
          title="Could not load workspace"
          onRetry={noop}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="stale — accompanies content">
        <SurfaceStaleBanner
          message="Showing data cached 12 minutes ago."
          onRefresh={noop}
        />
      </LifecycleMoment>
      <LifecycleMoment moment="offline — accompanies content">
        <SurfaceOfflineBanner
          message="You are offline. New records will not appear."
          showCachedNotice
        />
      </LifecycleMoment>
    </Stack>
  );
}

function SurfaceCapabilityAnatomyPreview() {
  return (
    <SurfaceCapabilityAnatomy
      capabilities={[
        { kind: 'route', id: 'workspace.overview', label: 'Overview route' },
        { kind: 'tab', id: 'members', label: 'Members tab' },
        { kind: 'column', id: 'last-seen', label: 'Last seen column' },
        { kind: 'field', id: 'billing-email', label: 'Billing email field' },
        { kind: 'action', id: 'export', label: 'Export', disabled: true },
      ]}
    />
  );
}

function SurfaceChromePreview() {
  return (
    <Stack spacing={16}>
      <SurfaceSectionCard
        eyebrow="Workspace"
        title="Retention policy"
        description="Applies to every collection in this workspace."
        actions={
          <SurfaceActionBar
            access={{ mode: 'all' }}
            actions={[
              { id: 'discard', label: 'Discard', variant: 'ghost', onClick: noop },
              { id: 'save', label: 'Save policy', variant: 'primary', onClick: noop },
            ]}
          />
        }
      >
        <Stack spacing={8}>
          <Text size="sm" color="muted">
            Records are archived after 90 days and purged after 365.
          </Text>
          <Flex gap={10} align="center">
            <Text size="sm">
              <SurfaceTabbedLabel view={{ label: 'Archived', badge: 128 }} />
            </Text>
            <Text size="sm">
              <SurfaceTabbedLabel view={{ label: 'Purged' }} />
            </Text>
          </Flex>
        </Stack>
      </SurfaceSectionCard>
    </Stack>
  );
}

// --- workspace-shell -------------------------------------------------------

const SHELL_ROWS = [
  { key: 'row-1', name: 'Spring launch', owner: 'A. Moreau' },
  { key: 'row-2', name: 'Partner rollout', owner: 'D. Okonkwo' },
  { key: 'row-3', name: 'Quarterly review', owner: 'L. Vidal' },
];

function WorkspaceShellPreview() {
  return (
    <Box style={{ width: '100%' }}>
      <WorkspaceShell
        variant="ai-field"
        mood="focus"
        fieldPattern="hybrid"
        intensity="medium"
        continuity="seamless"
        focusReaction
        previewEmphasis
        focusActive
        previewActive
      >
        <Stack spacing="none">
          <Flex justify="between" align="center" gap={12} style={{ padding: 16 }}>
            <Text weight="semibold">Active workstreams</Text>
            <Flex gap={8}>
              <Button size="sm" variant="secondary" onClick={() => undefined}>
                Filter
              </Button>
              <Button size="sm" variant="primary" onClick={() => undefined}>
                New workstream
              </Button>
            </Flex>
          </Flex>
          <Flex gap={8} wrap="wrap" style={{ padding: '0 16px 12px' }}>
            <Badge>Status: Active</Badge>
            <Badge>Region: EU</Badge>
          </Flex>
          {/* The shell owns no breakpoint behavior, so the consumer wraps its own
              rail; a fixed column would overlap the rows at narrow widths. */}
          <Flex gap={16} align="start" wrap="wrap" style={{ padding: '0 16px 16px' }}>
            <Stack spacing="sm" style={{ flex: '1 1 260px', minWidth: 0 }}>
              {SHELL_ROWS.map((row) => (
                <Flex key={row.key} justify="between" gap={8}>
                  <Text size="sm">{row.name}</Text>
                  <Text size="sm" color="muted">
                    {row.owner}
                  </Text>
                </Flex>
              ))}
            </Stack>
            <Stack spacing="sm" style={{ flex: '1 1 220px', minWidth: 0 }}>
              <Text size="xs" color="muted">
                Preview
              </Text>
              <Stack spacing="xs">
                <Text size="sm" weight="medium">
                  {SHELL_ROWS[0]?.name}
                </Text>
                <Text size="xs" color="muted">
                  Owned by {SHELL_ROWS[0]?.owner}
                </Text>
              </Stack>
              <Button size="sm" variant="ghost" onClick={() => undefined}>
                View report
              </Button>
            </Stack>
          </Flex>
        </Stack>
      </WorkspaceShell>
    </Box>
  );
}

export const STRUCTURE_PREVIEWS: Record<string, ReactNode> = {
  'mobile-header': <MobileHeaderPreview />,
  'collection-header': <CollectionHeaderPreview />,
  'dashboard-header': <DashboardHeaderPreview />,
  'detail-header': <DetailHeaderPreview />,
  'edit-header': <EditHeaderPreview />,
  'form-header': <FormHeaderPreview />,
  'header-surface': <HeaderSurfacePreview />,
  'section-frame': <SectionFramePreview />,
  'active-filters-bar': <ActiveFiltersBarPreview />,
  'action-dock': <ActionDockPreview />,
  'column-menu': <ColumnMenuPreview />,
  'connected-command-palette': <ConnectedCommandPalettePreview />,
  'export-button': <ExportButtonPreview />,
  'field-filters-panel': <FieldFiltersPanelPreview />,
  'saved-views-menu': <SavedViewsMenuPreview />,
  'scope-switcher': <ScopeSwitcherPreview />,
  'search-command-bar': <SearchCommandBarPreview />,
  'selection-preview-rail': <SelectionPreviewRailPreview />,
  'table-toolbar': <TableToolbarPreview />,
  'view-mode-switcher': <ViewModeSwitcherPreview />,
  'record-summary-strip': <RecordSummaryStripPreview />,
  'record-field': <RecordFieldPreview />,
  'record-field-grid': <RecordFieldGridPreview />,
  'record-panel': <RecordPanelPreview />,
  'record-action-bar': <RecordActionBarPreview />,
  'form-sections': <FormSectionsPreview />,
  'edit-fields': <EditFieldsPreview />,
  'stats-header': <StatsHeaderPreview />,
  'data-terminal-card': <DataTerminalCardPreview />,
  'dashboard-insights': <DashboardInsightsFamilyPreview />,
  'capability-anatomy': <SurfaceCapabilityAnatomyPreview />,
  'loading-overlay': <LoadingOverlayPreview />,
  'surface-lifecycle': <SurfaceLifecyclePreview />,
  'app-shell': <AppShellPreview />,
  'bottom-tab-bar': <BottomTabBarPreview />,
  'page-shell-surface': <PageShellSurfacePreview />,
  'sidebar-surface': <SidebarSurfacePreview />,
  'surface-chrome': <SurfaceChromePreview />,
  'workspace-shell': <WorkspaceShellPreview />,
};
