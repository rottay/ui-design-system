'use client';

import React, { forwardRef } from 'react';
import type { TooltipContentProps } from '../../types';

/**
 * Tooltip.Content component for tooltip content.
 *
 * Displays the tooltip content with optional arrow.
 */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, arrow = true, className, style, ...props }, ref) => {
    const contentStyles: React.CSSProperties = {
      padding: '0.5rem 0.75rem',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-tooltip-content ${className || ''}`}
        style={contentStyles}
        {...props}
      >
        {children}
        {arrow && (
          <div
            className="rottay-tooltip-arrow"
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
            }}
          />
        )}
      </div>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';
