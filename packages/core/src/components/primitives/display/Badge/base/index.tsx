/**
 * Badge - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { BadgeProps } from '../types';

/**
 * Base Badge component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseBadge = forwardRef<HTMLDivElement, BadgeProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-badge ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseBadge.displayName = 'BaseBadge';
