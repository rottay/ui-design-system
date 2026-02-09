/**
 * W3StakingRewards - Core Interface
 * Track staking rewards with claim history, projected earnings, and APY trends
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3StakingRewardsPreset = 'dashboard' | 'list';

export interface StakingRewardsItem {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  status: 'active' | 'paused' | 'ended';
  lockPeriod: string;
  minStake: string;
}

export interface W3StakingRewardsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3StakingRewardsPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: StakingRewardsItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to stake */
  onStake?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_STAKING_REWARDS_DEFAULTS: Partial<W3StakingRewardsProps> = {
  preset: 'dashboard',
};
