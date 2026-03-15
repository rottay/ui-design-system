import type { ApiKeyManagerProps } from './core';
import { API_KEY_MANAGER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ApiKeyManagerProps, ApiKeyManagerPreset, ApiKey } from './core';
export { API_KEY_MANAGER_DEFAULTS } from './core';

export function ApiKeyManager(props: ApiKeyManagerProps): React.ReactElement {
  const preset = props.preset ?? API_KEY_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ApiKeyManager.displayName = 'ApiKeyManager';
