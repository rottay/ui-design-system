'use client';

/**
 * PmPayoutManager - Table Preset
 * Compose PatternDataTable<PayoutManagerItem> with payout-specific columns
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmPayoutManagerProps, PayoutManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const TablePmPayoutManager = createPreset<PmPayoutManagerProps>({
  name: 'PmPayoutManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmPayoutManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const payoutColumns = useMemo(() => columns<PayoutManagerItem>([
      column('recipientName', {
        header: 'Recipient',
        sortable: true,
      }),
      column('amount', {
        header: 'Amount',
        sortable: true,
        render: (value, row) => `${row.currency} ${value}`,
      }),
      column('status', {
        header: 'Status',
        sortable: true,
      }),
      column('method', {
        header: 'Method',
        sortable: true,
        render: (value) => String(value ?? '').replace('_', ' '),
      }),
      column('createdAt', {
        header: 'Created',
        sortable: true,
      }),
      column('arrivedAt', {
        header: 'Arrived',
        render: (value) => String(value ?? '--'),
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
        title="Payout Manager"
        subtitle="Manage payouts to recipients with scheduling, batching, and status tracking"
        actions={onCreate ? <button onClick={onCreate}>+ New Payout</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={payoutColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No payouts found"
              description="Create your first payout to start sending funds."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
