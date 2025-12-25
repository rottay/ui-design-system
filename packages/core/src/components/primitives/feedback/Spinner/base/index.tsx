/**
 * Spinner - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { SpinnerProps } from '../types';

/**
 * Base Spinner component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-spinner ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseSpinner.displayName = 'BaseSpinner';
