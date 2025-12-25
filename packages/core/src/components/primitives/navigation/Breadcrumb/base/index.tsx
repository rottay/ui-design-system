/**
 * Breadcrumb - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { BreadcrumbProps } from '../types';

/**
 * Base Breadcrumb component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseBreadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-breadcrumb ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseBreadcrumb.displayName = 'BaseBreadcrumb';
