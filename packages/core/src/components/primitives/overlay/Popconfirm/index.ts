/**
 * Popconfirm - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { PopconfirmProps } from './types';

export {
  type PopconfirmProps,
  type PopconfirmPlacement,
  type PopconfirmOkType,
  POPCONFIRM_DEFAULTS,
} from './types';

export const Popconfirm = createEngineComponent<PopconfirmProps>('Popconfirm', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Popconfirm;
