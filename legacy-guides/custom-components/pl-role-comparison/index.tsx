/**
 * PlRoleComparison - Main Export
 * Compare two or more roles side-by-side to identify permission differences
 */

import type { PlRoleComparisonProps } from './core';
import { PL_ROLE_COMPARISON_DEFAULTS } from './core';
import { PL_ROLE_COMPARISON_PRESETS } from './presets';

export { type PlRoleComparisonProps, type PlRoleComparisonPreset, PL_ROLE_COMPARISON_DEFAULTS } from './core';
export * from './presets';

export function PlRoleComparison(props: PlRoleComparisonProps): React.ReactElement {
  const preset = props.preset ?? PL_ROLE_COMPARISON_DEFAULTS.preset ?? 'comparison';
  const PresetComponent = PL_ROLE_COMPARISON_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlRoleComparison.displayName = 'PlRoleComparison';
