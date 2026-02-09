/**
 * PlFeatureUsage - Main Export
 * Track feature flag evaluation metrics and adoption rates over time
 */

import type { PlFeatureUsageProps } from './core';
import { PL_FEATURE_USAGE_DEFAULTS } from './core';
import { PL_FEATURE_USAGE_PRESETS } from './presets';

export { type PlFeatureUsageProps, type PlFeatureUsagePreset, PL_FEATURE_USAGE_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureUsage(props: PlFeatureUsageProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_USAGE_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PL_FEATURE_USAGE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureUsage.displayName = 'PlFeatureUsage';
