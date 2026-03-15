'use client';

/**
 * PmPaymentManager - Cards Preset
 * Compose PatternDataTable<PaymentManagerItem> with mobile card renderer
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmPaymentManagerProps, PaymentManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const CardsPmPaymentManager = createPreset<PmPaymentManagerProps>({
  name: 'PmPaymentManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmPaymentManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const paymentColumns = useMemo(() => columns<PaymentManagerItem>([
      column('amount', { header: 'Amount', render: (v, row) => `${row.currency} ${v}` }),
      column('status', { header: 'Status' }),
      column('method', { header: 'Method' }),
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
        title="Payment Manager"
        subtitle="Manage payments with filtering, status tracking, and batch operations"
        actions={onCreate ? <button onClick={onCreate}>+ New</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={paymentColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          mobileCard={(row) => (
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {row.currency} {row.amount}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: 4 }}>
                {row.customer ?? 'No customer'}
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
              title="No payments found"
              description="Get started by creating your first payment."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
