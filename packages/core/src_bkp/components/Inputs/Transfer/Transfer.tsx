'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { TransferProps, TransferItem } from './types';
import TitanTransfer from './engines/titan';

/**
 * Transfer Component
 *
 * Multi-engine transfer list that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Transfer (default, full featured)
 * - hermes: DaisyUI-based transfer (lazy loaded)
 * - apollo: Native HTML + Tailwind transfer (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [targetKeys, setTargetKeys] = useState<string[]>([]);
 *
 * <Transfer
 *   dataSource={[
 *     { key: '1', title: 'Item 1' },
 *     { key: '2', title: 'Item 2' },
 *   ]}
 *   targetKeys={targetKeys}
 *   onChange={(keys) => setTargetKeys(keys)}
 * />
 *
 * // With search
 * <Transfer
 *   dataSource={items}
 *   targetKeys={targetKeys}
 *   showSearch
 *   onChange={(keys) => setTargetKeys(keys)}
 * />
 *
 * // One-way transfer
 * <Transfer
 *   dataSource={items}
 *   targetKeys={targetKeys}
 *   oneWay
 *   onChange={(keys) => setTargetKeys(keys)}
 * />
 * ```
 */
export const Transfer = createEngineComponent<TransferProps<TransferItem>>(
  {
    titan: TitanTransfer,
    hermes: lazyEngine(() =>
      import('./engines/hermes').then((m) => ({
        default: m.default,
      }))
    ),
    apollo: lazyEngine(() =>
      import('./engines/apollo').then((m) => ({
        default: m.default,
      }))
    ),
    athena: lazyEngine(() =>
      import('./engines/athena').then((m) => ({
        default: m.default,
      }))
    ),
  },
  { displayName: 'Transfer' }
);
