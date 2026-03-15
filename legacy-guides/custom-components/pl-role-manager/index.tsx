/**
 * PlRoleManager - Main Export
 * Hierarchical role management with inheritance, permissions, and user assignment
 */

import type { PlRoleManagerProps } from './core';
import { PL_ROLE_MANAGER_DEFAULTS } from './core';
import { PL_ROLE_MANAGER_PRESETS } from './presets';

export {
  type PlRoleManagerProps,
  type PlRoleManagerPreset,
  type Role,
  type RoleType,
  type RoleStatus,
  PL_ROLE_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function PlRoleManager(props: PlRoleManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_ROLE_MANAGER_DEFAULTS.preset ?? 'tree';
  const PresetComponent = PL_ROLE_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlRoleManager.displayName = 'PlRoleManager';
