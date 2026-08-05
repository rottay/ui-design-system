'use client';

import { Box, Stack, Text, PatternDataTable, type ColumnDef } from '@rottay/design-system';

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
  {
    id: 'dt-1',
    name: 'Ada Lovelace',
    role: 'Engineer',
    status: 'active',
    amount: 1200,
  },
  {
    id: 'dt-2',
    name: 'Grace Hopper',
    role: 'Admiral',
    status: 'active',
    amount: 980,
  },
  {
    id: 'dt-3',
    name: 'Alan Turing',
    role: 'Researcher',
    status: 'inactive',
    amount: 640,
  },
  {
    id: 'dt-4',
    name: 'Katherine Johnson',
    role: 'Mathematician',
    status: 'active',
    amount: 1500,
  },
];

const DATA_TABLE_COLUMNS: ColumnDef<DataTableFixtureRow>[] = [
  {
    key: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    pin: 'left',
    width: 160,
  },
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

export function DataTableStates() {
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
            {
              key: 'archive',
              label: 'Archive',
              variant: 'danger',
              onExecute: () => undefined,
            },
            {
              key: 'export',
              label: 'Export',
              variant: 'primary',
              onExecute: () => undefined,
            },
          ]}
          pagination={{
            current: 1,
            pageSize: 2,
            total: DATA_TABLE_ROWS.length,
            onChange: () => undefined,
          }}
        />
        <PatternDataTable<DataTableFixtureRow> data={[]} rowKey="id" columns={DATA_TABLE_COLUMNS} loading />
        <PatternDataTable<DataTableFixtureRow> data={[]} rowKey="id" columns={DATA_TABLE_COLUMNS} />
      </Stack>
    </Box>
  );
}
