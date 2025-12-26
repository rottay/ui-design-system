/**
 * Transfer - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TransferProps } from './types';

export {
  type TransferProps,
  type TransferItem,
  TRANSFER_DEFAULTS,
} from './types';

export const Transfer = createEngineComponent<TransferProps>('Transfer', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Transfer;
