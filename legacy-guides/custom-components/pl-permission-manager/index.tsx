/**
 * PlPermissionManager - Main Export
 * Define and categorize permissions with module-level grouping and descriptions
 */

import type { PlPermissionManagerProps } from './core';
import { PL_PERMISSION_MANAGER_DEFAULTS } from './core';
import { PL_PERMISSION_MANAGER_PRESETS } from './presets';

export { type PlPermissionManagerProps, type PlPermissionManagerPreset, PL_PERMISSION_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlPermissionManager(props: PlPermissionManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_PERMISSION_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_PERMISSION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlPermissionManager.displayName = 'PlPermissionManager';
