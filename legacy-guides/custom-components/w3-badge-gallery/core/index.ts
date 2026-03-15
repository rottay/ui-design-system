/**
 * W3BadgeGallery - Core Interface
 * Display earned badges and achievements with rarity levels and unlock conditions
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3BadgeGalleryPreset = 'gallery' | 'list';

export interface BadgeGalleryItem {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  tokenId: string;
  owner?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'minted' | 'pending' | 'burned';
}

export interface W3BadgeGalleryProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3BadgeGalleryPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: BadgeGalleryItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to mint */
  onMint?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_BADGE_GALLERY_DEFAULTS: Partial<W3BadgeGalleryProps> = {
  preset: 'gallery',
};
