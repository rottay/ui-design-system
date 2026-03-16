/**
 * @fileoverview Modern engine for the Badge component, backed by DaisyUI/Tailwind.
 * Uses DaisyUI badge + indicator classes for utility-first badge rendering,
 * with Tailwind animate-pulse for the pulse animation effect.
 *
 * @example
 * ```tsx
 * <Badge engine="modern" count={5} variant="primary"><Avatar /></Badge>
 * ```
 */

'use client';

import React from 'react';
import type { BadgeProps } from '../Badge.types';
import { BADGE_DEFAULTS, DOT_SIZE_MAP } from '../Badge.types';

/**
 * Modern (DaisyUI) implementation of the Badge component.
 *
 * Three render paths: standalone badge (no children), hidden badge (visibility
 * check fails), and indicator-wrapped badge (positioned over children via
 * DaisyUI's indicator utility classes).
 *
 * @param props - Unified BadgeProps from the design system type contract
 * @returns React element using DaisyUI badge/indicator markup
 */
export default function ModernBadge(props: BadgeProps): React.ReactElement {
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

  // `content` (string/ReactNode) takes precedence over numeric `count`
  const displayValue = content !== undefined ? content : count;

  /**
   * Format count with overflow handling.
   */
  const formattedValue = (() => {
    if (displayValue === undefined) return undefined;
    if (typeof displayValue === 'string') return displayValue;
    return displayValue > max! ? `${max}+` : displayValue;
  })();

  // Badge is hidden when visible=false, or when there is no dot and the count
  // is zero (unless showZero is set). This avoids rendering an empty indicator.
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

  // Assemble the full DaisyUI class string from variant, size, style, and state modifiers
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

  // Standalone path: render the badge as an inline tag without indicator wrapper
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

  // When the badge should be hidden, render children without any indicator overlay
  if (!shouldShowBadge) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Indicator path: wrap children in DaisyUI indicator container with positioned badge
  const dotSize = DOT_SIZE_MAP[size!] || DOT_SIZE_MAP.md;

  return (
    <div className={`indicator ${className}`} style={style}>
      <span
        className={`indicator-item ${positionClass} ${badgeClasses}`}
        style={dot ? { width: dotSize, height: dotSize, padding: 0, minWidth: 'auto' } as React.CSSProperties : undefined}
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

ModernBadge.displayName = 'ModernBadge';
