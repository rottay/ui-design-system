import type { PasskeyManagerProps } from './core';
import { PASSKEY_MANAGER_DEFAULTS } from './core';
import { PASSKEY_MANAGER_PRESETS } from './presets';

export { type PasskeyManagerProps, type PasskeyManagerPreset, type Passkey, type PasskeyType, PASSKEY_MANAGER_DEFAULTS } from './core';
export { getPasskeyTypeColors, getPasskeyIcon } from './core';
export * from './presets';

export function PasskeyManager(props: PasskeyManagerProps): React.ReactElement {
  const preset = props.preset ?? PASSKEY_MANAGER_DEFAULTS.preset ?? 'list';
  const PresetComponent = PASSKEY_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PasskeyManager.displayName = 'PasskeyManager';
export { ListPasskeyManager, CardsPasskeyManager } from './presets';
