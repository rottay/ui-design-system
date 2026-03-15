'use client';

/**
 * W3StakingPoolManager - Cards Preset
 * Compose PatternDetailPanel-like cards with staking pool data + LineChart for APY
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3StakingPoolManagerProps, StakingPoolManagerItem } from '../../core';
import {
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';

export const CardsW3StakingPoolManager = createPreset<W3StakingPoolManagerProps>({
  name: 'W3StakingPoolManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3StakingPoolManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onStake } = props;

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
        {items.length === 0 ? (
          <PatternEmptyState
            title="No staking pools"
            description="Create your first staking pool to get started."
            engine={engine}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {items.map((pool) => (
              <div
                key={pool.id}
                onClick={() => onStake?.(pool.id) ?? onItemClick?.(pool.id)}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{pool.name}</div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: pool.status === 'active' ? '#dcfce7' : pool.status === 'paused' ? '#fef3c7' : '#f3f4f6',
                    color: pool.status === 'active' ? '#166534' : pool.status === 'paused' ? '#92400e' : '#666',
                  }}>
                    {pool.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>APY</div>
                    <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.25rem' }}>{pool.apy}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Total Staked</div>
                    <div style={{ fontWeight: 600 }}>{pool.totalStaked}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Lock Period</div>
                    <div>{pool.lockPeriod}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>Min Stake</div>
                    <div>{pool.minStake}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Token: {pool.token}</div>
              </div>
            ))}
          </div>
        )}
      </PatternPageShell>
    );
  },
});
