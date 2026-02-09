/**
 * W3NftCollectionManager - Core Interface
 * Manage NFT collections with metadata, supply tracking, and batch operations
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3NftCollectionManagerPreset = 'gallery' | 'table';

export interface NftCollectionManagerItem {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  tokenId: string;
  owner?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'minted' | 'pending' | 'burned';
}

export interface W3NftCollectionManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3NftCollectionManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NftCollectionManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to mint */
  onMint?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_NFT_COLLECTION_MANAGER_DEFAULTS: Partial<W3NftCollectionManagerProps> = {
  preset: 'gallery',
};
