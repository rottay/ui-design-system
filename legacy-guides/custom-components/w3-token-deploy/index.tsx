/**
 * W3TokenDeploy - Main Export
 * Deploy new tokens with configurable supply, decimals, and feature settings
 */

import type { W3TokenDeployProps } from './core';
import { W3_TOKEN_DEPLOY_DEFAULTS } from './core';
import { W3_TOKEN_DEPLOY_PRESETS } from './presets';

export { type W3TokenDeployProps, type W3TokenDeployPreset, W3_TOKEN_DEPLOY_DEFAULTS } from './core';
export * from './presets';

export function W3TokenDeploy(props: W3TokenDeployProps): React.ReactElement {
  const preset = props.preset ?? W3_TOKEN_DEPLOY_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = W3_TOKEN_DEPLOY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TokenDeploy.displayName = 'W3TokenDeploy';
