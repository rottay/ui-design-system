/**
 * PlMfaSetup - Main Export
 * Guide users through multi-factor authentication setup with TOTP and backup codes
 */

import type { PlMfaSetupProps } from './core';
import { PL_MFA_SETUP_DEFAULTS } from './core';
import { PL_MFA_SETUP_PRESETS } from './presets';

export { type PlMfaSetupProps, type PlMfaSetupPreset, PL_MFA_SETUP_DEFAULTS } from './core';
export * from './presets';

export function PlMfaSetup(props: PlMfaSetupProps): React.ReactElement {
  const preset = props.preset ?? PL_MFA_SETUP_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = PL_MFA_SETUP_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlMfaSetup.displayName = 'PlMfaSetup';
