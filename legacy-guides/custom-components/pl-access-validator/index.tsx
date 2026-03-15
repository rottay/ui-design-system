/**
 * PlAccessValidator - Main Export
 * Test and validate access policies for specific users, roles, and resources
 */

import type { PlAccessValidatorProps } from './core';
import { PL_ACCESS_VALIDATOR_DEFAULTS } from './core';
import { PL_ACCESS_VALIDATOR_PRESETS } from './presets';

export { type PlAccessValidatorProps, type PlAccessValidatorPreset, PL_ACCESS_VALIDATOR_DEFAULTS } from './core';
export * from './presets';

export function PlAccessValidator(props: PlAccessValidatorProps): React.ReactElement {
  const preset = props.preset ?? PL_ACCESS_VALIDATOR_DEFAULTS.preset ?? 'checker';
  const PresetComponent = PL_ACCESS_VALIDATOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlAccessValidator.displayName = 'PlAccessValidator';
