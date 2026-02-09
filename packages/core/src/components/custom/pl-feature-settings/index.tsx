/**
 * PlFeatureSettings - Main Export
 * Configure feature flag settings per tenant and environment with overrides
 */

import type { PlFeatureSettingsProps } from './core';
import { PL_FEATURE_SETTINGS_DEFAULTS } from './core';
import { PL_FEATURE_SETTINGS_PRESETS } from './presets';

export { type PlFeatureSettingsProps, type PlFeatureSettingsPreset, PL_FEATURE_SETTINGS_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureSettings(props: PlFeatureSettingsProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_SETTINGS_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_FEATURE_SETTINGS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureSettings.displayName = 'PlFeatureSettings';
