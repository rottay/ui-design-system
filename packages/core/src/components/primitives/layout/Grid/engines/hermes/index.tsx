/**
 * @fileoverview Grid Hermes Engine - Rottay Design System
 * @description Hermes (DaisyUI/Tailwind) implementation of the Grid component.
 * Provides utility-first Grid using Tailwind CSS grid classes.
 *
 * @remarks
 * The Hermes engine leverages Tailwind CSS utility classes for CSS Grid layouts,
 * making it ideal for projects using the utility-first paradigm.
 *
 * Tailwind Class Mappings:
 * - Display: `grid` / `inline-grid`
 * - Columns: `grid-cols-1` through `grid-cols-12`, `grid-cols-auto`
 * - Gap: `gap-1` (xs) through `gap-16` (4xl)
 * - Item spanning: `col-span-*`, `row-span-*`
 * - Alignment: `items-*`, `justify-*`, `place-*`
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Use Hermes engine for Tailwind classes
 * <Grid engine="hermes" columns={3} gap="md">
 *   <Grid.Item span={2}>
 *     Outputs: class="col-span-2"
 *   </Grid.Item>
 * </Grid>
 * // Container outputs: class="grid grid-cols-3 gap-4"
 *
 * // Combine with global EngineProvider
 * <EngineProvider engine="hermes">
 *   <Grid columns={4} gap="lg">
 *     Tailwind grid classes applied
 *   </Grid>
 * </EngineProvider>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link TitanGrid} - Ant Design implementation
 * @see {@link ApolloGrid} - Pure HTML/CSS implementation
 * @module Grid/Engines/Hermes
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type ElementType, type Ref, type CSSProperties } from 'react';
import type { GridProps, GridItemProps, GridGap } from '../../types';
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS, GAP_MAP } from '../../types';

// Inline utility functions
const resolveGap = (gap: GridGap | number | undefined): string | undefined => {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  return GAP_MAP[gap as GridGap] || String(gap);
};

const resolveColumns = (columns: number | 'auto' | 'none' | undefined): string | undefined => {
  if (columns === undefined) return undefined;
  if (columns === 'auto') return 'auto';
  if (columns === 'none') return 'none';
  if (typeof columns === 'number') return `repeat(${columns}, 1fr)`;
  return undefined;
};

const buildGridStyles = (props: GridProps): CSSProperties => {
  const {
    columns, rows, gap, spacing, columnGap, rowGap, templateColumns, templateRows,
    templateAreas, autoFlow, autoColumns, autoRows, alignItems, justifyItems,
    placeItems, alignContent, justifyContent, width, height, minHeight, maxWidth, inline, style,
  } = props;
  const effectiveGap = gap ?? spacing ?? GRID_DEFAULTS.gap;
  const computedStyle: CSSProperties = { display: inline ? 'inline-grid' : 'grid', ...style };
  if (templateColumns) computedStyle.gridTemplateColumns = templateColumns;
  else if (columns !== undefined && typeof columns !== 'object') computedStyle.gridTemplateColumns = resolveColumns(columns as number | 'auto' | 'none');
  if (templateRows) computedStyle.gridTemplateRows = templateRows;
  else if (rows !== undefined && typeof rows !== 'object') computedStyle.gridTemplateRows = resolveColumns(rows as number | 'auto' | 'none');
  if (templateAreas) computedStyle.gridTemplateAreas = templateAreas;
  const resolvedGap = resolveGap(effectiveGap);
  if (resolvedGap) computedStyle.gap = resolvedGap;
  if (columnGap !== undefined) computedStyle.columnGap = resolveGap(columnGap);
  if (rowGap !== undefined) computedStyle.rowGap = resolveGap(rowGap);
  if (autoFlow) computedStyle.gridAutoFlow = autoFlow;
  if (autoColumns) computedStyle.gridAutoColumns = autoColumns;
  if (autoRows) computedStyle.gridAutoRows = autoRows;
  if (placeItems) computedStyle.placeItems = placeItems;
  else { if (alignItems) computedStyle.alignItems = alignItems; if (justifyItems) computedStyle.justifyItems = justifyItems; }
  if (alignContent) computedStyle.alignContent = alignContent;
  if (justifyContent) computedStyle.justifyContent = justifyContent;
  if (width) computedStyle.width = width;
  if (height) computedStyle.height = height;
  if (minHeight) computedStyle.minHeight = minHeight;
  if (maxWidth) computedStyle.maxWidth = maxWidth;
  return computedStyle;
};

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
 * Get Tailwind-style gap class
 */
