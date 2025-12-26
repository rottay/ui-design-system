/**
 * @fileoverview Badge Hermes Engine Implementation
 * @description DaisyUI/Tailwind-based implementation of the Badge component.
 * Provides a lightweight, utility-first badge using DaisyUI classes
 * with Tailwind CSS for styling.
 * @module components/primitives/display/Badge/engines/hermes
 */

'use client';

import React from 'react';
import type { BadgeProps } from '../../types';
import { BADGE_DEFAULTS, DOT_SIZE_MAP } from '../../types';

/**
 * Hermes (DaisyUI) implementation of the Badge component.
 *
 * This engine uses DaisyUI's badge classes combined with Tailwind utilities
 * to render badges. It's optimized for bundle size and uses utility-first
 * CSS approach for styling.
 *
 * @component
 * @example
 * // Basic badge with count
 * <HermesBadge count={5} variant="primary">
 *   <Avatar />
 * </HermesBadge>
 *
 * @example
 * // Outline style badge
 * <HermesBadge content="New" badgeStyle="outline" variant="success" />
 *
 * @param props - Badge component props
 * @returns React element with DaisyUI Badge
 */
export default function HermesBadge(props: BadgeProps): React.ReactElement {
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

  /**
   * DaisyUI variant class mapping.
   */
  const variantClassMap: Record<string, string> = {
    default: 'badge-neutral',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  /**
   * DaisyUI size class mapping.
   */
  const sizeClassMap: Record<string, string> = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
    xl: 'badge-lg',
  };

  /**
   * DaisyUI style variant class mapping.
   */
  const styleClassMap: Record<string, string> = {
    solid: '',
    outline: 'badge-outline',
    soft: 'badge-ghost',
    ghost: 'badge-ghost',
  };

  const variantClass = variantClassMap[variant!] || 'badge-neutral';
  const sizeClass = sizeClassMap[size!] || 'badge-md';
  const styleClass = styleClassMap[badgeStyle!] || '';

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

  // Build badge class list
  const badgeClasses = [
    'badge',
    variantClass,
    sizeClass,
    styleClass,
    bordered ? 'ring ring-offset-2 ring-offset-base-100' : '',
    clickable || onClick ? 'cursor-pointer hover:opacity-80' : '',
    pulse ? 'animate-pulse' : '',
  ].filter(Boolean).join(' ');

  /**
   * DaisyUI indicator position class mapping.
   */
  const positionClassMap: Record<string, string> = {
    'top-right': 'indicator-top indicator-end',
    'top-left': 'indicator-top indicator-start',
    'bottom-right': 'indicator-bottom indicator-end',
    'bottom-left': 'indicator-bottom indicator-start',
  };
  const positionClass = positionClassMap[position!] || 'indicator-top indicator-end';

  // Render standalone badge (no children)
  if (!children) {
    return (
      <span
        className={`${badgeClasses} ${className}`}
        style={style}
        onClick={clickable || onClick ? handleClick : undefined}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {!dot && formattedValue !== undefined ? formattedValue : props.children}
        {closable && (
          <span
            className="ml-1 cursor-pointer opacity-70 hover:opacity-100"
            onClick={handleClose}
            aria-label="Close badge"
          >
            x
          </span>
        )}
      </span>
    );
  }

  // Return children only if badge should not be shown
  if (!shouldShowBadge) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Render with DaisyUI indicator
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;

  return (
    <div className={`indicator ${className}`} style={style}>
      <span
        className={`indicator-item ${positionClass} ${badgeClasses}`}
        style={dot ? { width: dotSize, height: dotSize, padding: 0, minWidth: 'auto' } : undefined}
        onClick={clickable || onClick ? handleClick : undefined}
      >
        {!dot && (
          <>
            {icon && <span className="mr-1">{icon}</span>}
            {formattedValue}
          </>
        )}
      </span>
      {children}
    </div>
  );
}

HermesBadge.displayName = 'HermesBadge';
