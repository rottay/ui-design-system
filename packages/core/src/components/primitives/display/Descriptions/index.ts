/**
 * @file Descriptions - Engine Router
 * @description Main entry point for the Descriptions component.
 * Provides engine-aware component creation with automatic routing
 * based on the current EngineProvider context.
 *
 * @example
 * ```tsx
 * import { Descriptions } from '@es-rottay/designsystem-core';
 *
 * // Basic usage
 * <Descriptions title="User Info">
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 *   <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
 * </Descriptions>
 *
 * // With engine override
 * <Descriptions engine="hermes" bordered>
 *   <Descriptions.Item label="Status">Active</Descriptions.Item>
 * </Descriptions>
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DescriptionsProps, DescriptionsItemProps } from './types';
import { DescriptionsItem } from './compound';

// Re-export types
export type {
  DescriptionsProps,
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from './types';

// Re-export defaults
export { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from './types';

// Re-export compound components
export { DescriptionsItem };

// Re-export base component
export { BaseDescriptions, BaseDescriptionsItem } from './base';

/**
 * Engine-aware Descriptions component.
 * Automatically routes to the appropriate engine implementation based on
 * the EngineProvider context or explicit engine prop.
 */
const DescriptionsBase = createEngineComponent<DescriptionsProps>('Descriptions', {
  titan: () => import('./engines/titan').then((m) => ({ default: m.Descriptions })),
  hermes: () => import('./engines/hermes').then((m) => ({ default: m.Descriptions })),
  apollo: () => import('./engines/apollo').then((m) => ({ default: m.Descriptions })),
});

/**
 * Engine-aware Descriptions.Item component.
 * Automatically routes to the appropriate engine implementation.
 */
const Item = createEngineComponent<DescriptionsItemProps>('Descriptions.Item', {
  titan: () => import('./engines/titan').then((m) => ({ default: m.Item })),
  hermes: () => import('./engines/hermes').then((m) => ({ default: m.Item })),
  apollo: () => import('./engines/apollo').then((m) => ({ default: m.Item })),
});

/**
 * Descriptions component with compound Item subcomponent.
 *
 * @example
 * ```tsx
 * <Descriptions title="Product Details" column={2} bordered>
 *   <Descriptions.Item label="Name">Widget Pro</Descriptions.Item>
 *   <Descriptions.Item label="Price">$99.99</Descriptions.Item>
 *   <Descriptions.Item label="Stock">In Stock</Descriptions.Item>
 *   <Descriptions.Item label="Category" span={2}>Electronics</Descriptions.Item>
 * </Descriptions>
 * ```
 */
export const Descriptions = Object.assign(DescriptionsBase, {
  /** Item subcomponent for individual description entries */
  Item,
});

export default Descriptions;
