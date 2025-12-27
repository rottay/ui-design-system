/**
 * Flex - Engine Router
 *
 * This module exports the Flex component with multi-engine support.
 * The Flex component provides a flexible box layout container
 * across Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) engines.
 *
 * @module Flex
 * @example
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Basic horizontal layout
 * <Flex gap={8}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 *
 * // Vertical layout with centering
 * <Flex direction="column" align="center" justify="center">
 *   <div>Centered content</div>
 * </Flex>
 *
 * // Responsive wrap layout
 * <Flex wrap="wrap" gap={16}>
 *   <div>Wrappable item</div>
 * </Flex>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { FlexProps } from './types';

// Export types
export {
  type FlexProps,
  type FlexDirection,
  type FlexWrap,
  type FlexJustify,
  type FlexAlign,
  FLEX_DEFAULTS,
  FLEX_JUSTIFY_MAP,
  FLEX_ALIGN_MAP,
} from './types';

/**
 * Flex component with multi-engine support.
 *
 * A flexible box layout container that provides control over direction,
 * alignment, justification, wrapping, and spacing of child elements.
 *
 * @param props - Flex component props
 * @returns React element
 */
export const Flex = createEngineComponent<FlexProps>('Flex', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Flex;
