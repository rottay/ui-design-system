/**
 * @fileoverview Avatar.Badge compound component.
 * Renders a small status indicator dot on the corner of a parent Avatar.
 * Accessed via `Avatar.Badge` dot-notation in consumer code.
 */

'use client';

import React from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Supported presence/status values for the badge indicator. */
export type BadgeStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarBadgeProps {
  /** The Avatar element (or other content) that the badge wraps. */
  children: ReactNode;
  /** Presence status -- reaches the DOM as data-status, which the skin colours. */
  status?: BadgeStatus;
  /** When true, renders a smaller 10px dot; when false, renders a 14px dot. */
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}

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
  const i18n = useOptionalTranslation('components');
  // Relative container so the badge dot can be absolutely positioned.
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  };

  // The dot is sized based on the `dot` prop: 10px for a subtle indicator,
  // 14px for a larger, more prominent one (both tenant-tunable channels). Its
  // fill and the 2px cut-out frame that separates it from the avatar are painted
  // by foundation/tokens/css/presentation/components/skin/avatar-compounds.css,
  // keyed on the data-status stamp. Positioning is logical: the dot rides the
  // inline-end corner in both writing directions.
  const badgeStyle: CSSProperties = {
    position: 'absolute',
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    width: dot ? 'var(--ds-avatar-badge-dot-size, 10px)' : 'var(--ds-avatar-badge-size, 14px)',
    height: dot ? 'var(--ds-avatar-badge-dot-size, 10px)' : 'var(--ds-avatar-badge-size, 14px)',
  };

  return (
    <div className={`rottay-avatar-badge ${className}`} data-part="anchor" style={containerStyle}>
      {children}
      {/* aria-label exposes the status to assistive technologies; the catalogue
          carries the localized status names, with the legacy English template as
          the provider-less fallback. */}
      <span
        className="rottay-avatar-badge-dot"
        data-part="dot"
        data-status={status}
        style={badgeStyle}
        aria-label={i18n ? i18n.t(`avatar.status.${status}`) : `Status: ${status}`}
      />
    </div>
  );
}

AvatarBadge.displayName = 'Avatar.Badge';
