'use client';

import {
  Badge,
  Button,
  Checkbox,
  Dropdown,
  PatternDataTable,
  PatternFormBuilder,
  PatternStatsGrid,
  SelectionPreviewRail,
  Switch,
} from '@rottay/design-system';
import type {
  ColumnDef,
  DropdownMenuItem,
  FieldDef,
  SelectionPreviewRailColumn,
  StatDef,
} from '@rottay/design-system';
import type { FlagshipSpec } from './flagship-specs';

// ---------------------------------------------------------------------------
// Responsive-set variant + state specs
//
// Fills the chrome-free gallery gap for components with no entry in
// FLAGSHIP_SPECS: checkbox, switch, dropdown, stats-grid, data-table,
// form-builder. Kept OUT of FLAGSHIP_SPECS on purpose -- FLAGSHIP_SLUGS feeds
// the committed pixel-baseline and white-label torture gates, and this set
// must not perturb either. Same honesty rule as flagship-specs.tsx: real
// components across prop-driven states only (variants, sizes, disabled,
// error, empty). Pseudo-class states (hover, active, focus) are never faked
// here. Every cell is fluid (no fixed px width) because this gallery is
// captured at 360/768/1280.
// ---------------------------------------------------------------------------

type BadgeTone = 'success' | 'warning' | 'error';

function statusBadgeVariant(status: string): BadgeTone {
  if (status === 'Active') return 'success';
  if (status === 'Invited') return 'warning';
  return 'error';
}

const DROPDOWN_MENU_ITEMS: DropdownMenuItem[] = [
  { key: 'edit', label: 'Edit' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'divider-1', label: null, type: 'divider' },
  { key: 'delete', label: 'Delete', danger: true },
];

const STATS_SAMPLE: StatDef[] = [
  { key: 'events', label: 'Events', value: 18, change: 12.5, changeType: 'increase' },
  { key: 'tickets', label: 'Tickets', value: '12.4k', change: 8, changeType: 'increase' },
  { key: 'conversion', label: 'Conversion', value: '7.8%', change: -1.4, changeType: 'decrease' },
  { key: 'noShows', label: 'No-shows', value: '4.2%', change: -0.6, changeType: 'decrease' },
];

interface ResponsiveTeamRow {
  id: string;
  name: string;
  team: string;
  status: string;
}

const DATA_TABLE_ROWS: ResponsiveTeamRow[] = [
  { id: 'row-1', name: 'Ada Lovelace', team: 'Engineering', status: 'Active' },
  { id: 'row-2', name: 'Grace Hopper', team: 'Platform', status: 'Invited' },
  { id: 'row-3', name: 'Alan Turing', team: 'Research', status: 'Suspended' },
];

const DATA_TABLE_COLUMNS: ColumnDef<ResponsiveTeamRow>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
  { key: 'team', header: 'Team', accessorKey: 'team' },
  {
    key: 'status',
    header: 'Status',
    accessorKey: 'status',
    render: (value: unknown) => <Badge variant={statusBadgeVariant(String(value))}>{String(value)}</Badge>,
  },
];

// Same fields as DATA_TABLE_COLUMNS, shaped for the rail (title/dataIndex).
const RAIL_COLUMNS: SelectionPreviewRailColumn<ResponsiveTeamRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'team', title: 'Team', dataIndex: 'team' },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value: unknown) => <Badge variant={statusBadgeVariant(String(value))}>{String(value)}</Badge>,
  },
];

const FORM_BUILDER_FIELDS: FieldDef[] = [
  { name: 'workspaceName', label: 'Workspace name', type: 'text', required: true, placeholder: 'Northwind' },
  {
    name: 'plan',
    label: 'Plan',
    type: 'select',
    options: [
      { label: 'Starter', value: 'starter' },
      { label: 'Growth', value: 'growth' },
      { label: 'Enterprise', value: 'enterprise' },
    ],
  },
  { name: 'notifyOwners', label: 'Notify owners', type: 'switch' },
];

