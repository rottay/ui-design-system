/**
 * @fileoverview Grid Base Component - Rottay Design System
 * @description Core implementation of the Grid layout component using CSS Grid.
 * This base component is extended by engine-specific implementations.
 *
 * @remarks
 * The base component handles all CSS Grid style computation for both the
 * container (Grid) and items (GridItem). It provides a foundation for
 * Titan, Hermes, and Apollo engine implementations.
 *
 * Key utilities exported:
 * - `buildGridStyles`: Converts Grid props to CSS Grid container properties
 * - `buildGridItemStyles`: Converts GridItem props to CSS Grid item properties
 * - `filterGridProps` / `filterGridItemProps`: Remove custom props before DOM passthrough
 * - `resolveGap`: Converts gap presets to CSS values
 * - `resolveColumns`: Converts column count to grid-template-columns value
 * - `getResponsiveColumnsStyles`: Handles responsive column configurations
 *
 * @example Using Utility Functions
 * ```tsx
 * import { buildGridStyles, buildGridItemStyles, resolveGap } from '@rottay/design-system';
 *
 * // Build grid container styles
 * const containerStyles = buildGridStyles({
 *   columns: 3,
 *   gap: 'md',
 *   alignItems: 'center'
 * });
 * // Result: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }
 *
 * // Build grid item styles
 * const itemStyles = buildGridItemStyles({
 *   span: 2,
 *   rowSpan: 1
 * });
 * // Result: { gridColumn: 'span 2' }
 *
 * // Resolve gap values
 * const gapValue = resolveGap('lg'); // '1.5rem'
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link GridItem} - The compound component for grid items
 * @module Grid/Base
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, type CSSProperties, type ElementType, type Ref } from 'react';
import type {
  GridProps,
  GridItemProps,
  GridGapValue,
  GridGap,
  GridColumns,
  GridColumnsValue,
  ResponsiveValue,
} from '../types';
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS, GAP_MAP } from '../types';

/**
 * Check if a value is a responsive object
 */
function isResponsiveValue<T>(value: T | ResponsiveValue<T> | undefined): value is ResponsiveValue<T> {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(value);
  const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  return keys.some(key => breakpointKeys.includes(key));
}

/**
 * Resolve gap value to CSS value
 */
export function resolveGap(value: GridGapValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return GAP_MAP[value as GridGap];
}

/**
 * Resolve columns value to CSS grid-template-columns value
 */
export function resolveColumns(value: GridColumnsValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value === 'auto') return 'repeat(auto-fit, minmax(0, 1fr))';
  if (value === 'none') return 'none';
  return `repeat(${value}, minmax(0, 1fr))`;
}

/**
 * Generate responsive CSS for columns
 * Returns a style object with CSS custom properties for responsive behavior
 */
export function getResponsiveColumnsStyles(columns: GridColumns | undefined): CSSProperties {
  if (!columns) return {};

  if (!isResponsiveValue(columns)) {
    return {
      gridTemplateColumns: resolveColumns(columns as GridColumnsValue),
    };
  }

  // For responsive values, we use CSS variables that can be overridden per breakpoint
  // This is a simplified approach - for full responsive support, you'd use a CSS-in-JS solution
  // or media query classes
  const responsiveValue = columns as ResponsiveValue<GridColumnsValue>;
  const baseValue = responsiveValue.xs || responsiveValue.sm || responsiveValue.md || 12;

  return {
    '--ds-grid-columns-xs': resolveColumns(responsiveValue.xs || baseValue),
    '--ds-grid-columns-sm': resolveColumns(responsiveValue.sm || responsiveValue.xs || baseValue),
    '--ds-grid-columns-md': resolveColumns(responsiveValue.md || responsiveValue.sm || responsiveValue.xs || baseValue),
    '--ds-grid-columns-lg': resolveColumns(responsiveValue.lg || responsiveValue.md || responsiveValue.sm || responsiveValue.xs || baseValue),
    '--ds-grid-columns-xl': resolveColumns(responsiveValue.xl || responsiveValue.lg || responsiveValue.md || responsiveValue.sm || responsiveValue.xs || baseValue),
    '--ds-grid-columns-2xl': resolveColumns(responsiveValue['2xl'] || responsiveValue.xl || responsiveValue.lg || responsiveValue.md || responsiveValue.sm || responsiveValue.xs || baseValue),
    gridTemplateColumns: 'var(--ds-grid-columns-xs)',
  } as CSSProperties;
}

/**
 * Build styles from Grid props
 */
