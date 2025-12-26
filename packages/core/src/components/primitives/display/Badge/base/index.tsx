/**
 * Badge - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { BadgeProps } from '../types';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP } from '../types';

/**
 * Format count for display
 */
function formatCount(count: number | string | undefined, max: number): string | number | undefined {
  if (count === undefined) return undefined;
  if (typeof count === 'string') return count;
  return count > max ? `${max}+` : count;
}

/**
 * Base Badge component using CSS variables.
 * This is extended by engine-specific implementations.
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

    // Get the display value
    const displayValue = content !== undefined ? content : count;
    const formattedValue = formatCount(displayValue, max!);

    // Determine if badge should be visible
    const shouldShowBadge = visible && (
      dot ||
      (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero))
    );

    // Get size values
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
    const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;
    const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

    // Build CSS variables for the badge
    const badgeVars: React.CSSProperties = {
      '--badge-bg': `var(--badge-${variant}-bg, ${color})`,
      '--badge-color': `var(--badge-${variant}-color, #fff)`,
      '--badge-min-width': `var(--badge-${size}-min-width, ${sizeValues.minWidth}px)`,
      '--badge-height': `var(--badge-${size}-height, ${sizeValues.height}px)`,
      '--badge-font-size': `var(--badge-${size}-font-size, ${sizeValues.fontSize}px)`,
      '--badge-border-radius': radius === 'full' ? '9999px' :
                               radius === 'lg' ? '8px' :
                               radius === 'md' ? '4px' :
                               radius === 'sm' ? '2px' : '0',
      '--badge-dot-size': `var(--badge-dot-size, ${dotSize}px)`,
    } as React.CSSProperties;

    // Position styles
    const positionStyles: Record<string, React.CSSProperties> = {
      'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
      'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
      'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
      'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    };

    // Badge style variations
    const badgeStyleVariations: Record<string, React.CSSProperties> = {
      solid: { backgroundColor: 'var(--badge-bg)', color: 'var(--badge-color)' },
      outline: { backgroundColor: 'transparent', color: 'var(--badge-bg)', border: '1px solid var(--badge-bg)' },
      soft: { backgroundColor: `color-mix(in srgb, var(--badge-bg) 15%, transparent)`, color: 'var(--badge-bg)' },
      ghost: { backgroundColor: 'transparent', color: 'var(--badge-bg)' },
    };

    // Container style
    const containerStyle: React.CSSProperties = {
      ...badgeVars,
      position: 'relative',
      display: 'inline-flex',
      ...style,
    };

    // Badge indicator style
    const indicatorStyle: React.CSSProperties = {
      position: children ? 'absolute' : 'relative',
      ...(children ? positionStyles[position!] : {}),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: dot ? 'var(--badge-dot-size)' : 'var(--badge-min-width)',
      height: dot ? 'var(--badge-dot-size)' : 'var(--badge-height)',
      padding: dot ? 0 : '0 6px',
      fontSize: 'var(--badge-font-size)',
      fontWeight: 500,
      lineHeight: 1,
      borderRadius: 'var(--badge-border-radius)',
      border: bordered ? '2px solid #fff' : 'none',
      boxShadow: bordered ? '0 0 0 1px var(--badge-bg)' : 'none',
      cursor: clickable || onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      zIndex: 1,
      ...badgeStyleVariations[badgeStyle!],
    };

    // Pulse animation style
    const pulseStyle: React.CSSProperties = pulse ? {
      animation: 'badge-pulse 1.5s ease-in-out infinite',
    } : {};

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.();
    };

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.();
    };

    // If no children, render standalone badge
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

    // Render badge with children
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
