/**
 * Badge - Apollo Engine (Pure HTML/CSS with CSS Variables)
 */

'use client';

import React from 'react';
import type { BadgeProps } from '../../types';
import { BADGE_DEFAULTS, SIZE_MAP, DOT_SIZE_MAP, VARIANT_COLOR_MAP } from '../../types';

export default function ApolloBadge(props: BadgeProps): React.ReactElement {
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

  // Get display value
  const displayValue = content !== undefined ? content : count;

  // Format count
  const formattedValue = (() => {
    if (displayValue === undefined) return undefined;
    if (typeof displayValue === 'string') return displayValue;
    return displayValue > max! ? `${max}+` : displayValue;
  })();

  // Determine if badge should be visible
  const shouldShowBadge = visible && (
    dot ||
    (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero))
  );

  // Get size and color values
  const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  // Build CSS variables
  const cssVars: React.CSSProperties = {
    '--badge-bg': color,
    '--badge-color': '#ffffff',
    '--badge-min-width': `${sizeValues.minWidth}px`,
    '--badge-height': `${sizeValues.height}px`,
    '--badge-font-size': `${sizeValues.fontSize}px`,
    '--badge-dot-size': `${dotSize}px`,
    '--badge-border-radius': radius === 'full' ? '9999px' :
                             radius === 'lg' ? '8px' :
                             radius === 'md' ? '4px' :
                             radius === 'sm' ? '2px' : '0',
  } as React.CSSProperties;

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    'top-left': { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    'bottom-right': { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
    'bottom-left': { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
  };

  // Badge style variations
  const getStyleVariation = (): React.CSSProperties => {
    switch (badgeStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--badge-bg)',
          border: '1px solid var(--badge-bg)',
        };
      case 'soft':
        return {
          backgroundColor: `${color}26`, // 15% opacity
          color: 'var(--badge-bg)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--badge-bg)',
        };
      default: // solid
        return {
          backgroundColor: 'var(--badge-bg)',
          color: 'var(--badge-color)',
        };
    }
  };

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Badge indicator base style
  const badgeIndicatorStyle: React.CSSProperties = {
    ...cssVars,
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
    boxShadow: bordered ? `0 0 0 1px ${color}` : 'none',
    cursor: clickable || onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    userSelect: 'none',
    ...getStyleVariation(),
  };

  // Pulse animation
  const pulseAnimation = pulse ? {
    animation: 'badge-pulse 1.5s ease-in-out infinite',
  } : {};

  // If no children, render standalone badge
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

  // Container style
  const containerStyle: React.CSSProperties = {
    ...cssVars,
    position: 'relative',
    display: 'inline-flex',
    ...style,
  };

  // Positioned badge style
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

ApolloBadge.displayName = 'ApolloBadge';