export const RESPONSIVE_SPECS: FlagshipSpec[] = [
  {
    slug: 'checkbox',
    name: 'Checkbox',
    groups: [
      {
        label: 'States',
        cells: [
          { label: 'Unchecked', node: <Checkbox label="Send weekly digest" /> },
          { label: 'Checked', node: <Checkbox defaultChecked label="Send weekly digest" /> },
          { label: 'Indeterminate', node: <Checkbox indeterminate label="Select all" /> },
          { label: 'Disabled', node: <Checkbox disabled label="Send weekly digest" /> },
          { label: 'Error', node: <Checkbox error label="Accept terms" /> },
        ],
      },
      {
        label: 'Sizes',
        cells: [
          { label: 'Small', node: <Checkbox size="sm" defaultChecked label="Small" /> },
          { label: 'Medium', node: <Checkbox size="md" defaultChecked label="Medium" /> },
          { label: 'Large', node: <Checkbox size="lg" defaultChecked label="Large" /> },
        ],
      },
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    groups: [
      {
        label: 'States',
        cells: [
          { label: 'Off', node: <Switch /> },
          { label: 'On', node: <Switch defaultChecked /> },
          { label: 'Disabled', node: <Switch disabled /> },
          { label: 'Disabled + on', node: <Switch disabled defaultChecked /> },
          { label: 'Loading', node: <Switch loading /> },
        ],
      },
      {
        label: 'Sizes',
        cells: [
          { label: 'Small', node: <Switch size="small" defaultChecked /> },
          { label: 'Default', node: <Switch size="default" defaultChecked /> },
          { label: 'Large', node: <Switch size="large" defaultChecked /> },
        ],
      },
    ],
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    groups: [
      {
        label: 'Trigger',
        cells: [
          {
            label: 'Default',
            node: (
              <Dropdown menu={{ items: DROPDOWN_MENU_ITEMS }}>
                <Button variant="default">Actions</Button>
              </Dropdown>
            ),
          },
          {
            label: 'Disabled',
            node: (
              <Dropdown menu={{ items: DROPDOWN_MENU_ITEMS }} disabled>
                <Button variant="default" disabled>
                  Actions
                </Button>
              </Dropdown>
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'stats-grid',
    name: 'Stats grid',
    groups: [
      {
        label: 'Layout',
        // Fluid: width fills the available cell instead of a fixed px track.
        cells: [
          {
            label: '2 columns',
            node: <PatternStatsGrid stats={STATS_SAMPLE} columns={2} style={{ width: '100%' }} />,
          },
          {
            label: '4 columns',
            node: <PatternStatsGrid stats={STATS_SAMPLE} columns={4} style={{ width: '100%' }} />,
          },
        ],
      },
    ],
  },
  {
    slug: 'data-table',
    name: 'Data table',
    groups: [
      {
        label: 'States',
        // Fluid: width fills the available cell instead of a fixed px track.
        cells: [
          {
            label: 'Populated',
            node: (
              <PatternDataTable
                data={DATA_TABLE_ROWS}
                columns={DATA_TABLE_COLUMNS}
                rowKey="id"
                pagination={false}
                style={{ width: '100%' }}
              />
            ),
          },
          {
            label: 'Empty',
            node: (
              <PatternDataTable
                data={[]}
                columns={DATA_TABLE_COLUMNS}
                rowKey="id"
                pagination={false}
                style={{ width: '100%' }}
              />
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'rail',
    name: 'Selection preview rail',
    groups: [
      {
        label: 'States',
        // The rail's own root already caps at min(100%, 380px); one real
        // cell is enough here.
        cells: [
          {
            label: 'Selected item',
            node: (
              <SelectionPreviewRail
                item={DATA_TABLE_ROWS[0]}
                itemKey={DATA_TABLE_ROWS[0].id}
                itemIndex={0}
                columns={RAIL_COLUMNS}
                onClose={() => undefined}
                mode="selection"
              />
            ),
          },
        ],
      },
    ],
  },
  {
    slug: 'form-builder',
    name: 'Form builder',
    groups: [
      {
        label: 'Layout',
        // Fluid: width fills the available cell instead of a fixed px track.
        cells: [
          {
            label: 'Vertical',
            node: (
              <PatternFormBuilder
                fields={FORM_BUILDER_FIELDS}
                layout="vertical"
                onSubmit={() => undefined}
                style={{ width: '100%' }}
              />
            ),
          },
          {
            label: 'Grid',
            node: (
              <PatternFormBuilder
                fields={FORM_BUILDER_FIELDS}
                layout="grid"
                columns={2}
                onSubmit={() => undefined}
                style={{ width: '100%' }}
              />
            ),
          },
        ],
      },
    ],
  },
];
