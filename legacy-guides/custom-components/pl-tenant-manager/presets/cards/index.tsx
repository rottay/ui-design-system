'use client';

/**
 * PlTenantManager - Cards Preset
 * Compose PatternDataTable<Tenant> with card mobile view + PatternPageShell
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlTenantManagerProps, Tenant } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const CardsPlTenantManager = createPreset<PlTenantManagerProps>({
  name: 'PlTenantManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlTenantManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, tenants, onTenantClick, onCreate } = props;

    const tenantColumns = useMemo(() => columns<Tenant>([
      column('name', { header: 'Name', sortable: true }),
      column('slug', { header: 'Slug' }),
      column('status', { header: 'Status', sortable: true }),
      column('plan', { header: 'Plan', sortable: true }),
      column('ownerName', { header: 'Owner' }),
      column('usersCount', {
        header: 'Users',
        sortable: true,
        render: (value, row) => `${value}/${row.maxUsers}`,
      }),
      column('region', { header: 'Region' }),
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
        title="Tenant Manager"
        subtitle="Manage tenant organizations, plans, and usage across your platform"
        actions={onCreate ? <button onClick={onCreate}>+ New Tenant</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={tenants}
          columns={tenantColumns}
          rowKey="id"
          onRowClick={(row) => onTenantClick?.(row.id)}
          hoverable
          mobileCard={(tenant) => (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {tenant.logo ? (
                  <img src={tenant.logo} alt={tenant.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5' }}>
                    {tenant.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{tenant.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{tenant.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{tenant.status} - {tenant.plan}</span>
                <span>{tenant.usersCount}/{tenant.maxUsers} users</span>
              </div>
            </div>
          )}
          mobileBreakpoint={768}
          emptyState={
            <PatternEmptyState
              title="No tenants yet"
              description="Create your first tenant to start managing organizations."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
