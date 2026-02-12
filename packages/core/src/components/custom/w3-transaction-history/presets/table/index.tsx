'use client';

/**
 * W3TransactionHistory - Table Preset
 * Compose PatternDataTable<TransactionHistoryItem>
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { W3TransactionHistoryProps, TransactionHistoryItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
  actionsColumn,
} from '../../../../patterns';

export const TableW3TransactionHistory = createPreset<W3TransactionHistoryProps>({
  name: 'W3TransactionHistory.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3TransactionHistoryProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onViewExplorer } = props;

    const txColumns = useMemo(() => columns<TransactionHistoryItem>([
      column('type', { header: 'Type', sortable: true }),
      column('hash', {
        header: 'Hash',
        render: (value) => {
          const h = String(value);
          return `${h.slice(0, 8)}...${h.slice(-6)}`;
        },
      }),
      column('status', {
        header: 'Status',
        sortable: true,
      }),
      column('value', { header: 'Value', sortable: true }),
      column('from', {
        header: 'From',
        render: (value) => {
          const a = String(value);
          return `${a.slice(0, 6)}...${a.slice(-4)}`;
        },
      }),
      column('to', {
        header: 'To',
        render: (value) => {
          const a = String(value);
          return `${a.slice(0, 6)}...${a.slice(-4)}`;
        },
      }),
      column('network', { header: 'Network' }),
      column('timestamp', { header: 'Time', sortable: true }),
      ...(onViewExplorer ? [actionsColumn<TransactionHistoryItem>(
        (row) => (
          <button
            onClick={(e) => { e.stopPropagation(); onViewExplorer(row.hash); }}
            style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
          >
            Explorer
          </button>
        ),
      )] : []),
    ]), [onViewExplorer]);

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="Transaction History"
        subtitle="Browse blockchain transaction history with filtering, status, and explorer links"
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={txColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No transactions found"
              description="Transaction history will appear here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
