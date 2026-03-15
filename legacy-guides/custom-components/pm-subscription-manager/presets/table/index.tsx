'use client';

/**
 * PmSubscriptionManager - Table Preset
 * Compose PatternDataTable<SubscriptionManagerItem> with subscription columns
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

export const TablePmSubscriptionManager = createPreset<PmSubscriptionManagerProps>({
  name: 'PmSubscriptionManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmSubscriptionManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const subscriptionColumns = useMemo(() => columns<SubscriptionManagerItem>([
      column('planName', {
        header: 'Plan',
        sortable: true,
      }),
      column('status', {
        header: 'Status',
        sortable: true,
      }),
      column('amount', {
        header: 'Amount',
        sortable: true,
        render: (value, row) => `${row.currency} ${value}/${row.interval}`,
      }),
      column('customer', {
        header: 'Customer',
        sortable: true,
      }),
      column('currentPeriodEnd', {
        header: 'Renews',
        sortable: true,
      }),
      column('createdAt', {
        header: 'Created',
        sortable: true,
      }),
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
