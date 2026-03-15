'use client';

/**
 * PmRefundManager - Cards Preset
 * Compose PatternDataTable<RefundManagerItem> with card-based mobile view
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmRefundManagerProps, RefundManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const CardsPmRefundManager = createPreset<PmRefundManagerProps>({
  name: 'PmRefundManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmRefundManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const refundColumns = useMemo(() => columns<RefundManagerItem>([
      column('amount', { header: 'Amount', render: (v, row) => `${row.currency} ${v}` }),
      column('status', { header: 'Status' }),
      column('reason', { header: 'Reason', render: (v) => String(v ?? '').replace('_', ' ') }),
      column('customer', { header: 'Customer' }),
      column('createdAt', { header: 'Date' }),
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
        title="Refund Manager"
        subtitle="Process and track refunds with reason codes, approval workflows, and status"
        actions={onCreate ? <button onClick={onCreate}>+ New Refund</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={refundColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          mobileCard={(row) => (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.currency} {row.amount}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: 4 }}>{row.reason.replace('_', ' ')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>{row.status}</span>
                <span>{row.createdAt}</span>
              </div>
            </div>
          )}
          mobileBreakpoint={768}
          emptyState={
            <PatternEmptyState
              title="No refunds found"
              description="Refund records will appear here when processed."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
