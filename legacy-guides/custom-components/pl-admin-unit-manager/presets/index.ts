/**
 * PlAdminUnitManager - All Presets
 */

export { TreePlAdminUnitManager } from './tree';
export { TablePlAdminUnitManager } from './table';

import type { PlAdminUnitManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlAdminUnitManagerProps } from '../core';
import { TreePlAdminUnitManager } from './tree';
import { TablePlAdminUnitManager } from './table';

export const PL_ADMIN_UNIT_MANAGER_PRESETS: Record<PlAdminUnitManagerPreset, ComponentType<PlAdminUnitManagerProps>> = {
  tree: TreePlAdminUnitManager,
  table: TablePlAdminUnitManager,
};
