'use client';

import {
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
  type SelectionPreviewRailColumn,
} from '@rottay/design-system';

import {
  ActionUploadIcon,
  EntityGroupIcon,
  LocationGlobalIcon,
  TimeDateIcon,
  IdentityProvisioningIcon,
  SecurityProtectionIcon,
  OperationsSupportIcon,
  noop,
} from '../../foundation';

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

export {
  WORKSPACE_ROWS,
  WORKSPACE_COLUMNS,
  EXPORT_COLUMNS,
  ACTIVE_FILTERS,
  FIELD_FILTERS,
  FIELD_FILTER_PRESETS,
  FIELD_FILTER_VISUALS,
  VIEW_MODES,
  SCOPES,
  SAVED_VIEWS,
  SEARCH_COMMANDS,
  PREVIEW_RAIL_COLUMNS,
};
