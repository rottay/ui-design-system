/**
 * W3StakingRewards - Main Export
 * Track staking rewards with claim history, projected earnings, and APY trends
 */

import type { W3StakingRewardsProps } from './core';
import { W3_STAKING_REWARDS_DEFAULTS } from './core';
import { W3_STAKING_REWARDS_PRESETS } from './presets';

export { type W3StakingRewardsProps, type W3StakingRewardsPreset, W3_STAKING_REWARDS_DEFAULTS } from './core';
export * from './presets';

export function W3StakingRewards(props: W3StakingRewardsProps): React.ReactElement {
  const preset = props.preset ?? W3_STAKING_REWARDS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = W3_STAKING_REWARDS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3StakingRewards.displayName = 'W3StakingRewards';
