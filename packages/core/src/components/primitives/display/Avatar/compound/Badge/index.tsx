/**
 * @fileoverview Avatar.Badge compound component.
 * Renders a small status indicator dot on the corner of a parent Avatar.
 * Accessed via `Avatar.Badge` dot-notation in consumer code.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';

/** Supported presence/status values for the badge indicator. */
export type BadgeStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarBadgeProps {
  /** The Avatar element (or other content) that the badge wraps. */
  children: ReactNode;
  /** Presence status -- controls the badge color via STATUS_COLORS. */
  status?: BadgeStatus;
  /** When true, renders a smaller 10px dot; when false, renders a 14px dot. */
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Maps each status value to the corresponding design-system CSS variable.
 * Colors are intentionally sourced from semantic tokens so they adapt to themes.
 */
const STATUS_COLORS: Record<BadgeStatus, string> = {
  online: 'var(--ds-color-success)',
  offline: 'var(--ds-color-border-secondary)',
  busy: 'var(--ds-color-error)',
  away: 'var(--ds-color-warning)',
};

/**
 * Avatar.Badge -- overlays a colored status dot on the bottom-right corner
 * of an Avatar to indicate user presence (online, offline, busy, away).
 *
 * The badge wraps its children in a `position: relative` container and
 * absolutely positions the dot at the bottom-right. A 2px border matching
 * the page background creates visual separation from the avatar image.
 *
 * @param props - {@link AvatarBadgeProps}
 * @returns A wrapper element with the status dot overlaid on the children.
 *
 * @example
 * ```tsx
 * <Avatar.Badge status="online">
 *   <Avatar src="/user.jpg" name="Jane Doe" />
 * </Avatar.Badge>
 * ```
 */
export function AvatarBadge({
  children,
  status = 'online',
  dot = true,
  className = '',
  style,
}: AvatarBadgeProps): React.ReactElement {
  // Relative container so the badge dot can be absolutely positioned.
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  // The dot is sized based on the `dot` prop: 10px for a subtle indicator,
  // 14px for a larger, more prominent one. The 2px border provides a
  // "cut-out" effect that visually separates the dot from the avatar.
  const badgeStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: dot ? '10px' : '14px',
    height: dot ? '10px' : '14px',
    borderRadius: '50%',
    backgroundColor: STATUS_COLORS[status],
    border: '2px solid var(--ds-avatar-badge-border, var(--ds-color-bg-primary))',
  };

  return (
    <div className={`rottay-avatar-badge ${className}`} style={containerStyle}>
      {children}
      {/* aria-label exposes the status to assistive technologies */}
      <span
        className="rottay-avatar-badge-dot"
        style={badgeStyle}
        aria-label={`Status: ${status}`}
      />
    </div>
  );
}

AvatarBadge.displayName = 'Avatar.Badge';
