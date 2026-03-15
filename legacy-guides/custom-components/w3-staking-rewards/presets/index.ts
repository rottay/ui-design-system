/**
 * W3StakingRewards - All Presets
 */

export { DashboardW3StakingRewards } from './dashboard';
export { ListW3StakingRewards } from './list';

import type { W3StakingRewardsPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3StakingRewardsProps } from '../core';
import { DashboardW3StakingRewards } from './dashboard';
import { ListW3StakingRewards } from './list';

export const W3_STAKING_REWARDS_PRESETS: Record<W3StakingRewardsPreset, ComponentType<W3StakingRewardsProps>> = {
  dashboard: DashboardW3StakingRewards,
  list: ListW3StakingRewards,
};
