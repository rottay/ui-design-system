/**
 * Grid - Engine Router
 * CSS Grid layout component with responsive support
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { GridProps } from './types';
import { GridItem } from './compound';

// Export types
export type {
  GridProps,
  GridItemProps,
  GridColumns,
  GridColumnsValue,
  GridRows,
  GridGap,
  GridGapValue,
  GridAutoFlow,
  GridAlignItems,
  GridJustifyItems,
  GridAlignContent,
  GridJustifyContent,
  GridPlaceItems,
  ResponsiveValue,
} from './types';

// Export defaults and maps
export {
  GRID_DEFAULTS,
  GRID_ITEM_DEFAULTS,
  GAP_MAP,
  ALIGN_ITEMS_MAP,
  JUSTIFY_ITEMS_MAP,
} from './types';

// Export compound components
export { GridItem };

// Export base components
export { BaseGrid, BaseGridItem } from './base';

// Export utility functions
export {
  buildGridStyles,
  buildGridItemStyles,
  filterGridProps,
  filterGridItemProps,
  resolveGap,
  resolveColumns,
  getResponsiveColumnsStyles,
} from './base';

// Create engine-aware Grid component with compound components
export const Grid = Object.assign(
  createEngineComponent<GridProps>('Grid', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Item: GridItem,
  }
);
