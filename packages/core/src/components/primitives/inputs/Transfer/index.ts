/**
 * Transfer - Engine Router
 *
 * This module exports the Transfer component with multi-engine support.
 * Transfer provides a double-column interface for moving items between lists.
 *
 * @module Transfer
 * @example
 * ```tsx
 * import { Transfer } from '@rottay/design-system';
 *
 * // Basic usage
 * <Transfer
 *   dataSource={[
 *     { key: '1', title: 'Item 1' },
 *     { key: '2', title: 'Item 2' },
 *   ]}
 *   targetKeys={['2']}
 *   onChange={(keys, direction) => setKeys(keys)}
 * />
 *
 * // With search
 * <Transfer dataSource={data} showSearch />
 *
 * // One way transfer
 * <Transfer dataSource={data} oneWay />
 *
 * // Custom titles
 * <Transfer dataSource={data} titles={['Available', 'Selected']} />
 * ```
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
