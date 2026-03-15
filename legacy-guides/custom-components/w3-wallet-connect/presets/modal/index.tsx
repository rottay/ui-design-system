'use client';

/**
 * W3WalletConnect - Modal Preset
 * Keep custom modal flow - minimal pattern usage
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3WalletConnectProps, WalletConnectItem } from '../../core';
import {
  PatternEmptyState,
} from '../../../../patterns';

export const ModalW3WalletConnect = createPreset<W3WalletConnectProps>({
  name: 'W3WalletConnect.Modal',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3WalletConnectProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onConnect } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <div className={className} style={{ padding: 24, maxWidth: 480, margin: '0 auto', ...style }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>Connect Wallet</h3>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.875rem' }}>
            Choose a wallet provider to connect
          </p>
        </div>

        {items.length === 0 ? (
          <PatternEmptyState
            title="No wallets available"
            description="No wallet providers detected."
            engine={engine}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onItemClick?.(wallet.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600 }}>{wallet.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{wallet.network}</span>
              </button>
            ))}
          </div>
        )}

        {onConnect && (
          <button
            onClick={onConnect}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#6366f1',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Connect New Wallet
          </button>
        )}
      </div>
    );
  },
});
