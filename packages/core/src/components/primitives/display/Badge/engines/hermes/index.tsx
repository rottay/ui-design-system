/**
 * Badge - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { BadgeProps } from '../types';
import { BADGE_DEFAULTS } from '../types';

export default function HermesBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    count,
    dot,
    variant = BADGE_DEFAULTS.variant,
    size = BADGE_DEFAULTS.size,
    showZero = BADGE_DEFAULTS.showZero,
    maxCount = BADGE_DEFAULTS.maxCount,
    className = '',
    style,
  } = props;

  // Map our variants to DaisyUI badge classes
  const variantClassMap: Record<string, string> = {
    default: 'badge-neutral',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  const sizeClassMap: Record<string, string> = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  const variantClass = variantClassMap[variant!] || '';
  const sizeClass = sizeClassMap[size!] || '';

  // If no count or dot, render as standalone badge
  if (count === undefined && !dot) {
    return (
      <span className={`badge ${variantClass} ${sizeClass} ${className}`} style={style}>
        {children}
      </span>
    );
  }

  // Display count value
  const displayCount =
    count !== undefined && count > maxCount! ? `${maxCount}+` : count;
  const shouldShowBadge = dot || (count !== undefined && (count > 0 || showZero));

  return (
    <div className={`indicator ${className}`} style={style}>
      {shouldShowBadge && (
        <span
          className={`indicator-item badge ${variantClass} ${sizeClass}`}
          style={dot ? { width: '8px', height: '8px', padding: 0 } : undefined}
        >
          {!dot && displayCount}
        </span>
      )}
      {children}
    </div>
  );
}
