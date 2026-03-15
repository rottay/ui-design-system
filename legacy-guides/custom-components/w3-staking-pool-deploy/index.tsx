/**
 * W3StakingPoolDeploy - Main Export
 * Deploy new staking pools with reward configuration and tier settings
 */

import type { W3StakingPoolDeployProps } from './core';
import { W3_STAKING_POOL_DEPLOY_DEFAULTS } from './core';
import { W3_STAKING_POOL_DEPLOY_PRESETS } from './presets';

export { type W3StakingPoolDeployProps, type W3StakingPoolDeployPreset, W3_STAKING_POOL_DEPLOY_DEFAULTS } from './core';
export * from './presets';

export function W3StakingPoolDeploy(props: W3StakingPoolDeployProps): React.ReactElement {
  const preset = props.preset ?? W3_STAKING_POOL_DEPLOY_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = W3_STAKING_POOL_DEPLOY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3StakingPoolDeploy.displayName = 'W3StakingPoolDeploy';
