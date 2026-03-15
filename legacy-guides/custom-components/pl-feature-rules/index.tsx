/**
 * PlFeatureRules - Main Export
 * Build targeting rules for feature flags based on user attributes and segments
 */

import type { PlFeatureRulesProps } from './core';
import { PL_FEATURE_RULES_DEFAULTS } from './core';
import { PL_FEATURE_RULES_PRESETS } from './presets';

export { type PlFeatureRulesProps, type PlFeatureRulesPreset, PL_FEATURE_RULES_DEFAULTS } from './core';
export * from './presets';

export function PlFeatureRules(props: PlFeatureRulesProps): React.ReactElement {
  const preset = props.preset ?? PL_FEATURE_RULES_DEFAULTS.preset ?? 'builder';
  const PresetComponent = PL_FEATURE_RULES_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlFeatureRules.displayName = 'PlFeatureRules';
