/**
 * Empty Component - Engine Router
 *
 * This is the main entry point for the Empty component. It uses the
 * engine factory to create a component that dynamically loads the
 * appropriate engine implementation (Titan, Hermes, or Apollo) based
 * on the current engine context or prop override.
 *
 * The Empty component displays a placeholder with an optional image
 * and description when there is no data to show.
 *
 * @module Empty
 * @category Display
 *
 * @example
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * // Basic usage
 * <Empty />
 *
 * // With custom description
 * <Empty description="No results found" />
 *
 * // With simple image variant
 * <Empty image="simple" description="Nothing to display" />
 *
 * // With action button
 * <Empty description="Your cart is empty">
 *   <Button>Start Shopping</Button>
 * </Empty>
 *
 * // With engine override
 * <Empty engine="apollo" description="Custom engine" />
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { EmptyProps } from './types';

// Export types
export type { EmptyProps, EmptyImageType } from './types';
export { EMPTY_DEFAULTS } from './types';

// Export base component for direct use or extension
export { BaseEmpty, DefaultImage, SimpleImage } from './base';

/**
 * Empty component with engine awareness.
 *
 * Automatically selects the appropriate rendering engine based on:
 * 1. The `engine` prop passed directly to the component
 * 2. The nearest EngineProvider context
 * 3. The default engine (Titan)
 *
 * Each engine provides a different implementation:
 * - **Titan**: Ant Design Empty component
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure HTML/CSS implementation
 */
export const Empty = createEngineComponent<EmptyProps>('Empty', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Empty;
