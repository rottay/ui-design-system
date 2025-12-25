/**
 * Divider - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DividerProps } from './types';

export {
  type DividerProps,
  type DividerOrientation,
  type DividerType,
  DIVIDER_DEFAULTS,
} from './types';


// Export base component
export { BaseDivider } from './base';

export const Divider = createEngineComponent<DividerProps>('Divider', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
