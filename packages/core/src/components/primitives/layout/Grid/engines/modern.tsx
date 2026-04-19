/**
 * @fileoverview Grid Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Grid component.
 * Provides utility-first Grid using Tailwind CSS grid classes.
 *
 * @remarks
 * The Modern engine leverages Tailwind CSS utility classes for CSS Grid layouts,
 * making it ideal for projects using the utility-first paradigm.
 *
 * Tailwind Class Mappings:
 * - Display: `grid` / `inline-grid`
 * - Columns: `grid-cols-1` through `grid-cols-12`, `grid-cols-auto`
 * - Gap: `gap-1` (xs) through `gap-16` (4xl)
 * - Item spanning: `col-span-*`, `row-span-*`
 * - Alignment: `items-*`, `justify-*`, `place-*`
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Use Modern engine for Tailwind classes
 * <Grid engine="modern" columns={3} gap="md">
 *   <Grid.Item span={2}>
 *     Outputs: class="col-span-2"
 *   </Grid.Item>
 * </Grid>
 * // Container outputs: class="grid grid-cols-3 gap-4"
 *
 * // Combine with global EngineProvider
 * <EngineProvider engine="modern">
 *   <Grid columns={4} gap="lg">
 *     Tailwind grid classes applied
 *   </Grid>
 * </EngineProvider>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link ClassicGrid} - Ant Design implementation
 * @see {@link RusticGrid} - Pure HTML/CSS implementation
 * @module Grid/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useId, type ElementType, type Ref, type CSSProperties } from 'react';
import type { GridProps, GridItemProps, GridGap, ResponsiveValue } from '../Grid.types';
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS, GAP_MAP } from '../Grid.types';
import {
  generateResponsiveGridCSS,
  isResponsiveGridValue,
  type ResponsiveGridTemplateValue,
} from '../shared/responsive';

/**
 * Converts a semantic gap token or raw pixel number into a CSS-compatible string.
 * Used for inline style fallbacks when Tailwind gap classes are insufficient.
 */
const resolveGap = (gap: GridGap | number | undefined): string | undefined => {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  return GAP_MAP[gap as GridGap] || String(gap);
};

/**
 * Converts a column/row definition into a CSS grid-template value.
 * Numeric values become `repeat(N, 1fr)` for equal-width tracks.
 */
const resolveColumns = (columns: ResponsiveGridTemplateValue | undefined): string | undefined => {
  if (columns === undefined) return undefined;
  if (columns === 'auto') return 'auto';
  if (columns === 'none') return 'none';
  if (typeof columns === 'number') return `repeat(${columns}, 1fr)`;
  if (typeof columns === 'string') return columns;
  return undefined;
};

/**
 * Assembles inline CSSProperties for the grid container.
 *
 * The Modern engine uses a hybrid approach: Tailwind classes handle grid column
 * counts and gap sizing (via getColumnsClass / getGapClass), while inline styles
 * cover the full range of CSS Grid properties that have no Tailwind equivalent
 * (templateAreas, autoFlow, alignment shorthands, dimension constraints, etc.).
 *
 * @param props - The full set of GridProps from the consumer.
 * @returns A CSSProperties object to spread onto the container element.
 */
