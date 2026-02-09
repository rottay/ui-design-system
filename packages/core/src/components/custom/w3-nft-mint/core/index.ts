/**
 * W3NftMint - Core Interface
 * Mint new NFTs with metadata, media upload, and batch minting support
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3NftMintPreset = 'form' | 'wizard';

export interface NftMintItem {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  tokenId: string;
  owner?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'minted' | 'pending' | 'burned';
}

export interface W3NftMintProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3NftMintPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NftMintItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to mint */
  onMint?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_NFT_MINT_DEFAULTS: Partial<W3NftMintProps> = {
  preset: 'form',
};