function getGapClass(gap: GridProps['gap']): string {
  if (!gap || typeof gap === 'number') return '';
  const gapClasses: Record<string, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-10',
    '3xl': 'gap-12',
    '4xl': 'gap-16',
  };
  return gapClasses[gap] || '';
}

/**
 * Get Tailwind-style columns class
 */
function getColumnsClass(columns: GridProps['columns']): string {
  if (!columns || typeof columns === 'object') return '';
  if (columns === 'auto') return 'grid-cols-auto';
  if (columns === 'none') return 'grid-cols-none';
  return `grid-cols-${columns}`;
}

/**
 * Build responsive data attributes for CSS-based responsive columns
 */
function getResponsiveDataAttributes(columns: GridProps['columns']): Record<string, string> {
  if (!columns || typeof columns !== 'object') return {};

  const attrs: Record<string, string> = {};
  const responsiveColumns = columns as { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };

  if (responsiveColumns.xs !== undefined) attrs['data-cols-xs'] = String(responsiveColumns.xs);
  if (responsiveColumns.sm !== undefined) attrs['data-cols-sm'] = String(responsiveColumns.sm);
  if (responsiveColumns.md !== undefined) attrs['data-cols-md'] = String(responsiveColumns.md);
  if (responsiveColumns.lg !== undefined) attrs['data-cols-lg'] = String(responsiveColumns.lg);
  if (responsiveColumns.xl !== undefined) attrs['data-cols-xl'] = String(responsiveColumns.xl);

  return attrs;
}

/**
 * Hermes Grid component
 * Uses DaisyUI/Tailwind styling patterns with CSS Grid layout
 */
const HermesGrid = forwardRef<HTMLElement, GridProps>(
  (props, ref) => {
    const {
      as: Component = GRID_DEFAULTS.as,
      className = '',
      children,
      gap,
      columns,
    } = props;

    const computedStyle = buildGridStyles(props);
    const responsiveAttrs = getResponsiveDataAttributes(columns);

    // Build Tailwind classes
    const tailwindClasses = [
      'grid',
      getColumnsClass(columns),
      getGapClass(gap),
    ].filter(Boolean).join(' ');

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid rottay-grid--hermes ${tailwindClasses} ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid',
        ...responsiveAttrs,
      },
      children
    );
  }
);

HermesGrid.displayName = 'HermesGrid';

/**
 * Hermes GridItem component
 */
const HermesGridItem = forwardRef<HTMLElement, GridItemProps>(
  (props, ref) => {
    const {
      as: Component = GRID_ITEM_DEFAULTS.as,
      className = '',
      children,
      span,
      colSpan,
      rowSpan,
    } = props;

    const computedStyle = buildGridItemStyles(props);

    // Build Tailwind span classes
    const effectiveColSpan = colSpan || span;
    const spanClasses = [
      effectiveColSpan ? `col-span-${effectiveColSpan}` : '',
      rowSpan ? `row-span-${rowSpan}` : '',
    ].filter(Boolean).join(' ');

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid-item rottay-grid-item--hermes ${spanClasses} ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid-item',
      },
      children
    );
  }
);

HermesGridItem.displayName = 'HermesGridItem';

// Export as default for engine factory
export default HermesGrid;

// Named exports
export { HermesGrid, HermesGridItem };
