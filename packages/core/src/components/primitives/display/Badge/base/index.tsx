/**
 * @fileoverview Badge Base Component - Rottay Design System
 * @description Core badge implementation with CSS variables for theming.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The BaseBadge provides a full-featured badge with CSS variable support.
 * It handles count formatting, dot indicators, positioning, and all
 * visual customization options.
 *
 * **Component Structure:**
 * - Container wrapper for positioned badges
 * - Badge indicator span with content
 * - Optional icon and close button
 * - Pulse animation support
 *
 * **CSS Variable Integration:**
 * - `--ds-badge-bg` - Background color
 * - `--ds-badge-color` - Text color
 * - `--ds-badge-min-width` - Minimum badge width
 * - `--ds-badge-height` - Badge height
 * - `--ds-badge-font-size` - Text size
 * - `--ds-badge-border-radius` - Corner radius
 * - `--ds-badge-dot-size` - Dot indicator size
 *
 * **Position Options:**
 * - `top-right` - Default, upper right corner
 * - `top-left` - Upper left corner
 * - `bottom-right` - Lower right corner
 * - `bottom-left` - Lower left corner
 *
 * @example Standalone Badge
 * ```tsx
 * import { BaseBadge } from '@rottay/design-system';
 *
 * <BaseBadge count={5} variant="primary" />
 * ```
 *
 * @example Badge Overlay
 * ```tsx
 * <BaseBadge count={10} position="top-right">
 *   <Avatar src="/user.jpg" />
 * </BaseBadge>
 * ```
 *
 * @see {@link Badge} for the engine-routed component
 * @module BaseBadge
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { BadgeProps } from '../types';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP } from '../types';

/**
 * Formats a numeric count for display, applying overflow logic.
 * @param count - The raw count value (number or string)
 * @param max - Maximum value before showing overflow indicator
 * @returns Formatted display string or the original value
 * @example
 * formatCount(50, 99)   // returns 50
 * formatCount(100, 99)  // returns "99+"
 * formatCount("New", 99) // returns "New"
 */
function formatCount(count: number | string | undefined, max: number): string | number | undefined {
  if (count === undefined) return undefined;
  if (typeof count === 'string') return count;
  return count > max ? `${max}+` : count;
}

/**
 * Base Badge component using CSS variables for theming.
 *
 * The Badge component displays a small indicator that can show:
 * - Numeric counts (e.g., notification counts)
 * - Status dots
 * - Text labels
 * - Icons with optional content
 *
 * It can be used standalone or positioned over other elements.
 *
 * @component
 * @example
 * // Standalone badge with count
 * <BaseBadge count={5} variant="primary" />
 *
 * @example
 * // Badge as overlay on an element
 * <BaseBadge count={10} position="top-right">
 *   <Avatar src="/user.jpg" />
 * </BaseBadge>
 *
 * @example
 * // Dot indicator badge
 * <BaseBadge dot pulse variant="error">
 *   <NotificationIcon />
 * </BaseBadge>
 */
