'use client';

/**
 * @fileoverview Empty Component - Rottay Design System
 * @description Empty state placeholder with customizable image and description.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Empty component displays a placeholder when there is no data available.
 * It supports multiple image variants and custom content.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Empty with built-in image presets
 * - **Modern**: DaisyUI-styled empty with theme-aware colors
 * - **Rustic**: Pure HTML/CSS with maximum accessibility
 *
 * **Key Features:**
 * - Default and simple image variants
 * - Custom image support (React nodes)
 * - Description text with localization support
 * - Action button slot for CTAs
 * - ARIA-compliant accessibility
 * - CSS custom properties for theming
 *
 * **CSS Custom Properties:**
 * - `--empty-padding` - Container padding
 * - `--empty-text-color` - Description text color
 * - `--empty-font-size` - Description font size
 * - `--empty-image-margin-bottom` - Image spacing
 * - `--empty-image-fill-color` - SVG fill color
 * - `--empty-image-stroke-color` - SVG stroke color
 *
 * @example Basic Usage
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * <Empty />
 * ```
 *
 * @example Custom Description
 * ```tsx
 * <Empty description="No results found" />
 * ```
 *
 * @example Simple Image Variant
 * ```tsx
 * <Empty image="simple" description="Nothing to display" />
 * ```
 *
 * @example With Action Button
 * ```tsx
 * <Empty description="Your cart is empty">
 *   <Button>Start Shopping</Button>
 * </Empty>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Empty engine="rustic" description="Custom engine" />
 * ```
 *
 * @see {@link EmptyProps} for component props
 * @see {@link BaseEmpty} for base implementation
 * @module Empty
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { EmptyProps } from './Empty.types';

// Export types
export type { EmptyProps, EmptyImageType } from './Empty.types';
export { EMPTY_DEFAULTS } from './Empty.types';

// Export base component for direct use or extension

/**
 * Empty component with engine awareness.
 *
 * Automatically selects the appropriate rendering engine based on:
 * 1. The `engine` prop passed directly to the component
 * 2. The nearest EngineProvider context
 * 3. The default engine (Classic)
 *
 * Each engine provides a different implementation:
 * - **Classic**: Ant Design Empty component
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure HTML/CSS implementation
 */
export const Empty = createEngineComponent<EmptyProps>('Empty', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Empty;
