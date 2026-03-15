/**
 * W3StakingPoolManager - Main Export
 * Create and manage staking pools with APY, lock periods, and capacity settings
 */

import type { W3StakingPoolManagerProps } from './core';
import { W3_STAKING_POOL_MANAGER_DEFAULTS } from './core';
import { W3_STAKING_POOL_MANAGER_PRESETS } from './presets';

export { type W3StakingPoolManagerProps, type W3StakingPoolManagerPreset, W3_STAKING_POOL_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function W3StakingPoolManager(props: W3StakingPoolManagerProps): React.ReactElement {
  const preset = props.preset ?? W3_STAKING_POOL_MANAGER_DEFAULTS.preset ?? 'cards';
  const PresetComponent = W3_STAKING_POOL_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3StakingPoolManager.displayName = 'W3StakingPoolManager';
