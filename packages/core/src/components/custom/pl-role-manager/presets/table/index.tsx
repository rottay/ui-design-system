'use client';

/**
 * PlRoleManager - Table Preset
 * Compose PatternDataTable<Role> + PatternFormBuilder
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlRoleManagerProps, Role } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
  actionsColumn,
} from '../../../../patterns';

export const TablePlRoleManager = createPreset<PlRoleManagerProps>({
  name: 'PlRoleManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlRoleManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, roles, onRoleClick, onCreate, onDelete, onDuplicate, emptyText } = props;

    const roleColumns = useMemo(() => columns<Role>([
      column('displayName', { header: 'Name', sortable: true }),
      column('name', { header: 'Key' }),
      column('type', { header: 'Type', sortable: true }),
      column('status', { header: 'Status', sortable: true }),
      column('permissionCount', { header: 'Permissions', sortable: true }),
      column('userCount', { header: 'Users', sortable: true }),
      column('level', { header: 'Level' }),
      actionsColumn<Role>((row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {onDuplicate && !row.isSystem && (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(row.id); }}
              style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
            >
              Dup
            </button>
          )}
          {onDelete && !row.isSystem && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
              style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
            >
              Del
            </button>
          )}
        </div>
      )),
    ]), [onDuplicate, onDelete]);

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="Role Manager"
        subtitle="Hierarchical role management with inheritance, permissions, and user assignment"
        actions={onCreate ? <button onClick={() => onCreate()}>+ New Role</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={roles}
          columns={roleColumns}
          rowKey="id"
          onRowClick={(row) => onRoleClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title={emptyText ?? 'No roles found'}
              description="Create your first role to start managing permissions."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
