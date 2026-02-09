/**
 * PlPasskeyManager - Main Export
 * Register and manage WebAuthn passkeys for passwordless authentication
 */

import type { PlPasskeyManagerProps } from './core';
import { PL_PASSKEY_MANAGER_DEFAULTS } from './core';
import { PL_PASSKEY_MANAGER_PRESETS } from './presets';

export {
  type PlPasskeyManagerProps,
  type PlPasskeyManagerPreset,
  type Passkey,
  type PasskeyStatus,
  type PasskeyTransport,
  type AuthenticatorType,
  type SetupStep,
  PL_PASSKEY_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function PlPasskeyManager(props: PlPasskeyManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_PASSKEY_MANAGER_DEFAULTS.preset ?? 'list';
  const PresetComponent = PL_PASSKEY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlPasskeyManager.displayName = 'PlPasskeyManager';
