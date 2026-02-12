'use client';

/**
 * W3WalletConnect - Wizard Preset
 * Keep custom wizard flow - minimal pattern usage (wallet connect is a custom flow)
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { W3WalletConnectProps, WalletConnectItem } from '../../core';
import {
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';

export const WizardW3WalletConnect = createPreset<W3WalletConnectProps>({
  name: 'W3WalletConnect.Wizard',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3WalletConnectProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onConnect } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="Connect Wallet"
        subtitle="Connect external wallets via WalletConnect, MetaMask, or other providers"
        actions={onConnect ? <button onClick={onConnect}>+ Connect Wallet</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        {items.length === 0 ? (
          <PatternEmptyState
            title="No wallets connected"
            description="Connect your first wallet to get started."
            engine={engine}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => onItemClick?.(wallet.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{wallet.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} - {wallet.network}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{wallet.balance}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: wallet.status === 'connected' ? '#dcfce7' : wallet.status === 'pending' ? '#fef3c7' : '#fecaca',
                    color: wallet.status === 'connected' ? '#166534' : wallet.status === 'pending' ? '#92400e' : '#991b1b',
                  }}>
                    {wallet.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PatternPageShell>
    );
  },
});
