'use client';

/**
 * W3NftCollectionManager - Gallery Preset
 * Keep custom grid, add PatternPageShell wrapper
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3NftCollectionManagerProps, NftCollectionManagerItem } from '../../core';
import {
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const GalleryW3NftCollectionManager = createPreset<W3NftCollectionManagerProps>({
  name: 'W3NftCollectionManager.Gallery',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3NftCollectionManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onMint } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="NFT Collection"
        subtitle="Manage NFT collections with metadata, supply tracking, and batch operations"
        actions={onMint ? <button onClick={onMint}>+ Mint NFT</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        {items.length === 0 ? (
          <PatternEmptyState
            title="No NFTs found"
            description="Mint your first NFT to get started."
            engine={engine}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {items.map((nft) => (
              <div
                key={nft.id}
                onClick={() => onItemClick?.(nft.id)}
                style={{
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
              >
                <div style={{
                  height: 200,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {nft.image ? (
                    <img src={nft.image} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem', color: '#d1d5db' }}>NFT</span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{nft.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>
                    #{nft.tokenId} {nft.collection ? `- ${nft.collection}` : ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {nft.rarity && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: RARITY_COLORS[nft.rarity] ?? '#666',
                        border: `1px solid ${RARITY_COLORS[nft.rarity] ?? '#ddd'}`,
                      }}>
                        {nft.rarity}
                      </span>
                    )}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: nft.status === 'minted' ? '#dcfce7' : nft.status === 'pending' ? '#fef3c7' : '#fecaca',
                      color: nft.status === 'minted' ? '#166534' : nft.status === 'pending' ? '#92400e' : '#991b1b',
                    }}>
                      {nft.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PatternPageShell>
    );
  },
});
