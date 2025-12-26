/**
 * BackTop - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { BackTopProps } from './types';

export { type BackTopProps, BACKTOP_DEFAULTS } from './types';

export const BackTop = createEngineComponent<BackTopProps>('BackTop', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default BackTop;
