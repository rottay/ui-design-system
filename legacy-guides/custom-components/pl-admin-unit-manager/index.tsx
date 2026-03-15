/**
 * PlAdminUnitManager - Main Export
 * Manage organizational units in a hierarchical structure with drag-and-drop
 */

import type { PlAdminUnitManagerProps } from './core';
import { PL_ADMIN_UNIT_MANAGER_DEFAULTS } from './core';
import { PL_ADMIN_UNIT_MANAGER_PRESETS } from './presets';

export { type PlAdminUnitManagerProps, type PlAdminUnitManagerPreset, PL_ADMIN_UNIT_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlAdminUnitManager(props: PlAdminUnitManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_ADMIN_UNIT_MANAGER_DEFAULTS.preset ?? 'tree';
  const PresetComponent = PL_ADMIN_UNIT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlAdminUnitManager.displayName = 'PlAdminUnitManager';
