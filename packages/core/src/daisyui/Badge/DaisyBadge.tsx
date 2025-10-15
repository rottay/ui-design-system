import React from 'react';
import type { DaisyBadgeProps } from './types';

/**
 * DaisyUI Badge Component
 *
 * A small badge component for labels, tags, and indicators.
 *
 * @example
 * ```tsx
 * <DaisyBadge variant="primary">New</DaisyBadge>
 * <DaisyBadge variant="success" size="lg">Active</DaisyBadge>
 * <DaisyBadge variant="error" outline>Sold Out</DaisyBadge>
 * ```
 */
export const DaisyBadge: React.FC<DaisyBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  outline = false,
  children,
  className = '',
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    size !== 'md' ? `badge-${size}` : '',
    outline ? 'badge-outline' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

DaisyBadge.displayName = 'DaisyBadge';
