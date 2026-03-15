/**
 * PlPermissionManager - All Presets
 */

export { TablePlPermissionManager } from './table';
export { GridPlPermissionManager } from './grid';

import type { PlPermissionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlPermissionManagerProps } from '../core';
import { TablePlPermissionManager } from './table';
import { GridPlPermissionManager } from './grid';

export const PL_PERMISSION_MANAGER_PRESETS: Record<PlPermissionManagerPreset, ComponentType<PlPermissionManagerProps>> = {
  table: TablePlPermissionManager,
  grid: GridPlPermissionManager,
};
