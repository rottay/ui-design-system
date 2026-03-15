/**
 * PlSessionManager - Main Export
 * View and manage active user sessions across devices and locations
 */

import type { PlSessionManagerProps } from './core';
import { PL_SESSION_MANAGER_DEFAULTS } from './core';
import { PL_SESSION_MANAGER_PRESETS } from './presets';

export { type PlSessionManagerProps, type PlSessionManagerPreset, PL_SESSION_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlSessionManager(props: PlSessionManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_SESSION_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_SESSION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlSessionManager.displayName = 'PlSessionManager';
