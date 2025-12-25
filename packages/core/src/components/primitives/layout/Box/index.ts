/**
 * Box - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { BoxProps } from './types';

export { type BoxProps, BOX_DEFAULTS } from './types';


// Export base component
export { BaseBox } from './base';

export const Box = createEngineComponent<BoxProps>('Box', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
