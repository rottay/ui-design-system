'use client';

/**
 * PmPayoutManager - Cards Preset
 * Compose PatternDataTable<PayoutManagerItem> with card mobile view
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

export const CardsPmPayoutManager = createPreset<PmPayoutManagerProps>({
  name: 'PmPayoutManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmPayoutManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const payoutColumns = useMemo(() => columns<PayoutManagerItem>([
      column('recipientName', { header: 'Recipient' }),
      column('amount', { header: 'Amount', render: (v, row) => `${row.currency} ${v}` }),
      column('status', { header: 'Status' }),
      column('method', { header: 'Method', render: (v) => String(v ?? '').replace('_', ' ') }),
      column('createdAt', { header: 'Created' }),
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
          mobileCard={(row) => (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.recipientName}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: 4 }}>
                {row.currency} {row.amount} via {row.method.replace('_', ' ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{row.status}</span>
                <span>{row.createdAt}</span>
              </div>
            </div>
          )}
          mobileBreakpoint={768}
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
