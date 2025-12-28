/**
 * @fileoverview Grid Compound Components - Rottay Design System
 * @description Compound component exports for the Grid component.
 * Provides Grid.Item for positioning and spanning items within the grid.
 *
 * @remarks
 * The GridItem component is used within a Grid container to control
 * the positioning and sizing of individual grid items. It supports:
 * - Column/row spanning with `span`, `colSpan`, `rowSpan`
 * - Explicit positioning with `colStart`, `colEnd`, `rowStart`, `rowEnd`
 * - Named grid areas with `area`
 * - Self-alignment with `alignSelf`, `justifySelf`, `placeSelf`
 *
 * @example Basic Usage
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * <Grid columns={3} gap="md">
 *   <Grid.Item span={2}>Spans 2 columns</Grid.Item>
 *   <Grid.Item>Regular item</Grid.Item>
 *   <Grid.Item rowSpan={2}>Spans 2 rows</Grid.Item>
 * </Grid>
 * ```
 *
 * @example Explicit Positioning
 * ```tsx
 * <Grid columns={4} gap="md">
 *   <Grid.Item colStart={1} colEnd={3}>Columns 1-2</Grid.Item>
 *   <Grid.Item colStart={3} rowStart={1} rowEnd={3}>
 *     Rows 1-2, Column 3
 *   </Grid.Item>
 * </Grid>
 * ```
 *
 * @example Named Areas
 * ```tsx
 * <Grid templateAreas="'header header' 'sidebar main'" gap="md">
 *   <Grid.Item area="header">Header</Grid.Item>
 *   <Grid.Item area="sidebar">Sidebar</Grid.Item>
 *   <Grid.Item area="main">Main Content</Grid.Item>
 * </Grid>
 * ```
 *
 * @see {@link Grid} - The main Grid component
 * @module Grid/Compound
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { GridItemProps } from '../types';
import { GRID_ITEM_DEFAULTS } from '../types';
import { buildGridItemStyles, filterGridItemProps } from '../base';

/**
 * GridItem compound component.
 * Used to control the positioning and spanning of items within a Grid.
 *
 * @example
 * ```tsx
 * <Grid columns={3} gap="md">
 *   <GridItem span={2}>Wide Item</GridItem>
 *   <GridItem>Regular Item</GridItem>
 *   <GridItem rowSpan={2}>Tall Item</GridItem>
 * </Grid>
 * ```
 */
export const GridItem = forwardRef<HTMLElement, GridItemProps>(
  (props, ref) => {
    const {
      as: Component = GRID_ITEM_DEFAULTS.as,
      className = '',
      children,
    } = props;

    const computedStyle = buildGridItemStyles(props);
    const filteredProps = filterGridItemProps(props);

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid-item ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      children
    );
  }
);

GridItem.displayName = 'GridItem';

// Export for use in index
export type { GridItemProps };
