/**
 * PlApiKeyManager - Main Export
 * Generate, revoke, and manage API keys with scopes, rate limits, and expiration
 */

import type { PlApiKeyManagerProps } from './core';
import { PL_API_KEY_MANAGER_DEFAULTS } from './core';
import { PL_API_KEY_MANAGER_PRESETS } from './presets';

export {
  type PlApiKeyManagerProps,
  type PlApiKeyManagerPreset,
  type ApiKey,
  type ApiKeyStatus,
  type ApiKeyScope,
  type ApiKeyEnvironment,
  PL_API_KEY_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function PlApiKeyManager(props: PlApiKeyManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_API_KEY_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_API_KEY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlApiKeyManager.displayName = 'PlApiKeyManager';
