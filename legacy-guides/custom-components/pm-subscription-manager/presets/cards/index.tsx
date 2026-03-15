'use client';

/**
 * PmSubscriptionManager - Cards Preset
 * Compose PatternDataTable<SubscriptionManagerItem> with card mobile view
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmSubscriptionManagerProps, SubscriptionManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const CardsPmSubscriptionManager = createPreset<PmSubscriptionManagerProps>({
  name: 'PmSubscriptionManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmSubscriptionManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const subscriptionColumns = useMemo(() => columns<SubscriptionManagerItem>([
      column('planName', { header: 'Plan' }),
      column('status', { header: 'Status' }),
      column('amount', { header: 'Amount', render: (v, row) => `${row.currency} ${v}/${row.interval}` }),
      column('customer', { header: 'Customer' }),
      column('currentPeriodEnd', { header: 'Renews' }),
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
        title="Subscription Manager"
        subtitle="Manage subscriptions with plan info, billing cycles, and renewal status"
        actions={onCreate ? <button onClick={onCreate}>+ New Subscription</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={subscriptionColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          mobileCard={(row) => (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.planName}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: 4 }}>
                {row.currency} {row.amount}/{row.interval}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{row.status}</span>
                <span>Renews: {row.currentPeriodEnd}</span>
              </div>
            </div>
          )}
          mobileBreakpoint={768}
          emptyState={
            <PatternEmptyState
              title="No subscriptions found"
              description="Create your first subscription to start tracking billing."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
