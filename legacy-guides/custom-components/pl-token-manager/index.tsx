/**
 * PlTokenManager - Main Export
 * Manage authentication tokens including API keys, refresh tokens, and JWT sessions
 */

import type { PlTokenManagerProps } from './core';
import { PL_TOKEN_MANAGER_DEFAULTS } from './core';
import { PL_TOKEN_MANAGER_PRESETS } from './presets';

export { type PlTokenManagerProps, type PlTokenManagerPreset, PL_TOKEN_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlTokenManager(props: PlTokenManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_TOKEN_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_TOKEN_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlTokenManager.displayName = 'PlTokenManager';
