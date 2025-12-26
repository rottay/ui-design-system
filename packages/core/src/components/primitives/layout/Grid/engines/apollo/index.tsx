/**
 * Grid - Apollo Engine (Vanilla HTML/CSS)
 * Pure HTML/CSS implementation for maximum accessibility and performance
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
