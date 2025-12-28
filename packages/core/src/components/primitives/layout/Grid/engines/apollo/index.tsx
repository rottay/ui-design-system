/**
 * @fileoverview Grid Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Grid component.
 * Provides a dependency-free Grid using inline CSS Grid styles.
 *
 * @remarks
 * The Apollo engine uses pure inline CSS styles without any external CSS framework
 * dependencies. All CSS Grid properties are computed and applied inline:
 * - `display: grid`
 * - `gridTemplateColumns`, `gridTemplateRows`
 * - `gap`, `columnGap`, `rowGap`
 * - `gridColumn`, `gridRow` (for items)
 *
 * This makes it ideal for:
 * - Server-side rendering without CSS extraction
 * - Embedding in third-party applications
 * - Maximum browser compatibility (CSS Grid is well-supported)
 * - Accessibility-focused implementations
 *
 * Data attributes are added for debugging:
 * - `data-component="grid"` on the container
 * - `data-component="grid-item"` on items
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Grid } from '@rottay/design-system';
 *
 * // Use Apollo for dependency-free styling
 * <Grid engine="apollo" columns={3} gap="md">
 *   <Grid.Item span={2}>
 *     Pure inline CSS Grid, no framework dependencies
 *   </Grid.Item>
 * </Grid>
 *
 * // Ideal for embedded widgets
 * <EngineProvider engine="apollo">
 *   <Grid columns={4} gap="lg">
 *     Self-contained grid styling
 *   </Grid>
 * </EngineProvider>
 * ```
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link TitanGrid} - Ant Design implementation
 * @see {@link HermesGrid} - Tailwind implementation
 * @module Grid/Engines/Apollo
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
 * Apollo Grid component
 * Pure HTML/CSS implementation with CSS Grid layout
 */
const ApolloGrid = forwardRef<HTMLElement, GridProps>(
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
        className: `rottay-grid rottay-grid--apollo ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid',
        ...filteredProps,
      },
      children
    );
  }
);

ApolloGrid.displayName = 'ApolloGrid';

/**
 * Apollo GridItem component
 */
const ApolloGridItem = forwardRef<HTMLElement, GridItemProps>(
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
        className: `rottay-grid-item rottay-grid-item--apollo ${className}`.trim(),
        style: computedStyle,
        'data-component': 'grid-item',
        ...filteredProps,
      },
      children
    );
  }
);

ApolloGridItem.displayName = 'ApolloGridItem';

// Export as default for engine factory
export default ApolloGrid;

// Named exports
export { ApolloGrid, ApolloGridItem };