const buildGridStyles = (props: GridProps): CSSProperties => {
  const {
    columns, rows, gap, spacing, columnGap, rowGap, templateColumns, templateRows,
    templateAreas, autoFlow, autoColumns, autoRows, alignItems, justifyItems,
    placeItems, alignContent, justifyContent, width, height, minHeight, maxWidth, inline, style,
  } = props;
  const effectiveGap = gap ?? spacing ?? GRID_DEFAULTS.gap;
  const computedStyle: CSSProperties = { display: inline ? 'inline-grid' : 'grid', ...style };
  if (templateColumns) computedStyle.gridTemplateColumns = templateColumns;
  else if (columns !== undefined && !isResponsiveGridValue(columns)) computedStyle.gridTemplateColumns = resolveColumns(columns as ResponsiveGridTemplateValue);
  if (templateRows) computedStyle.gridTemplateRows = templateRows;
  else if (rows !== undefined && !isResponsiveGridValue(rows)) computedStyle.gridTemplateRows = resolveColumns(rows as ResponsiveGridTemplateValue);
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

/**
 * Assembles inline CSSProperties for a grid item.
 *
 * Works alongside Tailwind span classes (col-span-*, row-span-*) that are
 * generated in ModernGridItem. Inline styles cover advanced placement scenarios
 * (colStart/colEnd, named areas) that Tailwind classes cannot express statically.
 */
const buildGridItemStyles = (props: GridItemProps): CSSProperties => {
  const { span, colSpan, rowSpan, colStart, colEnd, rowStart, rowEnd, area, alignSelf, justifySelf, placeSelf, zIndex, style } = props;
  const computedStyle: CSSProperties = { ...style };
  // Named area takes full precedence over col/row placement
  if (area) computedStyle.gridArea = area;
  else {
    const effectiveColSpan = colSpan ?? span;
    // Build gridColumn: "start / span N" or "start / end" or "span N"
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

// Gap is now resolved via inline style using DS CSS custom properties.
// This ensures tenant overrides (--ds-spacing-*) flow through.

/**
 * Maps column count to a Tailwind grid-cols utility class.
 * Responsive objects are skipped here (handled by injected media-query CSS).
 */
function getColumnsClass(columns: GridProps['columns']): string {
  if (!columns || typeof columns === 'object') return '';
  if (columns === 'auto') return 'grid-cols-auto';
  if (columns === 'none') return 'grid-cols-none';
  return `grid-cols-${columns}`;
}

/**
 * Modern Grid container using a hybrid Tailwind + inline-style strategy.
 *
 * Tailwind classes are generated for column counts and gap tokens that map
 * cleanly to the utility scale. All remaining CSS Grid properties (template
 * areas, auto-flow, alignment, dimension constraints) are expressed as inline
 * styles. Responsive breakpoint objects trigger injected `<style>` media queries.
 *
 * @param props - Grid container props including columns, rows, gap, template overrides, etc.
 * @returns A polymorphic, ref-forwarding grid container element.
 */
const ModernGrid = forwardRef<HTMLElement, GridProps>(
  (props, ref) => {
    const {
      as: Component = GRID_DEFAULTS.as,
      className = '',
      children,
      gap,
      columns,
      rows,
      id,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
    } = props;

    const reactId = useId();
    const gridId = `grid-${reactId.replace(/:/g, '')}`;
    const hasResponsiveColumns = isResponsiveGridValue(columns);
    const hasResponsiveRows = isResponsiveGridValue(rows);
    const needsResponsiveCSS = hasResponsiveColumns || hasResponsiveRows;

    // Clear inline template values when responsive CSS will provide them via
    // media queries, preventing the inline styles from overriding the injected rules
    const computedStyle = buildGridStyles({
      ...props,
      style: needsResponsiveCSS
        ? {
            ...props.style,
            gridTemplateColumns:
              props.templateColumns || (hasResponsiveColumns ? undefined : props.style?.gridTemplateColumns),
            gridTemplateRows:
              props.templateRows || (hasResponsiveRows ? undefined : props.style?.gridTemplateRows),
          }
        : props.style,
    });
    const responsiveCSS = needsResponsiveCSS
      ? generateResponsiveGridCSS(
          gridId,
          resolveColumns,
          hasResponsiveColumns ? (columns as ResponsiveValue<ResponsiveGridTemplateValue>) : undefined,
          hasResponsiveRows ? (rows as ResponsiveValue<ResponsiveGridTemplateValue>) : undefined
        )
      : null;

    // Gap resolved via inline style using DS CSS custom properties
    if (gap && typeof gap === 'string' && gap in GAP_MAP) {
      computedStyle.gap = GAP_MAP[gap as keyof typeof GAP_MAP];
    }

    // Compose Tailwind classes only for props with clean utility mappings;
    // skip column class when responsive or custom template is active
    const tailwindClasses = [
      'grid',
      !hasResponsiveColumns && !props.templateColumns ? getColumnsClass(columns) : '',
    ].filter(Boolean).join(' ');

    const ElementType = Component as ElementType;
    const renderedChildren = React.Children.toArray(children);

    return (
      <>
        {responsiveCSS && <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />}
        {React.createElement(
          ElementType,
          {
            ref: ref as Ref<HTMLElement>,
            className: `rottay-grid rottay-grid--modern ${tailwindClasses} ${className}`.trim(),
            style: computedStyle,
            id,
            'aria-label': ariaLabel,
            'data-testid': dataTestId,
            'data-component': 'grid',
            'data-grid-id': needsResponsiveCSS ? gridId : undefined,
          },
          renderedChildren
        )}
      </>
    );
  }
);

ModernGrid.displayName = 'ModernGrid';

/**
 * Modern GridItem component with Tailwind span utilities.
 *
 * Generates `col-span-*` and `row-span-*` Tailwind classes for common
 * spanning scenarios. Advanced placement (colStart, colEnd, named areas)
 * is handled by inline styles from buildGridItemStyles.
 *
 * @param props - Grid item positioning props (span, colSpan, rowSpan, area, etc.)
 * @returns A polymorphic, ref-forwarding grid item element.
 */
const ModernGridItem = forwardRef<HTMLElement, GridItemProps>(
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

    // Generate Tailwind span utilities for the most common use case;
    // inline styles from buildGridItemStyles handle start/end positioning
    const effectiveColSpan = colSpan || span;
    const spanClasses = [
      effectiveColSpan ? `col-span-${effectiveColSpan}` : '',
      rowSpan ? `row-span-${rowSpan}` : '',
    ].filter(Boolean).join(' ');

    const ElementType = Component as ElementType;
    const renderedChildren = React.Children.toArray(children);

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid-item rottay-grid-item--modern ${spanClasses} ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid-item',
      },
      renderedChildren
    );
  }
);

ModernGridItem.displayName = 'ModernGridItem';

// Export as default for engine factory
export default ModernGrid;

// Named exports
export { ModernGrid, ModernGridItem };
