/**
 * Progress - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import { forwardRef } from 'react';
import type { ProgressProps } from '../types';

/**
 * Base Progress component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseProgress = forwardRef<HTMLDivElement, ProgressProps>(
  (props, ref) => {
    const { className = '', style = {}, children } = props;

    return (
      <div
        ref={ref}
        className={`rottay-progress ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

BaseProgress.displayName = 'BaseProgress';
