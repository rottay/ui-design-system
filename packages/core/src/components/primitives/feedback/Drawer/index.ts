/**
 * Drawer - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DrawerProps } from './types';

export {
  type DrawerProps,
  type DrawerPlacement,
  type DrawerSize,
  DRAWER_DEFAULTS,
} from './types';

export const Drawer = createEngineComponent<DrawerProps>('Drawer', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
