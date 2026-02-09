/**
 * W3SessionKeyManager - Main Export
 * Manage session keys for gasless transactions with permissions and expiration
 */

import type { W3SessionKeyManagerProps } from './core';
import { W3_SESSION_KEY_MANAGER_DEFAULTS } from './core';
import { W3_SESSION_KEY_MANAGER_PRESETS } from './presets';

export { type W3SessionKeyManagerProps, type W3SessionKeyManagerPreset, W3_SESSION_KEY_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function W3SessionKeyManager(props: W3SessionKeyManagerProps): React.ReactElement {
  const preset = props.preset ?? W3_SESSION_KEY_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = W3_SESSION_KEY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3SessionKeyManager.displayName = 'W3SessionKeyManager';
