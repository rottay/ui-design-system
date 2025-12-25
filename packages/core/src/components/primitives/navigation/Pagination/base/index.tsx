/**
 * Pagination - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { PaginationProps } from '../types';

/**
 * Base Pagination component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BasePagination = forwardRef<HTMLDivElement, PaginationProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-pagination ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BasePagination.displayName = 'BasePagination';
