/**
 * W3StakingPoolDeploy - Core Interface
 * Deploy new staking pools with reward configuration and tier settings
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3StakingPoolDeployPreset = 'wizard' | 'form';

export interface StakingPoolDeployItem {
  id: string;
  name: string;
  token: string;
  apy: number;
  totalStaked: string;
  status: 'active' | 'paused' | 'ended';
  lockPeriod: string;
  minStake: string;
}

export interface W3StakingPoolDeployProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3StakingPoolDeployPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: StakingPoolDeployItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to stake */
  onStake?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_STAKING_POOL_DEPLOY_DEFAULTS: Partial<W3StakingPoolDeployProps> = {
  preset: 'wizard',
};
