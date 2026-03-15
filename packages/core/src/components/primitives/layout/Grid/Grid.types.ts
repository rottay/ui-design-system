/**
 * @fileoverview Grid Types - Rottay Design System
 * @description Type definitions for the Grid layout component and its compound Grid.Item.
 * Provides comprehensive typing for CSS Grid properties and responsive configurations.
 *
 * @remarks
 * The Grid component uses CSS Grid under the hood, exposing a declarative API
 * that simplifies common grid patterns. The type system supports:
 * - **Responsive values**: Breakpoint-based column/row configurations
 * - **Gap presets**: Design token-based spacing values
 * - **Item positioning**: Span, start/end lines, and named areas
 * - **Alignment**: Both grid container and item-level alignment
 *
 * @example Type Usage
 * ```tsx
 * import type { GridProps, GridItemProps, ResponsiveValue } from '@rottay/design-system';
 *
 * // Create responsive column config
 * const columns: ResponsiveValue<number> = { xs: 1, sm: 2, md: 3, lg: 4 };
 *
 * // Type-safe grid item props
 * const itemProps: GridItemProps = {
 *   span: 2,
 *   rowSpan: 1,
 *   area: 'header'
 * };
 * ```
 *
 * @see {@link Grid} - The main Grid component
 * @see {@link GridItem} - The Grid.Item compound component
 * @module Grid/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type React from 'react';
import type { EngineAwareProps, WithChildrenProps, BaseComponentProps } from '../../../../contracts';

/**
 * Responsive breakpoint object for grid properties
 */
export interface ResponsiveValue<T> {
  /** Extra small screens (mobile) */
  xs?: T;
  /** Small screens (small tablets) */
  sm?: T;
  /** Medium screens (tablets) */
  md?: T;
  /** Large screens (desktops) */
  lg?: T;
  /** Extra large screens (large desktops) */
  xl?: T;
  /** 2x Extra large screens */
  '2xl'?: T;
}

/**
 * Number of columns or rows in the grid
 */
export type GridColumnsValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'none';

/**
 * Grid columns prop type - can be a number, 'auto', or responsive object
 */
export type GridColumns = GridColumnsValue | ResponsiveValue<GridColumnsValue>;

/**
 * Grid rows prop type
 */
export type GridRows = GridColumnsValue | ResponsiveValue<GridColumnsValue>;

/**
 * Gap/spacing preset values
 */
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * Gap prop type - can be a preset or number (pixels)
 */
export type GridGapValue = GridGap | number;

/**
 * Auto flow values for grid-auto-flow property
 */
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

/**
 * Alignment values for items within the grid
 */
export type GridAlignItems = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

/**
 * Justification values for items within the grid
 */
export type GridJustifyItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Content alignment values
 */
export type GridAlignContent = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * Content justification values
 */
export type GridJustifyContent = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * Place items shorthand values
 */
export type GridPlaceItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Props for the Grid component.
 * A CSS Grid layout container with comprehensive responsive support.
 *
 * @example
 * ```tsx
 * // Basic grid with 3 columns
 * <Grid columns={3} gap="md">
 *   <Grid.Item>Item 1</Grid.Item>
 *   <Grid.Item>Item 2</Grid.Item>
 *   <Grid.Item>Item 3</Grid.Item>
 * </Grid>
 *
 * // Responsive columns
 * <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
 *   <Grid.Item span={2}>Wide Item</Grid.Item>
 *   <Grid.Item>Regular Item</Grid.Item>
 * </Grid>
 *
 * // Custom template
 * <Grid templateColumns="200px 1fr 200px" templateRows="auto 1fr auto">
 *   <Grid.Item colSpan={3}>Header</Grid.Item>
 *   <Grid.Item>Sidebar</Grid.Item>
 *   <Grid.Item>Main</Grid.Item>
 *   <Grid.Item>Right</Grid.Item>
 *   <Grid.Item colSpan={3}>Footer</Grid.Item>
 * </Grid>
 * ```
 */
export interface GridProps extends EngineAwareProps, WithChildrenProps, BaseComponentProps {
  /**
   * Number of columns in the grid
   * Can be a number (1-12), 'auto', or a responsive object
   * @default 12
   */
  columns?: GridColumns;

  /**
   * Number of rows in the grid
   * Can be a number, 'auto', or a responsive object
   */
  rows?: GridRows;

  /**
   * Gap between grid items (both row and column)
   * Can be a preset ('xs', 'sm', 'md', 'lg', 'xl', '2xl') or a number (pixels)
   * @default 'md'
   */
  gap?: GridGapValue;

  /**
   * Shorthand for gap
   */
  spacing?: GridGapValue;

  /**
   * Gap between columns
   * Overrides the column portion of 'gap' when specified
   */
  columnGap?: GridGapValue;

