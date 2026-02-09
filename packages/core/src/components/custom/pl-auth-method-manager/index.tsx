/**
 * PlAuthMethodManager - Main Export
 * Manage authentication methods including passwords, SSO, social logins, and passkeys
 */

import type { PlAuthMethodManagerProps } from './core';
import { PL_AUTH_METHOD_MANAGER_DEFAULTS } from './core';
import { PL_AUTH_METHOD_MANAGER_PRESETS } from './presets';

export { type PlAuthMethodManagerProps, type PlAuthMethodManagerPreset, PL_AUTH_METHOD_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlAuthMethodManager(props: PlAuthMethodManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_AUTH_METHOD_MANAGER_DEFAULTS.preset ?? 'list';
  const PresetComponent = PL_AUTH_METHOD_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlAuthMethodManager.displayName = 'PlAuthMethodManager';
