'use client';

/**
 * PmRefundManager - Table Preset
 * Compose PatternDataTable<RefundManagerItem> with refund-specific columns and actions
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

export const TablePmRefundManager = createPreset<PmRefundManagerProps>({
  name: 'PmRefundManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmRefundManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const refundColumns = useMemo(() => columns<RefundManagerItem>([
      column('amount', {
        header: 'Amount',
        sortable: true,
        render: (value, row) => `${row.currency} ${value}`,
      }),
      column('status', {
        header: 'Status',
        sortable: true,
      }),
      column('reason', {
        header: 'Reason',
        sortable: true,
        render: (value) => String(value ?? '').replace('_', ' '),
      }),
      column('customer', {
        header: 'Customer',
        sortable: true,
      }),
      column('paymentId', {
        header: 'Payment ID',
      }),
      column('createdAt', {
        header: 'Date',
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
