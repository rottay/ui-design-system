'use client';

/**
 * PlRoleManager - Tree Preset
 * Tree view for hierarchical roles - uses PatternPageShell wrapper
 * Keeps custom tree rendering (no pattern for tree layout)
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { PlRoleManagerProps, Role } from '../../core';
import {
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';

function RoleTreeNode({
  role,
  onRoleClick,
  expandedIds,
  onToggleExpand,
  depth = 0,
}: {
  role: Role;
  onRoleClick?: (id: string) => void;
  expandedIds?: Set<string>;
  onToggleExpand?: (id: string) => void;
  depth?: number;
}) {
  const isExpanded = expandedIds?.has(role.id) ?? true;
  const hasChildren = role.children && role.children.length > 0;

  return (
    <div>
      <div
        onClick={() => onRoleClick?.(role.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          paddingLeft: 12 + depth * 24,
          cursor: 'pointer',
          borderBottom: '1px solid #f3f4f6',
          transition: 'background-color 0.15s',
        }}
      >
        {hasChildren && (
          <span
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(role.id); }}
            style={{ cursor: 'pointer', userSelect: 'none', width: 16 }}
          >
            {isExpanded ? '└' : '├'}
          </span>
        )}
        {!hasChildren && <span style={{ width: 16 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {role.displayName}
            {role.isSystem && <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: 8 }}>system</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>
            {role.permissionCount} permissions - {role.userCount} users
          </div>
        </div>
        <span style={{
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: '0.7rem',
          fontWeight: 600,
          backgroundColor: role.status === 'active' ? '#dcfce7' : role.status === 'deprecated' ? '#fef3c7' : '#f3f4f6',
          color: role.status === 'active' ? '#166534' : role.status === 'deprecated' ? '#92400e' : '#666',
        }}>
          {role.status}
        </span>
      </div>
      {hasChildren && isExpanded && role.children!.map((child) => (
        <RoleTreeNode
          key={child.id}
          role={child}
          onRoleClick={onRoleClick}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export const TreePlRoleManager = createPreset<PlRoleManagerProps>({
  name: 'PlRoleManager.Tree',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlRoleManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, roles, onRoleClick, onCreate, expandedIds, onToggleExpand, emptyText } = props;

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
        {roles.length === 0 ? (
          <PatternEmptyState
            title={emptyText ?? 'No roles found'}
            description="Create your first role to start managing permissions."
            engine={engine}
          />
        ) : (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {roles.map((role) => (
              <RoleTreeNode
                key={role.id}
                role={role}
                onRoleClick={onRoleClick}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        )}
      </PatternPageShell>
    );
  },
});
