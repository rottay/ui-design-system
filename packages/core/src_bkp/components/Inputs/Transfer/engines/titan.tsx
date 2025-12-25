'use client';

/**
 * Titan Transfer Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Transfer as AntTransfer } from 'antd';
import type { TransferProps, TransferItem } from '../types';

/**
 * Titan Transfer Component
 *
 * Uses Ant Design Transfer under the hood.
 */
export default function TitanTransfer<T extends TransferItem = TransferItem>(
  props: TransferProps<T>
) {
  return <AntTransfer<T> {...props} />;
}