export function buildGridStyles(props: GridProps): CSSProperties {
  const {
    columns = GRID_DEFAULTS.columns,
    rows,
    gap,
    spacing,
    columnGap,
    rowGap,
    templateColumns,
    templateRows,
    templateAreas,
    autoFlow,
    autoColumns,
    autoRows,
    alignItems,
    justifyItems,
    placeItems,
    alignContent,
    justifyContent,
    width,
    height,
    minHeight,
    maxWidth,
    inline,
    style,
  } = props;

  // Resolve gap values
  const resolvedGap = resolveGap(gap || spacing);
  const resolvedColumnGap = resolveGap(columnGap);
  const resolvedRowGap = resolveGap(rowGap);

  // Get column styles (handles responsive values)
  const columnStyles = templateColumns
    ? { gridTemplateColumns: templateColumns }
    : getResponsiveColumnsStyles(columns);

  // Resolve rows
  const resolvedRows = rows
    ? (isResponsiveValue(rows)
        ? resolveColumns((rows as ResponsiveValue<GridColumnsValue>).md || (rows as ResponsiveValue<GridColumnsValue>).xs)
        : resolveColumns(rows as GridColumnsValue))
    : undefined;

  const computedStyles: CSSProperties = {
    // Display
    display: inline ? 'inline-grid' : 'grid',

    // Template columns (from columnStyles or templateColumns)
    ...columnStyles,

    // Template rows
    ...(templateRows && { gridTemplateRows: templateRows }),
    ...(resolvedRows && !templateRows && { gridTemplateRows: resolvedRows }),

    // Template areas
    ...(templateAreas && { gridTemplateAreas: templateAreas }),

    // Gap
    ...(resolvedGap && { gap: resolvedGap }),
    ...(resolvedColumnGap && { columnGap: resolvedColumnGap }),
    ...(resolvedRowGap && { rowGap: resolvedRowGap }),

    // Auto flow
    ...(autoFlow && { gridAutoFlow: autoFlow }),

    // Auto sizing
    ...(autoColumns && { gridAutoColumns: autoColumns }),
    ...(autoRows && { gridAutoRows: autoRows }),

    // Alignment
    ...(alignItems && { alignItems }),
    ...(justifyItems && { justifyItems }),
    ...(placeItems && { placeItems }),
    ...(alignContent && { alignContent }),
    ...(justifyContent && { justifyContent }),

    // Dimensions
    ...(width && { width }),
    ...(height && { height }),
    ...(minHeight && { minHeight }),
    ...(maxWidth && { maxWidth }),

    // Merge with style prop
    ...style,
  };

  return computedStyles;
}

/**
 * Filter out Grid-specific props from being passed to the DOM element
 */
export function filterGridProps(props: GridProps): Record<string, unknown> {
  const {
    as: _as,
    engine: _engine,
    columns: _columns,
    rows: _rows,
    gap: _gap,
    spacing: _spacing,
    columnGap: _columnGap,
    rowGap: _rowGap,
    templateColumns: _templateColumns,
    templateRows: _templateRows,
    templateAreas: _templateAreas,
    autoFlow: _autoFlow,
    autoColumns: _autoColumns,
    autoRows: _autoRows,
    alignItems: _alignItems,
    justifyItems: _justifyItems,
    placeItems: _placeItems,
    alignContent: _alignContent,
    justifyContent: _justifyContent,
    width: _width,
    height: _height,
    minHeight: _minHeight,
    maxWidth: _maxWidth,
    inline: _inline,
    className: _className,
    style: _style,
    children: _children,
    ...rest
  } = props;

  return rest;
}

/**
 * Build styles from GridItem props
 */
export function buildGridItemStyles(props: GridItemProps): CSSProperties {
  const {
    span,
    colSpan,
    rowSpan,
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    area,
    alignSelf,
    justifySelf,
    placeSelf,
    zIndex,
    style,
  } = props;

  // Determine column span (span is shorthand for colSpan)
  const effectiveColSpan = colSpan || span;

  const computedStyles: CSSProperties = {
    // Column span/position
    ...(effectiveColSpan && { gridColumn: `span ${effectiveColSpan}` }),
    ...(colStart && colEnd && { gridColumn: `${colStart} / ${colEnd}` }),
    ...(colStart && !colEnd && !effectiveColSpan && { gridColumnStart: colStart }),
    ...(colEnd && !colStart && { gridColumnEnd: colEnd }),

    // Row span/position
    ...(rowSpan && { gridRow: `span ${rowSpan}` }),
    ...(rowStart && rowEnd && { gridRow: `${rowStart} / ${rowEnd}` }),
    ...(rowStart && !rowEnd && !rowSpan && { gridRowStart: rowStart }),
    ...(rowEnd && !rowStart && { gridRowEnd: rowEnd }),

    // Grid area
    ...(area && { gridArea: area }),

    // Self alignment
    ...(alignSelf && { alignSelf }),
    ...(justifySelf && { justifySelf }),
    ...(placeSelf && { placeSelf }),

    // Z-index
    ...(zIndex !== undefined && { zIndex }),

    // Merge with style prop
    ...style,
  };

  return computedStyles;
}

/**
 * Filter out GridItem-specific props from being passed to the DOM element
 */
export function filterGridItemProps(props: GridItemProps): Record<string, unknown> {
  const {
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
    as: _as,
    className: _className,
    style: _style,
    children: _children,
    ...rest
  } = props;

  return rest;
}

/**
 * Base Grid component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseGrid = forwardRef<HTMLElement, GridProps>(
  (props, ref) => {
    const {
      as: Component = GRID_DEFAULTS.as,
      className = '',
      children,
    } = props;

    const computedStyle = buildGridStyles(props);
    const filteredProps = filterGridProps(props);

    const ElementType = Component as ElementType;

    return React.createElement(
      ElementType,
      {
        ref: ref as Ref<HTMLElement>,
        className: `rottay-grid ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      children
    );
  }
);

BaseGrid.displayName = 'BaseGrid';

/**
 * Base GridItem component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseGridItem = forwardRef<HTMLElement, GridItemProps>(
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

BaseGridItem.displayName = 'BaseGridItem';
