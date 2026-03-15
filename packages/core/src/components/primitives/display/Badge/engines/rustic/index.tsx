/**
 * @fileoverview Badge Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS badge implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free badge using only
 * inline styles and CSS custom properties for theming.
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Injects keyframe animation for pulse effect
 * - Computes dimensions from SIZE_MAP constants
 * - Supports all style variants (solid, outline, soft, ghost)
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full control over styles
 *
 * **Style Variants:**
 * - `solid` - Filled background with white text
 * - `outline` - Transparent with colored border
 * - `soft` - Light background (15% opacity)
 * - `ghost` - Transparent with colored text
 *
 * @example Basic Usage
 * ```tsx
 * import { Badge } from '@rottay/design-system';
 *
 * <Badge engine="rustic" count={5} variant="primary">
 *   <Avatar />
 * </Badge>
 * ```
 *
 * @example Soft Style with Icon
 * ```tsx
 * <Badge
 *   engine="rustic"
 *   content="New"
 *   badgeStyle="soft"
 *   variant="success"
 *   icon={<StarIcon />}
 * />
 * ```
 *
 * @see {@link Badge} for the main component
 * @see {@link BaseBadge} for CSS variable implementation
 * @module RusticBadge
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { BadgeProps } from '../../types';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP } from '../../types';

/**
 * Rustic (Pure HTML/CSS) implementation of the Badge component.
 *
 * This engine provides a zero-dependency badge implementation using only
 * vanilla HTML, CSS, and CSS custom properties. It offers maximum control
 * over styling and is optimized for accessibility.
 *
 * @component
 * @example
 * // Basic badge with count
 * <RusticBadge count={5} variant="primary">
 *   <Avatar />
 * </RusticBadge>
 *
 * @example
 * // Soft style badge with icon
 * <RusticBadge content="New" badgeStyle="soft" variant="success" icon={<StarIcon />} />
 *
 * @param props - Badge component props
 * @returns React element with pure CSS Badge
 */
export default function RusticBadge(props: BadgeProps): React.ReactElement {
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
    style,
  } = props;

  // Determine display value (content takes precedence)
  const displayValue = content !== undefined ? content : count;

  /**
   * Format count with overflow handling.
   */
  const formattedValue = (() => {
    if (displayValue === undefined) return undefined;
    if (typeof displayValue === 'string') return displayValue;
    return displayValue > max! ? `${max}+` : displayValue;
  })();

  // Calculate badge visibility
  const shouldShowBadge = visible && (
    dot ||
    (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero))
  );

  // Retrieve size-specific values
  const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  /**
   * CSS custom properties for badge styling.
   * Uses design system tokens with fallbacks.
   */
  const cssVars: React.CSSProperties = {
    '--ds-badge-bg': color,
    '--ds-badge-color': 'var(--ds-badge-text-color, #ffffff)',
    '--ds-badge-min-width': sizeValues.minWidth,
    '--ds-badge-height': sizeValues.height,
    '--ds-badge-font-size': sizeValues.fontSize,
    '--ds-badge-dot-size': dotSize,
    '--ds-badge-border-radius': radius === 'full' ? 'var(--ds-badge-radius-full, 9999px)' :
                             radius === 'lg' ? 'var(--ds-badge-radius-lg, 8px)' :
                             radius === 'md' ? 'var(--ds-badge-radius-md, 4px)' :
                             radius === 'sm' ? 'var(--ds-badge-radius-sm, 2px)' : 'var(--ds-badge-radius-none, 0)',
  } as React.CSSProperties;

  /**
   * Position offset styles for badge placement.
   */
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
  };

  /**
   * Returns CSS styles for the selected badge style variant.
   * @returns Style object for the badge appearance
   */
  const getStyleVariation = (): React.CSSProperties => {
    switch (badgeStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ds-badge-bg)',
          border: '1px solid var(--ds-badge-bg)',
        };
      case 'soft':
        return {
          backgroundColor: `${color}26`, // 15% opacity hex
          color: 'var(--ds-badge-bg)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ds-badge-bg)',
        };
      default: // solid
        return {
          backgroundColor: 'var(--ds-badge-bg)',
          color: 'var(--ds-badge-color)',
        };
    }
  };

  /**
   * Handles badge click events.
   * @param e - Mouse event
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  /**
   * Handles close button clicks.
   * @param e - Mouse event
   */
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Base indicator styles
  const badgeIndicatorStyle: React.CSSProperties = {
    ...cssVars,
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
    border: bordered ? 'var(--ds-badge-border-width, 2px) solid var(--ds-badge-border-color, #fff)' : 'none',
    boxShadow: bordered ? `0 0 0 1px ${color}` : 'none',
    cursor: clickable || onClick ? 'pointer' : 'default',
    transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
    userSelect: 'none',
    ...getStyleVariation(),
  };

  // Pulse animation styles
  const pulseAnimation = pulse ? {
    animation: 'badge-pulse 1.5s ease-in-out infinite',
  } : {};

  // Render standalone badge (no children)
  if (!children) {
    return (
      <>
        {pulse && (
          <style>{`
            @keyframes badge-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
          `}</style>
        )}
        <span
          className={className}
          style={{ ...badgeIndicatorStyle, ...pulseAnimation, ...style }}
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
      </>
    );
  }

  // Container wrapper styles
  const containerStyle: React.CSSProperties = {
    ...cssVars,
    position: 'relative',
    display: 'inline-flex',
    ...style,
  };

  // Positioned badge styles
  const positionedBadgeStyle: React.CSSProperties = {
    ...badgeIndicatorStyle,
    ...pulseAnimation,
    position: 'absolute',
    ...positionStyles[position!],
    zIndex: 1,
  };

  return (
    <>
      {pulse && (
        <style>{`
          @keyframes badge-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
        `}</style>
      )}
      <div className={className} style={containerStyle}>
        {children}
        {shouldShowBadge && (
          <span
            style={positionedBadgeStyle}
            onClick={clickable || onClick ? handleClick : undefined}
          >
            {!dot && (
              <>
                {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
                {formattedValue}
              </>
            )}
          </span>
        )}
      </div>
    </>
  );
}

RusticBadge.displayName = 'RusticBadge';
