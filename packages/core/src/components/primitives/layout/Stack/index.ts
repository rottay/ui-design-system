'use client';

/**
 * @fileoverview Stack Component - Rottay Design System
 * @description A layout primitive for stacking elements vertically or horizontally
 * with configurable spacing, alignment, and optional dividers.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Stack component provides a flexbox-based layout system for arranging
 * child elements in a single direction. It's the go-to component for:
 * - Vertical lists and forms
 * - Horizontal button groups
 * - Navigation menus
 * - Any linear arrangement of elements
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Full-featured implementation using Ant Design patterns
 * - **Modern**: Utility-first implementation using Tailwind flex classes
 * - **Rustic**: Pure HTML/CSS implementation with inline flexbox styles
 *
 * @example Basic Vertical Stack
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * <Stack spacing="md">
 *   <Card>First item</Card>
 *   <Card>Second item</Card>
 *   <Card>Third item</Card>
 * </Stack>
 * ```
 *
 * @example Horizontal Stack
 * ```tsx
 * import { Stack, Button } from '@rottay/design-system';
 *
 * <Stack direction="horizontal" spacing="sm" align="center">
 *   <Button>Cancel</Button>
 *   <Button variant="primary">Submit</Button>
 * </Stack>
 * ```
 *
 * @example Stack with Dividers
 * ```tsx
 * import { Stack, Divider } from '@rottay/design-system';
 *
 * // Automatic dividers between items
 * <Stack spacing="lg" divider={true}>
 *   <Section>Section 1</Section>
 *   <Section>Section 2</Section>
 *   <Section>Section 3</Section>
 * </Stack>
 *
 * // Custom divider element
 * <Stack spacing="md" divider={<Divider dashed />}>
 *   <Item>Item A</Item>
 *   <Item>Item B</Item>
 * </Stack>
 * ```
 *
 * @example Alignment and Justification
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Center items with space between
 * <Stack
 *   direction="horizontal"
 *   align="center"
 *   justify="space-between"
 *   fullWidth
 * >
 *   <Logo />
 *   <Navigation />
 *   <UserMenu />
 * </Stack>
 * ```
 *
 * @example Responsive Wrapping
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Allow items to wrap on narrow screens
 * <Stack direction="horizontal" spacing="sm" wrap>
 *   {tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>)}
 * </Stack>
 * ```
 *
 * @example Reversed Order
 * ```tsx
 * import { Stack } from '@rottay/design-system';
 *
 * // Reverse the visual order
 * <Stack direction="vertical" reverse>
 *   <Message time="10:00">First</Message>
 *   <Message time="10:05">Second</Message>
 *   <Message time="10:10">Third (appears first)</Message>
 * </Stack>
 * ```
 *
 * @see {@link Box} - For basic container layouts
 * @see {@link Grid} - For two-dimensional layouts
 * @see {@link Flex} - For more advanced flexbox control
 * @see {@link Divider} - For visual separators
 *
 * @module Stack
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { StackProps } from './Stack.types';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Re-export all Stack-related types for external consumption.
 * These types enable strong typing when using the Stack component.
 */
export type {
  StackProps,
  StackDirection,
  StackAlign,
  StackJustify,
  StackSpacing,
  StackSpacingPreset,
} from './Stack.types';

export type { ResponsiveValue } from '../shared/types';

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export default values and mapping constants.
 * Useful for building custom components that extend Stack behavior.
 */
export {
  STACK_DEFAULTS,
  SPACING_MAP,
  ALIGN_MAP,
  JUSTIFY_MAP,
  resolveSpacing,
} from './Stack.types';

// ============================================================================
// NOTE ON UTILITY FUNCTIONS
// ============================================================================

// Utility functions (buildStackStyles, renderStackChildren, resolveSpacing)
// are implemented within each engine file to allow engine-specific optimizations.
// The resolveSpacing function is exported from './Stack.types' for external use.

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Stack component with automatic engine resolution.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Classic)
 *
 * @example
 * ```tsx
 * // Uses default engine (Classic)
 * <Stack spacing="md">...</Stack>
 *
 * // Override with specific engine
 * <Stack engine="modern" spacing="md">...</Stack>
 *
 * // Or wrap with EngineProvider
 * <EngineProvider engine="rustic">
 *   <Stack spacing="md">...</Stack>
 * </EngineProvider>
 * ```
 */
export const Stack = createEngineComponent<StackProps>('Stack', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
