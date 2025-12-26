/**
 * Tabs - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import { forwardRef } from 'react';
import type { TabsProps } from '../types';

/**
 * Base Tabs component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseTabs = forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => {
    const { className = '', style = {}, children } = props;

    return (
      <div
        ref={ref}
        className={`rottay-tabs ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

BaseTabs.displayName = 'BaseTabs';
