/**
 * Grid - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import { forwardRef } from 'react';
import type { GridProps } from '../types';

/**
 * Base Grid component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseGrid = forwardRef<HTMLDivElement, GridProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-grid ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseGrid.displayName = 'BaseGrid';
