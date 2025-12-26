/**
 * Avatar - Titan Engine (Ant Design)
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

  // Map variant to background color
  const variantColorMap: Record<string, string> = {
    default: backgroundColor || '#f0f0f0',
    primary: backgroundColor || '#e6f7ff',
    secondary: backgroundColor || '#f0f0ff',
    success: backgroundColor || '#f6ffed',
    warning: backgroundColor || '#fffbe6',
    error: backgroundColor || '#fff1f0',
    gradient: backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  const avatarStyle: React.CSSProperties = {
    backgroundColor: variantColorMap[variant],
    color: textColor,
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
  if (status) {
    const statusColorMap = {
      online: '#52c41a',
      offline: '#d9d9d9',
      away: '#faad14',
      busy: '#ff4d4f',
    };

    return (
      <Badge dot color={statusColorMap[status]} offset={[-5, 5]}>
        {avatar}
      </Badge>
    );
  }

  return avatar;
}

TitanAvatar.displayName = 'TitanAvatar';
