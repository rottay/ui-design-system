/**
 * PlRoleManager - All Presets
 */

export { TreePlRoleManager } from './tree';
export { TablePlRoleManager } from './table';

import type { PlRoleManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlRoleManagerProps } from '../core';
import { TreePlRoleManager } from './tree';
import { TablePlRoleManager } from './table';

export const PL_ROLE_MANAGER_PRESETS: Record<PlRoleManagerPreset, ComponentType<PlRoleManagerProps>> = {
  tree: TreePlRoleManager,
  table: TablePlRoleManager,
};
