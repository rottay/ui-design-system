/**
 * @fileoverview Grid Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Grid component.
 * Provides full-featured Grid using Ant Design styling conventions.
 *
 * @remarks
 * The Titan engine implementation uses Ant Design's design system principles
 * while maintaining full compatibility with the Grid API. It applies the
 * `rottay-grid--titan` class for engine-specific styling hooks.
 *
 * CSS Classes Applied:
 * - `rottay-grid`: Base class for all Grid containers
 * - `rottay-grid--titan`: Engine-specific class for Titan styling
 * - `rottay-grid-item`: Base class for all Grid items
 * - `rottay-grid-item--titan`: Engine-specific class for Titan item styling
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Automatically uses Titan if default engine
 * <Grid columns={3} gap="md">
 *   <Grid.Item span={2}>Wide item</Grid.Item>
 *   <Grid.Item>Regular item</Grid.Item>
 * </Grid>
 *
 * // Or explicitly specify engine
 * <Grid engine="titan" columns={4} gap="lg">
 *   Ant Design styled grid
 * </Grid>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link HermesGrid} - Tailwind implementation
 * @see {@link ApolloGrid} - Pure HTML/CSS implementation
 * @module Grid/Engines/Titan
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
 * Titan Grid component
 * Uses Ant Design styling patterns with CSS Grid layout
 */
const TitanGrid = forwardRef<HTMLElement, GridProps>(
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
        className: `rottay-grid rottay-grid--titan ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      children
    );
  }
);

TitanGrid.displayName = 'TitanGrid';

/**
 * Titan GridItem component
 */
const TitanGridItem = forwardRef<HTMLElement, GridItemProps>(
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
        className: `rottay-grid-item rottay-grid-item--titan ${className}`.trim(),
        style: computedStyle,
        ...filteredProps,
      },
      children
    );
  }
);

TitanGridItem.displayName = 'TitanGridItem';

// Export as default for engine factory
export default TitanGrid;

// Named exports
export { TitanGrid, TitanGridItem };
