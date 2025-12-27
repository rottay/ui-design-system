/**
 * Drawer Component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DrawerProps } from './types';
import { DrawerHeader, DrawerBody, DrawerFooter } from './compound';

export {
  type DrawerProps,
  type DrawerPlacement,
  type DrawerSize,
  DRAWER_DEFAULTS,
} from './types';

export { DrawerHeader, DrawerBody, DrawerFooter };
export type { DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps } from './compound';

export const Drawer = Object.assign(
  createEngineComponent<DrawerProps>('Drawer', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Header: DrawerHeader,
    Body: DrawerBody,
    Footer: DrawerFooter,
  }
);
