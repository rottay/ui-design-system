/**
 * W3StakingPosition - Core Interface
 * View active staking positions with earned rewards, unlock timers, and actions
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3StakingPositionPreset = 'cards' | 'table';

export interface StakingPositionItem {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  status: 'active' | 'paused' | 'ended';
  lockPeriod: string;
  minStake: string;
}

export interface W3StakingPositionProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3StakingPositionPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: StakingPositionItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to stake */
  onStake?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_STAKING_POSITION_DEFAULTS: Partial<W3StakingPositionProps> = {
  preset: 'cards',
};
