/**
 * W3TokenDeploy - All Presets
 */

export { WizardW3TokenDeploy } from './wizard';
export { FormW3TokenDeploy } from './form';

import type { W3TokenDeployPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TokenDeployProps } from '../core';
import { WizardW3TokenDeploy } from './wizard';
import { FormW3TokenDeploy } from './form';

export const W3_TOKEN_DEPLOY_PRESETS: Record<W3TokenDeployPreset, ComponentType<W3TokenDeployProps>> = {
  wizard: WizardW3TokenDeploy,
  form: FormW3TokenDeploy,
};
