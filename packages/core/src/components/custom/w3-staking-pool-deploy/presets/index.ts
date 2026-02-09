/**
 * W3StakingPoolDeploy - All Presets
 */

export { WizardW3StakingPoolDeploy } from './wizard';
export { FormW3StakingPoolDeploy } from './form';

import type { W3StakingPoolDeployPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3StakingPoolDeployProps } from '../core';
import { WizardW3StakingPoolDeploy } from './wizard';
import { FormW3StakingPoolDeploy } from './form';

export const W3_STAKING_POOL_DEPLOY_PRESETS: Record<W3StakingPoolDeployPreset, ComponentType<W3StakingPoolDeployProps>> = {
  wizard: WizardW3StakingPoolDeploy,
  form: FormW3StakingPoolDeploy,
};
