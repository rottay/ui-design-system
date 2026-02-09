/**
 * RoutePermissionMatrix - Main Export
 * Automatically selects preset based on props
 */

import type { RoutePermissionMatrixProps } from './core';
import { ROUTE_PERMISSION_MATRIX_DEFAULTS } from './core';
import { ROUTE_PERMISSION_MATRIX_PRESETS } from './presets';

export { type RoutePermissionMatrixProps, type RoutePermissionMatrixPreset, type PermissionLevel, type RoutePermission, ROUTE_PERMISSION_MATRIX_DEFAULTS } from './core';
export { getPermissionColors, getPermissionIcon, cyclePermissionLevel, groupRoutesByModule } from './core';
export * from './presets';

/**
 * RoutePermissionMatrix component
 * Renders the appropriate preset based on the preset prop
 */
export function RoutePermissionMatrix(props: RoutePermissionMatrixProps): React.ReactElement {
  const preset = props.preset ?? ROUTE_PERMISSION_MATRIX_DEFAULTS.preset ?? 'matrix';
  const PresetComponent = ROUTE_PERMISSION_MATRIX_PRESETS[preset];

  return <PresetComponent {...props} />;
}

RoutePermissionMatrix.displayName = 'RoutePermissionMatrix';

export { MatrixRoutePermissionMatrix, CompactRoutePermissionMatrix } from './presets';