  /**
   * Gap between rows
   * Overrides the row portion of 'gap' when specified
   */
  rowGap?: GridGapValue;

  /**
   * CSS grid-template-columns value
   * Use this for advanced column configurations
   * @example "200px 1fr 200px", "repeat(auto-fit, minmax(200px, 1fr))"
   */
  templateColumns?: string;

  /**
   * CSS grid-template-rows value
   * Use this for advanced row configurations
   * @example "auto 1fr auto", "100px repeat(3, 1fr) 100px"
   */
  templateRows?: string;

  /**
   * CSS grid-template-areas value
   * Define named grid areas
   * @example "'header header' 'sidebar main' 'footer footer'"
   */
  templateAreas?: string;

  /**
   * CSS grid-auto-flow value
   * Controls how auto-placed items are inserted
   * @default 'row'
   */
  autoFlow?: GridAutoFlow;

  /**
   * CSS grid-auto-columns value
   * Size of implicitly created columns
   */
  autoColumns?: string;

  /**
   * CSS grid-auto-rows value
   * Size of implicitly created rows
   */
  autoRows?: string;

  /**
   * CSS align-items property
   * Aligns items along the block (column) axis
   */
  alignItems?: GridAlignItems;

  /**
   * CSS justify-items property
   * Aligns items along the inline (row) axis
   */
  justifyItems?: GridJustifyItems;

  /**
   * CSS place-items shorthand
   * Sets both align-items and justify-items
   */
  placeItems?: GridPlaceItems;

  /**
   * CSS align-content property
   * Aligns the grid along the block axis when there's extra space
   */
  alignContent?: GridAlignContent;

  /**
   * CSS justify-content property
   * Aligns the grid along the inline axis when there's extra space
   */
  justifyContent?: GridJustifyContent;

  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType;

  /**
   * Width of the grid container
   */
  width?: React.CSSProperties['width'];

  /**
   * Height of the grid container
   */
  height?: React.CSSProperties['height'];

  /**
   * Minimum height of the grid container
   */
  minHeight?: React.CSSProperties['minHeight'];

  /**
   * Maximum width of the grid container
   */
  maxWidth?: React.CSSProperties['maxWidth'];

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Whether the grid should be inline
   * @default false
   */
  inline?: boolean;
}

/**
 * Props for the Grid.Item compound component.
 * Represents an item within a Grid container.
 *
 * @example
 * ```tsx
 * // Basic item spanning 2 columns
 * <Grid.Item span={2}>Content</Grid.Item>
 *
 * // Item with specific positioning
 * <Grid.Item colStart={1} colEnd={3} rowStart={1} rowEnd={2}>
 *   Header
 * </Grid.Item>
 *
 * // Named grid area
 * <Grid.Item area="sidebar">Sidebar Content</Grid.Item>
 * ```
 */
export interface GridItemProps extends WithChildrenProps, BaseComponentProps {
  /**
   * Number of columns to span (shorthand for colSpan)
   */
  span?: number;

  /**
   * Number of columns to span
   */
  colSpan?: number;

  /**
   * Number of rows to span
   */
  rowSpan?: number;

  /**
   * Starting column line
   */
  colStart?: number | 'auto';

  /**
   * Ending column line
   */
  colEnd?: number | 'auto';

  /**
   * Starting row line
   */
  rowStart?: number | 'auto';

  /**
   * Ending row line
   */
  rowEnd?: number | 'auto';

  /**
   * Grid area name (when using template-areas)
   */
  area?: string;

  /**
   * CSS align-self property
   * Aligns this item along the block axis
   */
  alignSelf?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';

  /**
   * CSS justify-self property
   * Aligns this item along the inline axis
   */
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';

  /**
   * CSS place-self shorthand
   */
  placeSelf?: 'start' | 'end' | 'center' | 'stretch';

  /**
   * Z-index for stacking context
   */
  zIndex?: number;

  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Default values for Grid props
 */
export const GRID_DEFAULTS: Partial<GridProps> = {
  columns: 12,
  gap: 'md',
  autoFlow: 'row',
  as: 'div',
  inline: false,
};

/**
 * Default values for GridItem props
 */
export const GRID_ITEM_DEFAULTS: Partial<GridItemProps> = {
  as: 'div',
};

/**
 * Gap value mapping (matches design tokens)
 */
export const GAP_MAP: Record<GridGap, string> = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

/**
 * CSS align-items value mapping
 */
export const ALIGN_ITEMS_MAP: Record<GridAlignItems, string> = {
  start: 'start',
  end: 'end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
};

/**
 * CSS justify-items value mapping
 */
export const JUSTIFY_ITEMS_MAP: Record<GridJustifyItems, string> = {
  start: 'start',
  end: 'end',
  center: 'center',
  stretch: 'stretch',
};
