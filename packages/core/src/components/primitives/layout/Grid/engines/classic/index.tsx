/**
 * @fileoverview Grid Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Grid component.
 * Provides full-featured Grid using Ant Design styling conventions.
 *
 * @remarks
 * The Classic engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Grid API. It applies the
 * `rottay-grid--classic` class for engine-specific styling hooks.
 *
 * CSS Classes Applied:
 * - `rottay-grid`: Base class for all Grid containers
 * - `rottay-grid--classic`: Engine-specific class for Classic styling
 * - `rottay-grid-item`: Base class for all Grid items
 * - `rottay-grid-item--classic`: Engine-specific class for Classic item styling
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Automatically uses Classic if default engine
 * <Grid columns={3} gap="md">
 *   <Grid.Item span={2}>Wide item</Grid.Item>
 *   <Grid.Item>Regular item</Grid.Item>
 * </Grid>
 *
 * // Or explicitly specify engine
 * <Grid engine="classic" columns={4} gap="lg">
 *   Ant Design styled grid
 * </Grid>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link ModernGrid} - Tailwind implementation
 * @see {@link RusticGrid} - Pure HTML/CSS implementation
 * @module Grid/Engines/Classic
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type ElementType, type Ref, type CSSProperties } from 'react';
import type { GridProps, GridItemProps, GridGap, ResponsiveValue } from '../../types';
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS, GAP_MAP } from '../../types';

// Breakpoint values (mobile-first)
const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

// Inline utility functions
const resolveGap = (gap: GridGap | number | undefined): string | undefined => {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  return GAP_MAP[gap as GridGap] || String(gap);
};

const resolveColumns = (columns: number | string | 'auto' | 'none' | undefined): string | undefined => {
  if (columns === undefined) return undefined;
  if (columns === 'auto') return 'auto';
  if (columns === 'none') return 'none';
  if (typeof columns === 'number') return `repeat(${columns}, 1fr)`;
  if (typeof columns === 'string') return columns; // Support for custom templates like '2fr 1fr'
  return undefined;
};

// Check if value is a responsive object
const isResponsiveValue = (value: unknown): value is ResponsiveValue<number | string> => {
  if (typeof value !== 'object' || value === null) return false;
  const keys = Object.keys(value);
  return keys.some(k => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(k));
};

// Generate responsive CSS for columns
const generateResponsiveCSS = (
  gridId: string,
  columns: ResponsiveValue<number | string>,
  rows?: ResponsiveValue<number | string>
): string => {
  const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  let css = '';

  // Mobile-first: start with xs (no media query needed for base)
  const xsColumns = columns.xs;
  if (xsColumns !== undefined) {
    css += `[data-grid-id="${gridId}"] { grid-template-columns: ${resolveColumns(xsColumns)}; }\n`;
  }

  // Add media queries for larger breakpoints
  for (const bp of breakpointOrder) {
    if (bp === 'xs') continue; // Already handled as base
    const colValue = columns[bp as keyof ResponsiveValue<number | string>];
    const rowValue = rows ? rows[bp as keyof ResponsiveValue<number | string>] : undefined;

    if (colValue !== undefined || rowValue !== undefined) {
      css += `@media (min-width: ${BREAKPOINTS[bp]}px) {\n`;
      css += `  [data-grid-id="${gridId}"] {\n`;
      if (colValue !== undefined) {
        css += `    grid-template-columns: ${resolveColumns(colValue)};\n`;
      }
      if (rowValue !== undefined) {
        css += `    grid-template-rows: ${resolveColumns(rowValue)};\n`;
      }
      css += `  }\n`;
      css += `}\n`;
    }
  }

  return css;
};

const buildGridStyles = (props: GridProps, skipColumns = false): CSSProperties => {
  const {
    columns, rows, gap, spacing, columnGap, rowGap, templateColumns, templateRows,
    templateAreas, autoFlow, autoColumns, autoRows, alignItems, justifyItems,
    placeItems, alignContent, justifyContent, width, height, minHeight, maxWidth, inline, style,
  } = props;
  const effectiveGap = gap ?? spacing ?? GRID_DEFAULTS.gap;
  const computedStyle: CSSProperties = { display: inline ? 'inline-grid' : 'grid', ...style };

  if (templateColumns) {
    computedStyle.gridTemplateColumns = templateColumns;
  } else if (!skipColumns && columns !== undefined && !isResponsiveValue(columns)) {
    computedStyle.gridTemplateColumns = resolveColumns(columns as number | 'auto' | 'none');
  }

  if (templateRows) {
    computedStyle.gridTemplateRows = templateRows;
  } else if (!skipColumns && rows !== undefined && !isResponsiveValue(rows)) {
    computedStyle.gridTemplateRows = resolveColumns(rows as number | 'auto' | 'none');
  }

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
 * Classic Grid component
 * Uses Ant Design styling patterns with CSS Grid layout
 * Supports responsive breakpoints via injected CSS
 */
const ClassicGrid = forwardRef<HTMLElement, GridProps>(
  (props, ref) => {
    const {
      as: Component = GRID_DEFAULTS.as,
      className = '',
      children,
      columns,
      rows,
    } = props;

    // Generate unique ID for responsive grids
    const reactId = useId();
    const gridId = `grid-${reactId.replace(/:/g, '')}`;

    // Check if we need responsive CSS
    const hasResponsiveColumns = isResponsiveValue(columns);
    const hasResponsiveRows = isResponsiveValue(rows);
    const needsResponsiveCSS = hasResponsiveColumns || hasResponsiveRows;

    // Build styles - skip columns if they're responsive (handled by CSS)
    const computedStyle = buildGridStyles(props, needsResponsiveCSS);

    // Generate responsive CSS if needed
    const responsiveCSS = needsResponsiveCSS
      ? generateResponsiveCSS(
          gridId,
          hasResponsiveColumns ? (columns as ResponsiveValue<number | string>) : { xs: columns as number },
          hasResponsiveRows ? (rows as ResponsiveValue<number | string>) : undefined
        )
      : null;

    const ElementType = Component as ElementType;

    return (
      <>
        {responsiveCSS && (
          <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
        )}
        {React.createElement(
          ElementType,
          {
            ref: ref as Ref<HTMLElement>,
            className: `rottay-grid rottay-grid--classic ${className}`.trim(),
            style: computedStyle,
            'data-component': 'grid',
            'data-grid-id': needsResponsiveCSS ? gridId : undefined,
          },
          children
        )}
      </>
    );
  }
);

ClassicGrid.displayName = 'ClassicGrid';

/**
 * Classic GridItem component
 */
const ClassicGridItem = forwardRef<HTMLElement, GridItemProps>(
  (props, ref) => {
    const {
      as: Component = GRID_ITEM_DEFAULTS.as,
      className = '',
      children,
    } = props;

    const computedStyle = buildGridItemStyles(props);

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid-item rottay-grid-item--classic ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid-item',
      },
      children
    );
  }
);

ClassicGridItem.displayName = 'ClassicGridItem';

// Export as default for engine factory
export default ClassicGrid;

// Named exports
export { ClassicGrid, ClassicGridItem };
