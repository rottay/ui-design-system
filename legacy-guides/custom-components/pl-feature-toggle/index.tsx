/**
 * PlFeatureToggle - Main Export
 * Quick toggle interface for enabling and disabling feature flags per environment
 */

import type { PlFeatureToggleProps } from './core';
import { PL_FEATURE_TOGGLE_DEFAULTS } from './core';
import { PL_FEATURE_TOGGLE_PRESETS } from './presets';

export { type PlFeatureToggleProps, type PlFeatureTogglePreset, PL_FEATURE_TOGGLE_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureToggle(props: PlFeatureToggleProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_TOGGLE_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PL_FEATURE_TOGGLE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureToggle.displayName = 'PlFeatureToggle';
