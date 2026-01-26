'use client';

/**
 * @fileoverview Transfer Component - Rottay Design System
 * @description A double-column interface for moving items between two lists,
 * commonly used for permission assignment, category selection, or batch operations.
 *
 * @remarks
 * The Transfer component provides dual-list selection for:
 * - **Permission management**: Assign roles, permissions to users
 * - **Category assignment**: Move items between categories
 * - **List management**: Available vs selected items
 * - **Batch operations**: Select multiple items for processing
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Search filtering**: Filter items in each list
 * - **One-way mode**: Only allow left-to-right transfer
 * - **Pagination**: Handle large datasets efficiently
 * - **Custom rendering**: Custom item and header rendering
 * - **Select all**: Bulk selection with checkbox
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic transfer
 * ```tsx
 * import { Transfer } from '@rottay/design-system';
 *
 * const dataSource = [
 *   { key: '1', title: 'Item 1' },
 *   { key: '2', title: 'Item 2' },
 *   { key: '3', title: 'Item 3' },
 * ];
 *
 * <Transfer
 *   dataSource={dataSource}
 *   targetKeys={selectedKeys}
 *   onChange={(keys) => setSelectedKeys(keys)}
 * />
 * ```
 *
 * @example With search and custom titles
 * ```tsx
 * <Transfer
 *   dataSource={dataSource}
 *   targetKeys={targetKeys}
 *   titles={['Available', 'Selected']}
 *   showSearch
 *   filterOption={(input, item) =>
 *     item.title.toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * ```
 *
 * @example One-way transfer
 * ```tsx
 * <Transfer
 *   dataSource={dataSource}
 *   targetKeys={targetKeys}
 *   oneWay
 *   operations={['Add →']}
 * />
 * ```
 *
 * @example With pagination
 * ```tsx
 * <Transfer
 *   dataSource={largeDataset}
 *   targetKeys={targetKeys}
 *   pagination={{ pageSize: 10 }}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <Transfer engine="titan" dataSource={data} showSearch />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <Transfer engine="hermes" dataSource={data} />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <Transfer engine="apollo" dataSource={data} />
 * ```
 *
 * @see {@link TransferProps} for component props
 * @see {@link TransferItem} for item structure
 * @module Transfer
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { TransferProps } from './types';

// Export types
export {
  type TransferProps,
  type TransferItem,
  TRANSFER_DEFAULTS,
} from './types';

/**
 * Create engine-aware Transfer component.
 *
 * The Transfer component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
 */
export const Transfer = createEngineComponent<TransferProps>('Transfer', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Transfer;
