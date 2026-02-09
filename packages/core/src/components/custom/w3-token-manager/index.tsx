/**
 * W3TokenManager - Main Export
 * Manage ERC-20 and custom tokens with supply info, holders, and operations
 */

import type { W3TokenManagerProps } from './core';
import { W3_TOKEN_MANAGER_DEFAULTS } from './core';
import { W3_TOKEN_MANAGER_PRESETS } from './presets';

export { type W3TokenManagerProps, type W3TokenManagerPreset, W3_TOKEN_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function W3TokenManager(props: W3TokenManagerProps): React.ReactElement {
  const preset = props.preset ?? W3_TOKEN_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = W3_TOKEN_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TokenManager.displayName = 'W3TokenManager';
