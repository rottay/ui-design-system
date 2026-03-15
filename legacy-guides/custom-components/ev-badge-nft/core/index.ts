import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BadgeNftPreset = 'gallery' | 'admin';

export interface DigitalBadge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: string;
  earned: boolean;
  earnedDate?: Date;
  totalEarned: number;
  totalPossible: number;
}

export interface BadgeProgress {
  badgeId: string;
  current: number;
  required: number;
  percentComplete: number;
}

export interface BadgeNftProps extends EngineAwareProps {
  preset?: BadgeNftPreset;
  badges?: DigitalBadge[];
  progress?: BadgeProgress[];
  onBadgeClick?: (badgeId: string) => void;
  onMintNft?: (badgeId: string) => void;
  onCreateBadge?: () => void;
  style?: CSSProperties;
  className?: string;
}

export const BADGE_NFT_DEFAULTS: Required<
  Pick<BadgeNftProps, 'preset' | 'badges' | 'progress'>
> = {
  preset: 'gallery',
  badges: [],
  progress: [],
};
