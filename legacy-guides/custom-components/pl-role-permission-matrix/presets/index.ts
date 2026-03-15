/**
 * PlRolePermissionMatrix - All Presets
 */

export { MatrixPlRolePermissionMatrix } from './matrix';
export { ListPlRolePermissionMatrix } from './list';

import type { PlRolePermissionMatrixPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlRolePermissionMatrixProps } from '../core';
import { MatrixPlRolePermissionMatrix } from './matrix';
import { ListPlRolePermissionMatrix } from './list';

export const PL_ROLE_PERMISSION_MATRIX_PRESETS: Record<PlRolePermissionMatrixPreset, ComponentType<PlRolePermissionMatrixProps>> = {
  matrix: MatrixPlRolePermissionMatrix,
  list: ListPlRolePermissionMatrix,
};
