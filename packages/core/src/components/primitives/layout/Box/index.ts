'use client';

/**
 * @fileoverview Box Component - Rottay Design System
 * @description A fundamental layout primitive that provides a styled container
 * with configurable spacing, borders, shadows, and other CSS layout properties.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Box component serves as the most basic building block for layout composition.
 * It abstracts common CSS properties into a declarative API with shorthand props
 * (like `p`, `m`, `bg`, `rounded`) for rapid prototyping and consistent styling.
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Full-featured implementation using Ant Design patterns
 * - **Hermes**: Utility-first implementation using DaisyUI/Tailwind classes
 * - **Apollo**: Pure HTML/CSS implementation for maximum compatibility
 *
 * All engines produce visually consistent output while leveraging their
 * respective styling paradigms.
 *
 * @example Basic Usage
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Simple container with padding
 * <Box padding="md" bg="#f5f5f5">
 *   <p>Content inside a padded box</p>
 * </Box>
 *
 * // Using shorthand props
 * <Box p="lg" m="sm" rounded="md" shadow="sm">
 *   Compact syntax for common properties
 * </Box>
 * ```
 *
 * @example Card-like Container
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * <Box
 *   padding="xl"
 *   backgroundColor="white"
 *   borderRadius="lg"
 *   shadow="md"
 *   border="1px solid #e5e7eb"
 * >
 *   <h2>Card Title</h2>
 *   <p>Card content with elevation and rounded corners</p>
 * </Box>
 * ```
 *
 * @example Responsive Spacing
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Padding on specific sides
 * <Box
 *   pt="sm"      // padding-top
 *   pb="lg"      // padding-bottom
 *   px="md"      // horizontal padding (left + right)
 *   my="xl"      // vertical margin (top + bottom)
 * >
 *   Different spacing on each axis
 * </Box>
 * ```
 *
 * @example Polymorphic Element
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Render as different HTML elements
 * <Box as="section" p="lg">Section content</Box>
 * <Box as="article" p="md">Article content</Box>
 * <Box as="nav" p="sm">Navigation links</Box>
 * ```
 *
 * @example Using with Engine Override
 * ```tsx
 * import { Box } from '@rottay/design-system';
 *
 * // Force Hermes engine for Tailwind classes
 * <Box engine="hermes" p="md" rounded="lg">
 *   Uses Tailwind utility classes
 * </Box>
 * ```
 *
 * @see {@link Stack} - For vertical/horizontal stacking layouts
 * @see {@link Grid} - For CSS Grid layouts
 * @see {@link Flex} - For flexbox layouts
 * @see {@link Container} - For max-width centered containers
 *
 * @module Box
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { BoxProps } from './types';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Re-export all Box-related types for external consumption.
 * These types enable strong typing when using the Box component.
 */
export type {
  BoxProps,
  BoxSpacing,
  BoxBorderRadius,
  BoxShadow,
  BoxDisplay,
  BoxPosition,
  BoxOverflow,
} from './types';

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export default values and mapping constants.
 * Useful for building custom components that extend Box behavior.
 */
export { BOX_DEFAULTS, SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from './types';

// ============================================================================
// BASE COMPONENT EXPORTS
// ============================================================================

/**
 * Re-export base component and utility functions.
 * These can be used to create custom Box variants or extend functionality.
 */

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Box component with automatic engine resolution.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Titan)
 *
 * @example
 * ```tsx
 * // Uses default engine (Titan)
 * <Box p="md">Default engine</Box>
 *
 * // Override with specific engine
 * <Box engine="hermes" p="md">Hermes engine</Box>
 *
 * // Or wrap with EngineProvider
 * <EngineProvider engine="apollo">
 *   <Box p="md">Apollo engine</Box>
 * </EngineProvider>
 * ```
 */
export const Box = createEngineComponent<BoxProps>('Box', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
