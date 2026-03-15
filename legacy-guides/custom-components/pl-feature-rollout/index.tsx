/**
 * PlFeatureRollout - Main Export
 * Plan and execute gradual feature rollouts with percentage-based targeting
 */

import type { PlFeatureRolloutProps } from './core';
import { PL_FEATURE_ROLLOUT_DEFAULTS } from './core';
import { PL_FEATURE_ROLLOUT_PRESETS } from './presets';

export { type PlFeatureRolloutProps, type PlFeatureRolloutPreset, PL_FEATURE_ROLLOUT_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureRollout(props: PlFeatureRolloutProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_ROLLOUT_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = PL_FEATURE_ROLLOUT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureRollout.displayName = 'PlFeatureRollout';
