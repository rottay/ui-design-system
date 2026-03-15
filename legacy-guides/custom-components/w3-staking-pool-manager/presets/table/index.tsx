'use client';

/**
 * W3StakingPoolManager - Table Preset
 * Compose PatternDataTable<StakingPoolManagerItem>
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { W3StakingPoolManagerProps, StakingPoolManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const TableW3StakingPoolManager = createPreset<W3StakingPoolManagerProps>({
  name: 'W3StakingPoolManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3StakingPoolManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onStake } = props;

    const stakingColumns = useMemo(() => columns<StakingPoolManagerItem>([
      column('name', { header: 'Pool Name', sortable: true }),
      column('token', { header: 'Token' }),
      column('apy', {
        header: 'APY',
        sortable: true,
        render: (value) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{Number(value)}%</span>,
      }),
      column('totalStaked', { header: 'Total Staked', sortable: true }),
      column('status', { header: 'Status', sortable: true }),
      column('lockPeriod', { header: 'Lock Period' }),
      column('minStake', { header: 'Min Stake' }),
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
        title="Staking Pools"
        subtitle="Create and manage staking pools with APY, lock periods, and capacity settings"
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={stakingColumns}
          rowKey="id"
          onRowClick={(row) => onStake?.(row.id) ?? onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No staking pools"
              description="Create your first staking pool to get started."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
