'use client';

/**
 * W3TokenManager - Cards Preset
 * Compose PatternDataTable<TokenManagerItem> with card mobile view
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

export const CardsW3TokenManager = createPreset<W3TokenManagerProps>({
  name: 'W3TokenManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3TokenManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onDeploy } = props;

    const tokenColumns = useMemo(() => columns<TokenManagerItem>([
      column('name', { header: 'Name' }),
      column('symbol', { header: 'Symbol' }),
      column('price', { header: 'Price' }),
      column('change24h', { header: '24h Change' }),
      column('holders', { header: 'Holders' }),
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
          mobileCard={(row) => (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{row.name} ({row.symbol})</span>
                <span style={{
                  color: row.change24h > 0 ? '#16a34a' : row.change24h < 0 ? '#dc2626' : '#666',
                  fontWeight: 600,
                }}>
                  {row.change24h > 0 ? '+' : ''}{row.change24h}%
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: 4 }}>
                Price: {row.price} - {row.holders} holders
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{row.network}</div>
            </div>
          )}
          mobileBreakpoint={768}
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
