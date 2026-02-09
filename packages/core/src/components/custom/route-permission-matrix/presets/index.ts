/**
 * RoutePermissionMatrix - All Presets
 */

import type { RoutePermissionMatrixPreset } from '../core';
import { MatrixRoutePermissionMatrix } from './matrix';
import { CompactRoutePermissionMatrix } from './compact';

export { MatrixRoutePermissionMatrix } from './matrix';
export { CompactRoutePermissionMatrix } from './compact';

export const ROUTE_PERMISSION_MATRIX_PRESETS: Record<RoutePermissionMatrixPreset, React.ComponentType<any>> = {
  matrix: MatrixRoutePermissionMatrix,
  compact: CompactRoutePermissionMatrix,
};
