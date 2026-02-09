/**
 * EvStaffCredentials - Main Export
 * Credential/badge management
 * Automatically selects preset based on props
 */

import type { EvStaffCredentialsProps } from './core';
import { EV_STAFF_CREDENTIALS_DEFAULTS } from './core';
import { EV_STAFF_CREDENTIALS_PRESETS } from './presets';

export {
  type EvStaffCredentialsProps,
  type EvStaffCredentialsPreset,
  type Credential as EvStaffCredentialsCredential,
  EV_STAFF_CREDENTIALS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvStaffCredentials component
 * Renders the appropriate preset based on the preset prop
 */
export function EvStaffCredentials(props: EvStaffCredentialsProps): React.ReactElement {
  const preset = props.preset ?? EV_STAFF_CREDENTIALS_DEFAULTS.preset ?? 'list';
  const PresetComponent = EV_STAFF_CREDENTIALS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvStaffCredentials.displayName = 'EvStaffCredentials';

export { ListEvStaffCredentials, ScannerEvStaffCredentials } from './presets';
