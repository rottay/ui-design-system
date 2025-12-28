/**
 * @fileoverview Avatar Titan Engine - Rottay Design System
 * @description Ant Design-based avatar implementation with Badge for status.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Avatar and Badge components to provide
 * a full-featured avatar with status indicators.
 *
 * **Implementation Details:**
 * - Uses `antd/Avatar` for the core avatar rendering
 * - Uses `antd/Badge` with dot mode for status indicators
 * - Maps custom shapes to Ant Design's 'circle' | 'square' shapes
 * - Applies variant colors via inline styles
 *
 * **Shape Mapping:**
 * - `circle` → Ant Design `circle`
 * - `square` → Ant Design `square`
 * - `rounded` → Ant Design `square` (with CSS border-radius)
 *
 * **Status Colors:**
 * - `online` → Green (#52c41a)
 * - `offline` → Gray (#d9d9d9)
 * - `away` → Orange (#faad14)
 * - `busy` → Red (#ff4d4f)
 *
 * @example Basic Usage
 * ```tsx
 * import { Avatar } from '@rottay/design-system';
 *
 * <Avatar engine="titan" src="/user.jpg" name="John Doe" />
 * ```
 *
 * @example With Status Badge
 * ```tsx
 * <Avatar
 *   engine="titan"
 *   src="/profile.jpg"
 *   status="online"
 *   size="lg"
 * />
 * ```
 *
 * @see {@link Avatar} for the main component
 * @see {@link https://ant.design/components/avatar} Ant Design Avatar
 * @module TitanAvatar
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Avatar as AntAvatar, Badge } from 'antd';
import type { AvatarProps } from '../../types';
import { AVATAR_DEFAULTS, SIZE_MAP } from '../../types';

/**
 * Generates initials from name or alt text
 */
function getInitials(name?: string, alt?: string): string {
  const text = name || alt || '';
  const parts = text.trim().split(/\s+/);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function TitanAvatar(props: AvatarProps): React.ReactElement {
  const {
    src,
    alt,
    size = AVATAR_DEFAULTS.size,
    shape = AVATAR_DEFAULTS.shape,
    variant = AVATAR_DEFAULTS.variant,
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

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const handleError = () => {
    setImageError(true);
    onError?.(new Error('Failed to load image'));
    return false; // Return false to prevent Ant Design's default error handling
  };

  // Determine display content
  const displayInitials = initials || getInitials(name, alt);

  // Map shape to Ant Design's supported shapes ('circle' | 'square')
  // 'rounded' maps to 'square' (Ant Design applies border-radius via CSS)
  const antShape: 'circle' | 'square' = shape === 'circle' ? 'circle' : 'square';

  // Only apply inline styles if explicitly provided by user
  // Otherwise, let CSS custom properties handle theming via .ant-avatar classes
  const avatarStyle: React.CSSProperties = {
    // Use CSS variables for variant colors - only override if user provides explicit values
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

  // Wrap with status badge if needed
  // Use CSS variables for status colors
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

TitanAvatar.displayName = 'TitanAvatar';
