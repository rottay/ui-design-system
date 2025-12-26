/**
 * Grid - Compound Components
 * Grid.Item for positioning and spanning within the grid
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
