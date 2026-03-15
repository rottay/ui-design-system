'use client';

/**
 * W3NftCollectionManager - Table Preset
 * Compose PatternDataTable<NftCollectionManagerItem> with PatternPageShell
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { W3NftCollectionManagerProps, NftCollectionManagerItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const TableW3NftCollectionManager = createPreset<W3NftCollectionManagerProps>({
  name: 'W3NftCollectionManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3NftCollectionManagerProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onMint } = props;

    const nftColumns = useMemo(() => columns<NftCollectionManagerItem>([
      column('name', { header: 'Name', sortable: true }),
      column('tokenId', { header: 'Token ID' }),
      column('collection', { header: 'Collection' }),
      column('rarity', { header: 'Rarity', sortable: true }),
      column('status', { header: 'Status', sortable: true }),
      column('owner', { header: 'Owner' }),
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
        title="NFT Collection"
        subtitle="Manage NFT collections with metadata, supply tracking, and batch operations"
        actions={onMint ? <button onClick={onMint}>+ Mint NFT</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={nftColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No NFTs found"
              description="Mint your first NFT to get started."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
