/**
 * @fileoverview Classic engine for the Avatar component, backed by Ant Design.
 * Wraps antd Avatar + Badge to provide image/initials display with optional
 * status indicators, delegating shape and sizing to Ant Design internals.
 *
 * @example
 * ```tsx
 * <Avatar engine="classic" src="/user.jpg" name="John Doe" status="online" />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Avatar as AntAvatar, Badge } from 'antd';
import type { AvatarProps } from '../Avatar.types';
import { AVATAR_DEFAULTS, SIZE_MAP, TONE_TO_AVATAR_VARIANT } from '../Avatar.types';

/**
 * Derives up to two uppercase initials from a display name or alt text.
 * Uses first and last word so "John Michael Doe" produces "JD", not "JM".
 *
 * @param name - Primary display name
 * @param alt - Fallback alt text if name is absent
 * @returns One or two uppercase characters, or empty string
 */
function getInitials(name?: string, alt?: string): string {
  const text = name || alt || '';
  const parts = text.trim().split(/\s+/);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Take first + last word to handle multi-word names gracefully
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Classic (Ant Design) implementation of the Avatar component.
 *
 * Delegates rendering to antd's Avatar for image/initials and wraps with
 * antd's Badge (dot mode) when a status indicator is requested. Variant
 * colours are driven by CSS custom properties so tenant theming applies
 * without runtime recalculation.
 *
 * @param props - Unified AvatarProps from the design system type contract
 * @returns A React element containing the Ant Design avatar, optionally wrapped in a Badge
 */
export default function ClassicAvatar(props: AvatarProps): React.ReactElement {
  const {
    src,
    alt,
    size = AVATAR_DEFAULTS.size,
    shape = AVATAR_DEFAULTS.shape,
    tone,
    variant: variantProp = AVATAR_DEFAULTS.variant,
    name,
    initials,
    status,
    children,
    onClick,
    onError,
    onLoad: _onLoad,
    backgroundColor,
    textColor,
    className,
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; the
  // --ds-avatar-{variant}-* tokens below are keyed by the same internal name either way.
  const variant = tone ? TONE_TO_AVATAR_VARIANT[tone] : variantProp;

  // Track image load failures so we can fall back to initials/children
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever the src URL changes, giving the new image a chance to load
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Return false to suppress Ant Design's built-in broken-image fallback;
  // we handle the fallback ourselves via initials/children rendering below
  const handleError = () => {
    setImageError(true);
    onError?.(new Error('Failed to load image'));
    return false;
  };

  // Explicit initials prop wins; otherwise derive from name/alt text
  const displayInitials = initials || getInitials(name, alt);

  // Ant Design only supports 'circle' | 'square'; our 'rounded' shape maps to
  // 'square' because Ant Design handles rounded corners via its own CSS class
  const antShape: 'circle' | 'square' = shape === 'circle' ? 'circle' : 'square';

  // CSS custom properties (--ds-avatar-*) enable tenant-level theming.
  // Explicit backgroundColor/textColor props let consumers override per-instance.
  const avatarStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || `var(--ds-avatar-${variant}-bg)`,
    color: textColor || `var(--ds-avatar-${variant}-color)`,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  // Build the avatar
  const avatar = (
    <AntAvatar
      src={!imageError ? src : undefined}
      alt={alt || name}
      size={SIZE_MAP[size]}
      shape={antShape}
      onClick={onClick}
      className={className}
      style={avatarStyle}
      onError={handleError}
    >
      {!src || imageError ? displayInitials || children : null}
    </AntAvatar>
  );

  // Wrap avatar in an antd Badge (dot mode) when a status is set.
  // Status colours come from CSS custom properties for tenant theming.
  if (status) {
    return (
      <Badge
        dot
        color={`var(--ds-avatar-status-${status})`}
        offset={[-5, 5]}
      >
        {avatar}
      </Badge>
    );
  }

  return avatar;
}

ClassicAvatar.displayName = 'ClassicAvatar';
