'use client';

/**
 * @fileoverview Flex Component - Rottay Design System
 * @description A flexible box layout container that provides fine-grained control
 * over flexbox properties including direction, alignment, justification, wrapping,
 * and gap spacing. Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Flex component exposes the full power of CSS Flexbox through a declarative
 * props-based API. Unlike the higher-level Stack component which abstracts away
 * flexbox details, Flex provides direct access to all flexbox properties using
 * familiar CSS terminology.
 *
 * Key differences from Stack:
 * - **Flex**: Uses CSS flexbox terminology (row, column, justify-content, align-items)
 * - **Stack**: Uses semantic terminology (horizontal, vertical, spacing, dividers)
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Uses Ant Design's Flex component for consistent styling
 * - **Hermes**: Generates Tailwind CSS utility classes (flex, flex-row, justify-*, items-*)
 * - **Apollo**: Pure inline CSS with no external dependencies
 *
 * @example Basic Horizontal Layout
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * <Flex gap={8}>
 *   <Button>First</Button>
 *   <Button>Second</Button>
 *   <Button>Third</Button>
 * </Flex>
 * ```
 *
 * @example Vertical Column Layout
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * <Flex direction="column" gap={16}>
 *   <Input placeholder="Email" />
 *   <Input placeholder="Password" />
 *   <Button type="submit">Login</Button>
 * </Flex>
 * ```
 *
 * @example Centered Content
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Perfect centering (horizontal and vertical)
 * <Flex
 *   direction="column"
 *   align="center"
 *   justify="center"
 *   style={{ height: '100vh' }}
 * >
 *   <Logo />
 *   <h1>Welcome</h1>
 * </Flex>
 * ```
 *
 * @example Space Distribution
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Header with space-between
 * <Flex justify="between" align="center">
 *   <Logo />
 *   <Navigation />
 *   <UserMenu />
 * </Flex>
 *
 * // Footer with evenly distributed items
 * <Flex justify="evenly">
 *   <Link>About</Link>
 *   <Link>Contact</Link>
 *   <Link>Privacy</Link>
 * </Flex>
 * ```
 *
 * @example Wrapping Grid-like Layout
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Cards that wrap to next row
 * <Flex wrap="wrap" gap={[16, 24]}>
 *   {items.map(item => (
 *     <Card key={item.id} style={{ width: '300px' }}>
 *       {item.content}
 *     </Card>
 *   ))}
 * </Flex>
 * ```
 *
 * @example Inline Flex
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * <p>
 *   Click here to
 *   <Flex inline align="center" gap={4}>
 *     <Icon name="download" />
 *     <span>download</span>
 *   </Flex>
 *   the file.
 * </p>
 * ```
 *
 * @example Using with Engine Override
 * ```tsx
 * import { Flex } from '@rottay/design-system';
 *
 * // Force Hermes engine for Tailwind classes
 * <Flex engine="hermes" justify="between" align="center">
 *   Outputs: class="flex justify-between items-center"
 * </Flex>
 * ```
 *
 * @see {@link Stack} - Higher-level abstraction for common stacking patterns
 * @see {@link Grid} - For two-dimensional CSS Grid layouts
 * @see {@link Box} - For basic container layouts
 *
 * @module Flex
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { FlexProps } from './types';

// ============================================================================
// TYPE AND CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export all Flex-related types and constants for external consumption.
 */
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

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Flex component with automatic engine resolution.
 *
 * Provides a flexible box layout container with full control over
 * flexbox properties: direction, wrap, justify-content, align-items, and gap.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Titan)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Flex gap={8} justify="center">
 *   <Item />
 *   <Item />
 * </Flex>
 *
 * // With engine override
 * <Flex engine="hermes" direction="column" gap={16}>
 *   Uses Tailwind classes
 * </Flex>
 * ```
 */
export const Flex = createEngineComponent<FlexProps>('Flex', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Flex;
