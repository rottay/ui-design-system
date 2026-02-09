/**
 * W3StakingTierConfig - Core Interface
 * Configure staking tiers with multipliers, minimum amounts, and lock periods
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3StakingTierConfigPreset = 'editor' | 'cards';

export interface StakingTierConfigItem {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  status: 'active' | 'paused' | 'ended';
  lockPeriod: string;
  minStake: string;
}

export interface W3StakingTierConfigProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3StakingTierConfigPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: StakingTierConfigItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to stake */
  onStake?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_STAKING_TIER_CONFIG_DEFAULTS: Partial<W3StakingTierConfigProps> = {
  preset: 'editor',
};
