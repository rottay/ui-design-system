'use client';

/**
 * PmPaymentManager - Table Preset
 * Compose PatternDataTable<PaymentManagerItem> with domain-specific columns
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

const STATUS_COLOR_MAP: Record<string, string> = {
  completed: 'success',
  paid: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'error',
  refunded: 'info',
  cancelled: 'error',
};

function getStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] ?? 'default';
}

export const TablePmPaymentManager = createPreset<PmPaymentManagerProps>({
  name: 'PmPaymentManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmPaymentManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate, searchQuery, onSearchChange } = props;

    const paymentColumns = useMemo(() => columns<PaymentManagerItem>([
      column('amount', {
        header: 'Amount',
        sortable: true,
        render: (value, row) => `${row.currency} ${value}`,
      }),
      column('status', {
        header: 'Status',
        sortable: true,
        render: (value) => {
          const color = getStatusColor(String(value));
          return (
            <span data-status-color={color}>
              {String(value)}
            </span>
          );
        },
      }),
      column('method', {
        header: 'Method',
        sortable: true,
        render: (value) => String(value ?? '').replace('_', ' '),
      }),
      column('customer', {
        header: 'Customer',
        sortable: true,
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
        title="Payment Manager"
        subtitle="Manage payments with filtering, status tracking, and batch operations"
        actions={onCreate ? (
          <button onClick={onCreate}>+ New</button>
        ) : undefined}
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
