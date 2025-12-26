/**
 * Divider - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import { forwardRef } from 'react';
import type { DividerProps } from '../types';

/**
 * Base Divider component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseDivider = forwardRef<HTMLDivElement, DividerProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-divider ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseDivider.displayName = 'BaseDivider';
