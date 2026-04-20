'use client';

import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Badge,
  Button,
  DesignSystemProvider,
  PatternDataTable,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import {
  EditIcon,
  Trash2Icon,
} from '@rottay/design-system/icons';

import type { ColumnDef, SortConfig } from '@rottay/design-system';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Daniel Avila', email: 'daniel@rottay.com', role: 'Super Admin', status: 'active', lastLogin: '2026-04-19 09:15' },
  { id: '2', name: 'Sofia Martinez', email: 'sofia@acme.com', role: 'Admin', status: 'active', lastLogin: '2026-04-19 08:42' },
  { id: '3', name: 'James Chen', email: 'james@techcorp.io', role: 'Editor', status: 'active', lastLogin: '2026-04-18 17:30' },
  { id: '4', name: 'Maria Garcia', email: 'maria@startup.co', role: 'Viewer', status: 'inactive', lastLogin: '2026-04-10 11:00' },
  { id: '5', name: 'Alex Johnson', email: 'alex@enterprise.com', role: 'Admin', status: 'active', lastLogin: '2026-04-19 07:55' },
  { id: '6', name: 'Emily Davis', email: 'emily@growth.io', role: 'Editor', status: 'suspended', lastLogin: '2026-03-28 14:20' },
  { id: '7', name: 'Ryan Park', email: 'ryan@fintech.co', role: 'Viewer', status: 'active', lastLogin: '2026-04-18 22:10' },
  { id: '8', name: 'Nina Patel', email: 'nina@healthco.com', role: 'Admin', status: 'active', lastLogin: '2026-04-19 06:30' },
  { id: '9', name: 'Carlos Ruiz', email: 'carlos@media.io', role: 'Editor', status: 'inactive', lastLogin: '2026-04-05 09:45' },
  { id: '10', name: 'Lisa Wong', email: 'lisa@retail.com', role: 'Viewer', status: 'active', lastLogin: '2026-04-17 15:20' },
];

const STATUS_VARIANT: Record<User['status'], string> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'error',
};

function UserListContent() {
  const tokens = useTokens();
  const [sorting, setSorting] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const columns: ColumnDef<User>[] = [
    {
      key: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      width: 180,
    },
    {
      key: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      width: 220,
    },
    {
      key: 'role',
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      width: 120,
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      width: 120,
      render: (_value: unknown, row: User) => (
        <Badge variant={STATUS_VARIANT[row.status] as any}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessorKey: 'lastLogin',
      sortable: true,
      width: 160,
    },
  ];

  return (
    <Stack spacing="lg">
      <Box>
        <Text as={"h2" as any} size="xl" weight="bold">
          User Management
        </Text>
        <Box style={{ marginTop: tokens.spacing[1] }}>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Manage platform users, roles, and access
          </Text>
        </Box>
      </Box>

      <PatternDataTable<User>
        data={MOCK_USERS}
        columns={columns}
        rowKey="id"
        selectable
        sorting={sorting}
        onSortChange={setSorting}
        hoverable
        striped
        actions={(row) => (
          <Flex gap={4}>
            <Button variant="ghost" size="sm">
              <EditIcon size={14} />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2Icon size={14} />
            </Button>
          </Flex>
        )}
        toolbar={
          <Flex align="center" justify="between" style={{ width: '100%' }}>
            <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
              Showing 10 users
            </Text>
            <Button variant="primary" size="sm">
              Add User
            </Button>
          </Flex>
        }
      />
    </Stack>
  );
}

export default function PlatformUserListDemo() {
  return (
    <DesignSystemProvider tenantSlug="rottay" forceEngine="classic">
      <UserListContent />
    </DesignSystemProvider>
  );
}
