/**
 * Box - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { BoxProps } from '../types';

/**
 * Base Box component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseBox = forwardRef<HTMLDivElement, BoxProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-box ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseBox.displayName = 'BaseBox';
