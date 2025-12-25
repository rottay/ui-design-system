/**
 * Badge - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { BadgeProps } from '../types';
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP } from '../types';

export default function ApolloBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    count,
    dot,
    variant = BADGE_DEFAULTS.variant,
    size = BADGE_DEFAULTS.size,
    showZero = BADGE_DEFAULTS.showZero,
    maxCount = BADGE_DEFAULTS.maxCount,
    className,
    style,
  } = props;

  const color = VARIANT_COLOR_MAP[variant!];

  const sizeMap = {
    sm: { fontSize: '10px', padding: '0 4px', minWidth: '16px', height: '16px' },
    md: { fontSize: '12px', padding: '0 6px', minWidth: '20px', height: '20px' },
    lg: { fontSize: '14px', padding: '0 8px', minWidth: '24px', height: '24px' },
  };

  // If no count or dot, render as standalone badge
  if (count === undefined && !dot) {
    const badgeStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      color: '#fff',
      borderRadius: '12px',
      fontWeight: 500,
      ...sizeMap[size!],
      ...style,
    };

    return (
      <span className={className} style={badgeStyle}>
        {children}
      </span>
    );
  }

  // Display count value
  const displayCount =
    count !== undefined && count > maxCount! ? `${maxCount}+` : count;
  const shouldShowBadge = dot || (count !== undefined && (count > 0 || showZero));

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color,
    color: '#fff',
    borderRadius: dot ? '50%' : '12px',
    fontWeight: 500,
    border: '2px solid #fff',
    ...(dot
      ? { width: '8px', height: '8px', padding: 0 }
      : sizeMap[size!]),
  };

  return (
    <div className={className} style={containerStyle}>
      {shouldShowBadge && (
        <span style={badgeStyle}>{!dot && displayCount}</span>
      )}
      {children}
    </div>
  );
}