export const BaseBadge = forwardRef<HTMLDivElement, BadgeProps>(
  (props, ref) => {
    const {
      children,
      content,
      count,
      dot = BADGE_DEFAULTS.dot,
      showZero = BADGE_DEFAULTS.showZero,
      max = BADGE_DEFAULTS.overflowCount,
      variant = BADGE_DEFAULTS.variant,
      size = BADGE_DEFAULTS.size,
      badgeStyle = BADGE_DEFAULTS.badgeStyle,
      visible = BADGE_DEFAULTS.visible,
      pulse,
      position = BADGE_DEFAULTS.position,
      icon,
      closable,
      onClose,
      clickable,
      onClick,
      bordered,
      radius = BADGE_DEFAULTS.radius,
      className = '',
      style = {},
    } = props;

    // Determine the display value (content takes precedence over count)
    const displayValue = content !== undefined ? content : count;
    const formattedValue = formatCount(displayValue, max!);

    // Calculate badge visibility based on content and settings
    const shouldShowBadge = visible && (
      dot ||
      (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero))
    );

    // Retrieve size-specific values from configuration maps
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
    const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;
    const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

    /**
     * CSS custom properties for badge styling.
     * These variables enable consistent theming across engines.
     */
    const badgeVars: React.CSSProperties = {
      '--ds-badge-bg': `var(--ds-badge-${variant}-bg, ${color})`,
      '--ds-badge-color': `var(--ds-badge-${variant}-color, #fff)`,
      '--ds-badge-min-width': sizeValues.minWidth,
      '--ds-badge-height': sizeValues.height,
      '--ds-badge-font-size': sizeValues.fontSize,
      '--ds-badge-border-radius': radius === 'full' ? 'var(--ds-badge-radius-full, 9999px)' :
                               radius === 'lg' ? 'var(--ds-badge-radius-lg, 8px)' :
                               radius === 'md' ? 'var(--ds-badge-radius-md, 4px)' :
                               radius === 'sm' ? 'var(--ds-badge-radius-sm, 2px)' : 'var(--ds-badge-radius-none, 0)',
      '--ds-badge-dot-size': dotSize,
    } as React.CSSProperties;

    /**
     * Position offset styles for badge placement over children.
     */
    const positionStyles: Record<string, React.CSSProperties> = {
      'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
      'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
      'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
      'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    };

    /**
     * Visual style variations for the badge appearance.
     */
    const badgeStyleVariations: Record<string, React.CSSProperties> = {
      solid: { backgroundColor: 'var(--ds-badge-bg)', color: 'var(--ds-badge-color)' },
      outline: { backgroundColor: 'transparent', color: 'var(--ds-badge-bg)', border: '1px solid var(--ds-badge-bg)' },
      soft: { backgroundColor: `color-mix(in srgb, var(--ds-badge-bg) 15%, transparent)`, color: 'var(--ds-badge-bg)' },
      ghost: { backgroundColor: 'transparent', color: 'var(--ds-badge-bg)' },
    };

    // Container wrapper styles
    const containerStyle: React.CSSProperties = {
      ...badgeVars,
      position: 'relative',
      display: 'inline-flex',
      ...style,
    };

    // Badge indicator element styles
    const indicatorStyle: React.CSSProperties = {
      position: children ? 'absolute' : 'relative',
      ...(children ? positionStyles[position!] : {}),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: dot ? 'var(--ds-badge-dot-size)' : 'var(--ds-badge-min-width)',
      height: dot ? 'var(--ds-badge-dot-size)' : 'var(--ds-badge-height)',
      padding: dot ? 0 : '0 6px',
      fontSize: 'var(--ds-badge-font-size)',
      fontWeight: 500,
      lineHeight: 1,
      borderRadius: 'var(--ds-badge-border-radius)',
      border: bordered ? '2px solid #fff' : 'none',
      boxShadow: bordered ? '0 0 0 1px var(--ds-badge-bg)' : 'none',
      cursor: clickable || onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      zIndex: 1,
      ...badgeStyleVariations[badgeStyle!],
    };

    // Pulse animation styles for attention-grabbing badges
    const pulseStyle: React.CSSProperties = pulse ? {
      animation: 'badge-pulse 1.5s ease-in-out infinite',
    } : {};

    /**
     * Handles click events on the badge.
     * @param e - Mouse event object
     */
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.();
    };

    /**
     * Handles close button clicks.
     * @param e - Mouse event object
     */
    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.();
    };

    // Render standalone badge when no children are provided
    if (!children) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={`rottay-badge rottay-badge--${size} rottay-badge--${variant} ${className}`}
          style={{ ...indicatorStyle, position: 'relative', ...style }}
          onClick={clickable || onClick ? handleClick : undefined}
        >
          {icon && <span style={{ marginRight: formattedValue !== undefined ? 4 : 0 }}>{icon}</span>}
          {!dot && formattedValue}
          {closable && (
            <span
              style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7 }}
              onClick={handleClose}
              aria-label="Close badge"
            >
              x
            </span>
          )}
        </span>
      );
    }

    // Render badge positioned over children
    return (
      <div
        ref={ref}
        className={`rottay-badge-wrapper ${className}`}
        style={containerStyle}
      >
        {children}
        {shouldShowBadge && (
          <span
            className={`rottay-badge rottay-badge--${size} rottay-badge--${variant} ${pulse ? 'rottay-badge--pulse' : ''}`}
            style={{ ...indicatorStyle, ...pulseStyle }}
            onClick={clickable || onClick ? handleClick : undefined}
          >
            {icon && <span style={{ marginRight: formattedValue !== undefined && !dot ? 4 : 0 }}>{icon}</span>}
            {!dot && formattedValue}
          </span>
        )}
      </div>
    );
  }
);

BaseBadge.displayName = 'BaseBadge';
