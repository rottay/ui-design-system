/**
 * Grid - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { GridProps } from './types';

export {
  type GridProps,
  type GridColumns,
  type GridGap,
  GRID_DEFAULTS,
} from './types';


// Export base component
export { BaseGrid } from './base';

export const Grid = createEngineComponent<GridProps>('Grid', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
