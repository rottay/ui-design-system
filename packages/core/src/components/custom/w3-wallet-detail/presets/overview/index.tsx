'use client';

/**
 * W3WalletDetail - Overview Preset
 * Compose PatternDetailPanel<WalletDetailItem> with balance, NFTs
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3WalletDetailProps, WalletDetailItem } from '../../core';
import {
  PatternDetailPanel,
  PatternEmptyState,
} from '../../../../patterns';
import type { DetailTab } from '../../../../patterns';

export const OverviewW3WalletDetail = createPreset<W3WalletDetailProps>({
  name: 'W3WalletDetail.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3WalletDetailProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onConnect } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <PatternEmptyState
          title="No wallet details"
          description="Connect a wallet to view its details."
          className={className}
          style={style}
          engine={engine}
        />
      );
    }

    const wallet = items[0];

    const tabs: DetailTab[] = [
      {
        key: 'overview',
        label: 'Overview',
        content: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Balance:</strong> {wallet.balance}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Network:</strong> {wallet.network}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Address:</strong> {wallet.address}
            </div>
          </div>
        ),
      },
      {
        key: 'tokens',
        label: 'Tokens',
        content: (
          <div style={{ color: '#888', fontStyle: 'italic' }}>
            Token holdings will appear here.
          </div>
        ),
      },
    ];

    const sidebar = (
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Status</div>
          <div style={{ fontWeight: 600 }}>{wallet.status}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Network</div>
          <div>{wallet.network}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Balance</div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{wallet.balance}</div>
        </div>
      </div>
    );

    return (
      <PatternDetailPanel
        data={wallet}
        title={wallet.name}
        subtitle={`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
        status={{
          label: wallet.status,
          color: wallet.status === 'connected' ? 'green' : wallet.status === 'pending' ? 'orange' : 'red',
        }}
        tabs={tabs}
        sidebar={sidebar}
        sidebarPosition="right"
        className={className}
        style={style}
        engine={engine}
      />
    );
  },
});
