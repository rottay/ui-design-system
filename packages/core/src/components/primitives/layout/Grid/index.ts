'use client';

/**
 * @fileoverview Grid Component - Rottay Design System
 * @description A powerful CSS Grid layout component with responsive column support,
 * gap presets, and comprehensive grid item positioning capabilities.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The Grid component provides a declarative API for CSS Grid layouts, supporting:
 * - Responsive column configurations via breakpoint objects
 * - Design token-based gap values for consistent spacing
 * - Grid item spanning and positioning with the Grid.Item compound component
 * - Template areas for complex named-region layouts
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Classic**: Full-featured implementation using Ant Design patterns
 * - **Modern**: Utility-first implementation using Tailwind grid classes
 * - **Rustic**: Pure HTML/CSS implementation with inline grid styles
 *
 * @example Basic Grid
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * <Grid columns={3} gap="md">
 *   <Grid.Item>Item 1</Grid.Item>
 *   <Grid.Item>Item 2</Grid.Item>
 *   <Grid.Item>Item 3</Grid.Item>
 * </Grid>
 * ```
 *
 * @example Responsive Columns
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Columns adjust based on screen size
 * <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
 *   {products.map(product => (
 *     <Grid.Item key={product.id}>
 *       <ProductCard product={product} />
 *     </Grid.Item>
 *   ))}
 * </Grid>
 * ```
 *
 * @example Item Spanning
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * <Grid columns={4} gap="md">
 *   <Grid.Item span={2}>Wide item (spans 2 columns)</Grid.Item>
 *   <Grid.Item>Regular item</Grid.Item>
 *   <Grid.Item>Regular item</Grid.Item>
 *   <Grid.Item rowSpan={2}>Tall item (spans 2 rows)</Grid.Item>
 *   <Grid.Item colSpan={3}>Bottom row spanning 3 columns</Grid.Item>
 * </Grid>
 * ```
 *
 * @example Template Areas
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * <Grid
 *   templateColumns="200px 1fr 200px"
 *   templateRows="auto 1fr auto"
 *   templateAreas="'header header header' 'sidebar main aside' 'footer footer footer'"
 *   gap="md"
 *   minHeight="100vh"
 * >
 *   <Grid.Item area="header">Header</Grid.Item>
 *   <Grid.Item area="sidebar">Sidebar</Grid.Item>
 *   <Grid.Item area="main">Main Content</Grid.Item>
 *   <Grid.Item area="aside">Aside</Grid.Item>
 *   <Grid.Item area="footer">Footer</Grid.Item>
 * </Grid>
 * ```
 *
 * @example Auto-fit with Minimum Width
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Cards automatically wrap and fill available space
 * <Grid
 *   templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
 *   gap="lg"
 * >
 *   {cards.map(card => (
 *     <Card key={card.id}>{card.content}</Card>
 *   ))}
 * </Grid>
 * ```
 *
 * @example Using with Engine Override
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Force Modern engine for Tailwind grid classes
 * <Grid engine="modern" columns={3} gap="md">
 *   Outputs: class="grid grid-cols-3 gap-4"
 * </Grid>
 * ```
 *
 * @see {@link Box} - For basic container layouts
 * @see {@link Stack} - For one-dimensional flexbox layouts
 * @see {@link Flex} - For advanced flexbox control
 * @see {@link Container} - For max-width centered containers
 *
 * @module Grid
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { GridProps } from './types';
import { GridItem } from './compound';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Re-export all Grid-related types for external consumption.
 * These types enable strong typing when using the Grid component.
 */
export type {
  GridProps,
  GridItemProps,
  GridColumns,
  GridColumnsValue,
  GridRows,
  GridGap,
  GridGapValue,
  GridAutoFlow,
  GridAlignItems,
  GridJustifyItems,
  GridAlignContent,
  GridJustifyContent,
  GridPlaceItems,
  ResponsiveValue,
} from './types';

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

/**
 * Re-export default values and mapping constants.
 * Useful for building custom components that extend Grid behavior.
 */
export {
  GRID_DEFAULTS,
  GRID_ITEM_DEFAULTS,
  GAP_MAP,
  ALIGN_ITEMS_MAP,
  JUSTIFY_ITEMS_MAP,
} from './types';

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

/**
 * Re-export GridItem compound component.
 * Use Grid.Item for positioning items within the grid.
 */
export { GridItem };

// ============================================================================
// BASE COMPONENT EXPORTS
// ============================================================================

/**
 * Re-export base components for custom extensions.
 */

// ============================================================================
// ENGINE-AWARE COMPONENT
// ============================================================================

/**
 * The main Grid component with automatic engine resolution.
 *
 * Includes the Grid.Item compound component for positioning items.
 *
 * The engine is determined in this order:
 * 1. `engine` prop passed directly to the component
 * 2. Nearest `EngineProvider` in the component tree
 * 3. Default engine (Classic)
 *
 * @example
 * ```tsx
 * // Uses default engine (Classic)
 * <Grid columns={3} gap="md">
 *   <Grid.Item>...</Grid.Item>
 * </Grid>
 *
 * // Override with specific engine
 * <Grid engine="modern" columns={4}>
 *   <Grid.Item span={2}>...</Grid.Item>
 * </Grid>
 * ```
 */
export const Grid = Object.assign(
  createEngineComponent<GridProps>('Grid', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Grid.Item compound component for positioning items within the grid */
    Item: GridItem,
  }
);
