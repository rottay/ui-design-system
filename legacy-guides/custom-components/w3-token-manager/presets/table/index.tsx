'use client';

/**
 * W3TokenManager - Table Preset
 * Compose PatternDataTable<TokenManagerItem>
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { W3TokenManagerProps, TokenManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const TableW3TokenManager = createPreset<W3TokenManagerProps>({
  name: 'W3TokenManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3TokenManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onDeploy } = props;

    const tokenColumns = useMemo(() => columns<TokenManagerItem>([
      column('name', { header: 'Name', sortable: true }),
      column('symbol', { header: 'Symbol', sortable: true }),
      column('price', { header: 'Price', sortable: true }),
      column('change24h', {
        header: '24h Change',
        sortable: true,
        render: (value) => {
          const num = Number(value);
          const color = num > 0 ? '#16a34a' : num < 0 ? '#dc2626' : '#666';
          return <span style={{ color }}>{num > 0 ? '+' : ''}{num}%</span>;
        },
      }),
      column('holders', { header: 'Holders', sortable: true }),
      column('supply', { header: 'Supply' }),
      column('network', { header: 'Network' }),
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
        title="Token Manager"
        subtitle="Manage ERC-20 and custom tokens with supply info, holders, and operations"
        actions={onDeploy ? <button onClick={onDeploy}>+ Deploy Token</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={tokenColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No tokens found"
              description="Deploy your first token to get started."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
