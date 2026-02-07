export { GridPermissionTree } from './grid';
export { ListPermissionTree } from './list';

import type { PermissionTreePreset } from '../core';
import type { ComponentType } from 'react';
import type { PermissionTreeProps } from '../core';
import { GridPermissionTree } from './grid';
import { ListPermissionTree } from './list';

export const PERMISSION_TREE_PRESETS: Record<PermissionTreePreset, ComponentType<PermissionTreeProps>> = {
  grid: GridPermissionTree,
  list: ListPermissionTree,
};
