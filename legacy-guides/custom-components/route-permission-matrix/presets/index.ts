/**
 * RoutePermissionMatrix - All Presets
 */

import type { RoutePermissionMatrixPreset, RoutePermissionMatrixProps } from '../core';
import type { ComponentType } from 'react';
import { MatrixRoutePermissionMatrix } from './matrix';
import { CompactRoutePermissionMatrix } from './compact';

export { MatrixRoutePermissionMatrix } from './matrix';
export { CompactRoutePermissionMatrix } from './compact';

export const ROUTE_PERMISSION_MATRIX_PRESETS: Record<RoutePermissionMatrixPreset, ComponentType<RoutePermissionMatrixProps>> = {
  matrix: MatrixRoutePermissionMatrix,
  compact: CompactRoutePermissionMatrix,
};
