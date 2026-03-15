'use client';

/**
 * PlUserDirectory - Table Preset
 * Compose PatternDataTable<UserDirectoryItem> with role badges and MFA indicators
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlUserDirectoryProps, UserDirectoryItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const TablePlUserDirectory = createPreset<PlUserDirectoryProps>({
  name: 'PlUserDirectory.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserDirectoryProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, users, onUserClick, onInvite, emptyText } = props;

    const userColumns = useMemo(() => columns<UserDirectoryItem>([
      column('firstName', {
        header: 'Name',
        sortable: true,
        render: (value, row) => `${row.firstName} ${row.lastName}`,
      }),
      column('email', { header: 'Email', sortable: true }),
      column('role', {
        header: 'Role',
        sortable: true,
        render: (value) => (
          <span style={{
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: value === 'admin' ? '#fef3c7' : value === 'manager' ? '#e0e7ff' : '#f3f4f6',
            color: value === 'admin' ? '#92400e' : value === 'manager' ? '#4338ca' : '#374151',
          }}>
            {String(value)}
          </span>
        ),
      }),
      column('status', { header: 'Status', sortable: true }),
      column('department', { header: 'Department' }),
      column('mfaEnabled', {
        header: 'MFA',
        render: (value) => value ? '✓' : '✗',
        align: 'center',
      }),
      column('loginCount', { header: 'Logins', sortable: true }),
    ]), []);

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="User Directory"
        subtitle="Browse and manage organizational user directory with role-based badges"
        actions={onInvite ? <button onClick={onInvite}>+ Invite User</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={users}
          columns={userColumns}
          rowKey="id"
          onRowClick={(row) => onUserClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title={emptyText ?? 'No users found'}
              description="Invite users to get started."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
