/**
 * Stack - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { StackProps } from '../types';

/**
 * Base Stack component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseStack = forwardRef<HTMLDivElement, StackProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-stack ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseStack.displayName = 'BaseStack';
