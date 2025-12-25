/**
 * Avatar.Badge - Compound Component
 * Adds a status badge to an avatar
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

export type BadgeStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarBadgeProps {
  children: ReactNode;
  status?: BadgeStatus;
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}

const STATUS_COLORS: Record<BadgeStatus, string> = {
  online: '#52c41a',
  offline: '#d9d9d9',
  busy: '#ff4d4f',
  away: '#faad14',
};

export function AvatarBadge({
  children,
  status = 'online',
  dot = true,
  className = '',
  style,
}: AvatarBadgeProps): React.ReactElement {
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  const badgeStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: dot ? '10px' : '14px',
    height: dot ? '10px' : '14px',
    borderRadius: '50%',
    backgroundColor: STATUS_COLORS[status],
    border: '2px solid var(--avatar-badge-border, #fff)',
  };

  return (
    <div className={`rottay-avatar-badge ${className}`} style={containerStyle}>
      {children}
      <span
        className="rottay-avatar-badge-dot"
        style={badgeStyle}
        aria-label={`Status: ${status}`}
      />
    </div>
  );
}

AvatarBadge.displayName = 'Avatar.Badge';
