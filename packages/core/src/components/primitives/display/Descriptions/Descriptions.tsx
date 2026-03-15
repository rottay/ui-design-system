'use client';

/**
 * @fileoverview Descriptions Component - Rottay Design System
 * @description Key-value pair display with grid layout and bordered variants.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Descriptions component displays structured key-value information
 * with configurable columns, layout directions, and styling options.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Descriptions with responsive columns
 * - **Modern**: DaisyUI-styled descriptions with Tailwind utilities
 * - **Rustic**: Pure HTML/CSS with semantic list markup
 *
 * **Key Features:**
 * - Multi-column grid layout
 * - Horizontal and vertical layouts
 * - Bordered and borderless variants
 * - Size variants (small, default, middle)
 * - Responsive column configuration
 * - Colon customization
 * - Title and extra header sections
 * - Span support for wide items
 *
 * **Compound Components:**
 * - `Descriptions.Item` - Individual key-value entry
 *
 * **CSS Custom Properties:**
 * - `--descriptions-font-size` - Base font size
 * - `--descriptions-padding` - Container padding
 * - `--descriptions-border-color` - Border color
 * - `--descriptions-label-color` - Label text color
 * - `--descriptions-content-color` - Content text color
 * - `--descriptions-title-color` - Title color
 * - `--descriptions-bg` - Background color
 *
 * @example Basic Usage
 * ```tsx
 * import { Descriptions } from '@rottay/design-system';
 *
 * <Descriptions title="User Info">
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 *   <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
 * </Descriptions>
 * ```
 *
 * @example Multi-Column Bordered
 * ```tsx
 * <Descriptions title="Product Details" column={2} bordered>
 *   <Descriptions.Item label="Name">Widget Pro</Descriptions.Item>
 *   <Descriptions.Item label="Price">$99.99</Descriptions.Item>
 *   <Descriptions.Item label="Description" span={2}>
 *     A premium widget for all your needs
 *   </Descriptions.Item>
 * </Descriptions>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Descriptions engine="modern" bordered>
 *   <Descriptions.Item label="Status">Active</Descriptions.Item>
 * </Descriptions>
 * ```
 *
 * @see {@link DescriptionsProps} for component props
 * @see {@link DescriptionsItemProps} for item props
 * @module Descriptions
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { DescriptionsProps, DescriptionsItemProps } from './Descriptions.types';
import { DescriptionsItem } from './compound';

// Re-export types
export type {
  DescriptionsProps,
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from './Descriptions.types';

// Re-export defaults
export { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from './Descriptions.types';

// Re-export compound components
export { DescriptionsItem };

// Re-export base component

/**
 * Engine-aware Descriptions component.
 * Automatically routes to the appropriate engine implementation based on
 * the EngineProvider context or explicit engine prop.
 */
const DescriptionsBase = createEngineComponent<DescriptionsProps>('Descriptions', {
  classic: () => import('./engines/classic').then((m) => ({ default: m.Descriptions })),
  modern: () => import('./engines/modern').then((m) => ({ default: m.Descriptions })),
  rustic: () => import('./engines/rustic').then((m) => ({ default: m.Descriptions })),
});

/**
 * Engine-aware Descriptions.Item component.
 * Automatically routes to the appropriate engine implementation.
 */
const Item = createEngineComponent<DescriptionsItemProps>('Descriptions.Item', {
  classic: () => import('./engines/classic').then((m) => ({ default: m.Item })),
  modern: () => import('./engines/modern').then((m) => ({ default: m.Item })),
  rustic: () => import('./engines/rustic').then((m) => ({ default: m.Item })),
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
