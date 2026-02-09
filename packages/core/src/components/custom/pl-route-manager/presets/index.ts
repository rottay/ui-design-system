/**
 * PlRouteManager - All Presets
 */

export { TablePlRouteManager } from './table';
export { TreePlRouteManager } from './tree';

import type { PlRouteManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlRouteManagerProps } from '../core';
import { TablePlRouteManager } from './table';
import { TreePlRouteManager } from './tree';

export const PL_ROUTE_MANAGER_PRESETS: Record<PlRouteManagerPreset, ComponentType<PlRouteManagerProps>> = {
  table: TablePlRouteManager,
  tree: TreePlRouteManager,
};
