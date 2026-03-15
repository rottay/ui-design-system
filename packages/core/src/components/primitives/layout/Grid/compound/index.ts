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

import React, { forwardRef, type ElementType, type Ref, type CSSProperties } from 'react';
import type { GridItemProps } from '../Grid.types';
import { GRID_ITEM_DEFAULTS } from '../Grid.types';

// Inline utility function
const buildGridItemStyles = (props: GridItemProps): CSSProperties => {
  const { span, colSpan, rowSpan, colStart, colEnd, rowStart, rowEnd, area, alignSelf, justifySelf, placeSelf, zIndex, style } = props;
  const computedStyle: CSSProperties = { ...style };
  if (area) computedStyle.gridArea = area;
  else {
    const effectiveColSpan = colSpan ?? span;
    if (colStart !== undefined || colEnd !== undefined || effectiveColSpan !== undefined) {
      let col = colStart !== undefined ? String(colStart) : '';
      if (effectiveColSpan !== undefined) col = col ? `${col} / span ${effectiveColSpan}` : `span ${effectiveColSpan}`;
      else if (colEnd !== undefined) col = col ? `${col} / ${colEnd}` : `auto / ${colEnd}`;
      if (col) computedStyle.gridColumn = col;
    }
    if (rowStart !== undefined || rowEnd !== undefined || rowSpan !== undefined) {
      let row = rowStart !== undefined ? String(rowStart) : '';
      if (rowSpan !== undefined) row = row ? `${row} / span ${rowSpan}` : `span ${rowSpan}`;
      else if (rowEnd !== undefined) row = row ? `${row} / ${rowEnd}` : `auto / ${rowEnd}`;
      if (row) computedStyle.gridRow = row;
    }
  }
  if (placeSelf) computedStyle.placeSelf = placeSelf;
  else { if (alignSelf) computedStyle.alignSelf = alignSelf; if (justifySelf) computedStyle.justifySelf = justifySelf; }
  if (zIndex !== undefined) computedStyle.zIndex = zIndex;
  return computedStyle;
};

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
      // Destructure known props so they don't get spread to DOM
      span: _span,
      colSpan: _colSpan,
      rowSpan: _rowSpan,
      colStart: _colStart,
      colEnd: _colEnd,
      rowStart: _rowStart,
      rowEnd: _rowEnd,
      area: _area,
      alignSelf: _alignSelf,
      justifySelf: _justifySelf,
      placeSelf: _placeSelf,
      zIndex: _zIndex,
      style: _style,
      ...restProps
    } = props;

    const computedStyle = buildGridItemStyles(props);

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid-item ${className}`.trim(),
        style: computedStyle,
        ...restProps,
      },
      children
    );
  }
);

GridItem.displayName = 'GridItem';

// Export for use in index
export type { GridItemProps };
