/**
 * Tooltip.Content - Content Compound Component
 * Displays the content within the tooltip popup.
 *
 * @module Tooltip/compound/Content
 * @description The content component for the Tooltip compound pattern.
 * This component renders the tooltip content with optional arrow indicator.
 */

'use client';

import React, { forwardRef } from 'react';
import type { TooltipContentProps } from '../../types';

/**
 * Tooltip content component for displaying tooltip information.
 *
 * Renders the content displayed inside the tooltip popup.
 * Includes optional arrow indicator for visual connection to trigger.
 *
 * @example
 * ```tsx
 * <Tooltip.Content arrow>
 *   <p>This is helpful tooltip content</p>
 * </Tooltip.Content>
 *
 * <Tooltip.Content side="bottom" arrow={false}>
 *   <span>No arrow tooltip</span>
 * </Tooltip.Content>
 * ```
 */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (props, ref) => {
    const {
      children,
      arrow = true,
      side = 'top',
      className = '',
      style,
      ...restProps
    } = props;

    // Content container styles using CSS variables
    const contentStyles: React.CSSProperties = {
      padding: 'var(--tooltip-padding, 0.5rem 0.75rem)',
      backgroundColor: 'var(--tooltip-bg, rgba(0, 0, 0, 0.9))',
      color: 'var(--tooltip-color, white)',
      fontSize: 'var(--tooltip-font-size, 0.875rem)',
      borderRadius: 'var(--tooltip-radius, 0.375rem)',
      boxShadow: 'var(--tooltip-shadow, 0 4px 6px rgba(0, 0, 0, 0.1))',
      ...style,
    };

    // Arrow positioning based on side
    const arrowPositions: Record<string, React.CSSProperties> = {
      top: { bottom: '-4px', left: '50%', marginLeft: '-4px' },
      bottom: { top: '-4px', left: '50%', marginLeft: '-4px' },
      left: { right: '-4px', top: '50%', marginTop: '-4px' },
      right: { left: '-4px', top: '50%', marginTop: '-4px' },
    };

    // Arrow styles
    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 'var(--tooltip-arrow-size, 8px)',
      height: 'var(--tooltip-arrow-size, 8px)',
      backgroundColor: 'var(--tooltip-bg, rgba(0, 0, 0, 0.9))',
      transform: 'rotate(45deg)',
      ...arrowPositions[side],
    };

    return (
      <div
        ref={ref}
        className={`rottay-tooltip-content ${className}`.trim()}
        style={contentStyles}
        {...restProps}
      >
        {children}
        {arrow && (
          <div
            className="rottay-tooltip-arrow"
            style={arrowStyles}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';
