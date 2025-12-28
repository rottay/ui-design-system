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

import React, { forwardRef, type ElementType, type Ref } from 'react';
import type { GridProps, GridItemProps } from '../../types';
import { GRID_DEFAULTS, GRID_ITEM_DEFAULTS } from '../../types';
import {
  buildGridStyles,
  buildGridItemStyles,
  filterGridProps,
  filterGridItemProps,
} from '../../base';

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
    const filteredProps = filterGridProps(props);

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
        ...filteredProps,
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
    const filteredProps = filterGridItemProps(props);

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
        ...filteredProps,
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
