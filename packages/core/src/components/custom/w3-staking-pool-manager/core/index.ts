/**
 * W3StakingPoolManager - Core Interface
 * Create and manage staking pools with APY, lock periods, and capacity settings
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3StakingPoolManagerPreset = 'cards' | 'table';

export interface StakingPoolManagerItem {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  status: 'active' | 'paused' | 'ended';
  lockPeriod: string;
  minStake: string;
}

export interface W3StakingPoolManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3StakingPoolManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: StakingPoolManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to stake */
  onStake?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_STAKING_POOL_MANAGER_DEFAULTS: Partial<W3StakingPoolManagerProps> = {
  preset: 'cards',
};
