/**
 * A collection the application adapts without touching the design system: on
 * a phone it keeps three columns and presents cards. The DS decides WHEN a
 * request is a phone; the app decides only WHAT stays.
 */
'use client';

import { PatternDataTable, type ColumnDef } from '@rottay/design-system';

export interface OpenRole {
  id: string;
  title: string;
  stage: string;
  owner: string;
  openedAt: string;
  location: string;
}

const columns: ColumnDef<OpenRole>[] = [
  { key: 'title', header: 'Role', accessorKey: 'title' },
  { key: 'stage', header: 'Stage', accessorKey: 'stage' },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
  { key: 'openedAt', header: 'Opened', accessorKey: 'openedAt' },
  { key: 'location', header: 'Location', accessorKey: 'location' },
];

export default function RolesTable({ roles }: { roles: OpenRole[] }) {
  return (
    <PatternDataTable<OpenRole>
      data={roles}
      rowKey="id"
      columns={columns}
      adapt={{
        phone: { columns: { keep: ['title', 'stage', 'owner'] }, presentation: 'cards' },
      }}
    />
  );
}
