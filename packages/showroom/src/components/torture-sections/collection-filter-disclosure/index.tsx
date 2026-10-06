'use client';

import { Box, CollectionWorkspaceSurface, type ColumnDef } from '@rottay/design-system';

// WO-ARC-23 opened-state evidence: the collection workspace's tablet filter
// disclosure, which the anchored Popover renders in-tree under the tenant
// scope. Rendered only behind `?filterDisclosure=1` and kept out of every
// scene, so no existing capture changes; the spec opens it before capturing.

interface DisclosureRecord {
  id: string;
  name: string;
  status: string;
}

const ROWS: DisclosureRecord[] = [
  { id: 'fd-1', name: 'Alpha workspace', status: 'active' },
  { id: 'fd-2', name: 'Beta workspace', status: 'paused' },
  { id: 'fd-3', name: 'Gamma workspace', status: 'active' },
];

const COLUMNS: ColumnDef<DisclosureRecord>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
  { key: 'status', header: 'Status', accessorKey: 'status' },
];

const noop = () => {};

export function CollectionFilterDisclosureStates() {
  return (
    <Box data-testid="probe-collection-filter-disclosure">
      <CollectionWorkspaceSurface
        title="Filtered collection"
        subtitle="Tablet filter disclosure"
        header={{
          eyebrow: 'Workspace',
          title: 'Filtered collection',
          subtitle: 'Anchored filter disclosure',
        }}
        data={ROWS}
        columns={COLUMNS}
        rowKey="id"
        adaptive={{
          desktop: { filters: 'inline' },
          tablet: { filters: 'dropdown' },
          phone: { filters: 'sheet' },
        }}
        controls={{
          search: { enabled: true, value: '', placeholder: 'Search workspaces', onChange: noop },
          filters: [
            { key: 'query', label: 'Owner', type: 'text', placeholder: 'Search owner' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              placeholder: 'All statuses',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
              ],
            },
          ],
          onFilterChange: noop,
        }}
        presentation={{ bordered: true, enhancedInteractions: true }}
      />
    </Box>
  );
}
