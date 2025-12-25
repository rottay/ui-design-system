/**
 * Button - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { ButtonProps } from '../types';

/**
 * Base Button component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseButton = forwardRef<HTMLDivElement, ButtonProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-button ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseButton.displayName = 'BaseButton';
