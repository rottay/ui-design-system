/**
 * @fileoverview Tooltip.Content Compound - Rottay Design System
 * @description Content container for tooltip popup with arrow positioning.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TooltipContent component renders the content displayed within the
 * tooltip popup. Includes optional arrow indicator for visual connection.
 *
 * **Features:**
 * - Arrow indicator with automatic positioning
 * - CSS variable-based theming
 * - Customizable side positioning (top, bottom, left, right)
 * - Accessible content container
 *
 * **CSS Custom Properties:**
 * - `--tooltip-padding` - Content padding
 * - `--tooltip-bg` - Background color
 * - `--tooltip-color` - Text color
 * - `--tooltip-radius` - Border radius
 * - `--tooltip-shadow` - Box shadow
 * - `--tooltip-arrow-size` - Arrow dimensions
 *
 * @example With Arrow
 * ```tsx
 * <Tooltip.Content arrow side="bottom">
 *   <p>This is helpful tooltip content</p>
 * </Tooltip.Content>
 * ```
 *
 * @example Without Arrow
 * ```tsx
 * <Tooltip.Content arrow={false}>
 *   <span>Simple tooltip text</span>
 * </Tooltip.Content>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link TooltipTrigger} for trigger component
 * @module Tooltip/compound/Content
 * @category Display
 * @package @rottay/design-system
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

    // Content container styles using design system CSS variables
    const contentStyles: React.CSSProperties = {
      padding: 'var(--ds-tooltip-padding, 0.5rem 0.75rem)',
      backgroundColor: 'var(--ds-tooltip-bg, rgba(0, 0, 0, 0.9))',
      color: 'var(--ds-tooltip-color, white)',
      fontSize: 'var(--ds-tooltip-font-size, 0.875rem)',
      borderRadius: 'var(--ds-tooltip-radius, 0.375rem)',
      boxShadow: 'var(--ds-tooltip-shadow, 0 4px 6px rgba(0, 0, 0, 0.1))',
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
      width: 'var(--ds-tooltip-arrow-size, 8px)',
      height: 'var(--ds-tooltip-arrow-size, 8px)',
      backgroundColor: 'var(--ds-tooltip-bg, rgba(0, 0, 0, 0.9))',
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
