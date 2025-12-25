/**
 * Alert - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { AlertProps } from '../types';

/**
 * Base Alert component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseAlert = forwardRef<HTMLDivElement, AlertProps>(
  (props, ref) => {
    const { className = '', style = {}, children, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`rottay-alert ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

BaseAlert.displayName = 'BaseAlert';
