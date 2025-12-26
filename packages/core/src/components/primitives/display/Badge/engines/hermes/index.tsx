/**
 * Badge - Hermes Engine (DaisyUI)
 */

'use client';

import React from 'react';
import type { BadgeProps } from '../../types';
import { BADGE_DEFAULTS, DOT_SIZE_MAP } from '../../types';

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
    // radius - not used in DaisyUI, uses default rounded styles
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

  // Map our variants to DaisyUI badge classes
  const variantClassMap: Record<string, string> = {
    default: 'badge-neutral',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  // Map sizes to DaisyUI classes
  const sizeClassMap: Record<string, string> = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
    xl: 'badge-lg',
  };

  // Map badge style to DaisyUI classes
  const styleClassMap: Record<string, string> = {
    solid: '',
    outline: 'badge-outline',
    soft: 'badge-ghost',
    ghost: 'badge-ghost',
  };

  const variantClass = variantClassMap[variant!] || 'badge-neutral';
  const sizeClass = sizeClassMap[size!] || 'badge-md';
  const styleClass = styleClassMap[badgeStyle!] || '';

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Build badge classes
  const badgeClasses = [
    'badge',
    variantClass,
    sizeClass,
    styleClass,
    bordered ? 'ring ring-offset-2 ring-offset-base-100' : '',
    clickable || onClick ? 'cursor-pointer hover:opacity-80' : '',
    pulse ? 'animate-pulse' : '',
  ].filter(Boolean).join(' ');

  // Position classes for indicator
  const positionClassMap: Record<string, string> = {
    'top-right': 'indicator-top indicator-end',
    'top-left': 'indicator-top indicator-start',
    'bottom-right': 'indicator-bottom indicator-end',
    'bottom-left': 'indicator-bottom indicator-start',
  };
  const positionClass = positionClassMap[position!] || 'indicator-top indicator-end';

  // If no children, render as standalone badge
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

  // If no badge to show, just render children
  if (!shouldShowBadge) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Render with indicator
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
