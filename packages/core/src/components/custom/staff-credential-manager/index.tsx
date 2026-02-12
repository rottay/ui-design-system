/**
 * StaffCredentialManager - Main Export
 * Certifications and digital credentials with QR codes, expiry tracking
 */

import type { StaffCredentialManagerProps } from './core';
import { STAFF_CREDENTIAL_MANAGER_DEFAULTS } from './core';
import { STAFF_CREDENTIAL_MANAGER_PRESETS } from './presets';

export {
  type StaffCredentialManagerProps,
  type StaffCredentialManagerPreset,
  type StaffCredential,
  STAFF_CREDENTIAL_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function StaffCredentialManager(props: StaffCredentialManagerProps): React.ReactElement {
  const preset = props.preset ?? STAFF_CREDENTIAL_MANAGER_DEFAULTS.preset ?? 'grid';
  const PresetComponent = STAFF_CREDENTIAL_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffCredentialManager.displayName = 'StaffCredentialManager';

export { GridStaffCredentialManager, TableStaffCredentialManager } from './presets';
