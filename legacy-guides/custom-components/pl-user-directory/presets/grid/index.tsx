'use client';

/**
 * PlUserDirectory - Grid Preset
 * Compose PatternDataTable<UserDirectoryItem> with card mobile view
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

export const GridPlUserDirectory = createPreset<PlUserDirectoryProps>({
  name: 'PlUserDirectory.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserDirectoryProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, users, onUserClick, onInvite, emptyText } = props;

    const userColumns = useMemo(() => columns<UserDirectoryItem>([
      column('firstName', { header: 'Name', render: (v, row) => `${row.firstName} ${row.lastName}` }),
      column('email', { header: 'Email' }),
      column('role', { header: 'Role' }),
      column('status', { header: 'Status' }),
      column('department', { header: 'Department' }),
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
          mobileCard={(user) => (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5' }}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{user.role} - {user.status}</span>
                <span>{user.mfaEnabled ? 'MFA ✓' : 'MFA ✗'}</span>
              </div>
            </div>
          )}
          mobileBreakpoint={0}
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
