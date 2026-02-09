/**
 * W3StakingTierConfig - Main Export
 * Configure staking tiers with multipliers, minimum amounts, and lock periods
 */

import type { W3StakingTierConfigProps } from './core';
import { W3_STAKING_TIER_CONFIG_DEFAULTS } from './core';
import { W3_STAKING_TIER_CONFIG_PRESETS } from './presets';

export { type W3StakingTierConfigProps, type W3StakingTierConfigPreset, W3_STAKING_TIER_CONFIG_DEFAULTS } from './core';
export * from './presets';

export function W3StakingTierConfig(props: W3StakingTierConfigProps): React.ReactElement {
  const preset = props.preset ?? W3_STAKING_TIER_CONFIG_DEFAULTS.preset ?? 'editor';
  const PresetComponent = W3_STAKING_TIER_CONFIG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3StakingTierConfig.displayName = 'W3StakingTierConfig';
