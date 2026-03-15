/**
 * PlRolePermissionMatrix - Main Export
 * View and edit role-permission assignments in an interactive matrix grid
 */

import type { PlRolePermissionMatrixProps } from './core';
import { PL_ROLE_PERMISSION_MATRIX_DEFAULTS } from './core';
import { PL_ROLE_PERMISSION_MATRIX_PRESETS } from './presets';

export { type PlRolePermissionMatrixProps, type PlRolePermissionMatrixPreset, PL_ROLE_PERMISSION_MATRIX_DEFAULTS } from './core';
export * from './presets';

export function PlRolePermissionMatrix(props: PlRolePermissionMatrixProps): React.ReactElement {
  const preset = props.preset ?? PL_ROLE_PERMISSION_MATRIX_DEFAULTS.preset ?? 'matrix';
  const PresetComponent = PL_ROLE_PERMISSION_MATRIX_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlRolePermissionMatrix.displayName = 'PlRolePermissionMatrix';
