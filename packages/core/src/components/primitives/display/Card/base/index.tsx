/**
 * Card - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { CardProps } from '../types';

/**
 * Base Card component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseCard = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-card ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
