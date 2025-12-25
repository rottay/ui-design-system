/**
 * Avatar - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import type { AvatarProps } from '../types';
import { AVATAR_DEFAULTS, SIZE_MAP } from '../types';

/**
 * Base Avatar component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseAvatar = forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
    const {
      src,
      alt,
      size = AVATAR_DEFAULTS.size!,
      shape = AVATAR_DEFAULTS.shape!,
      icon,
      children,
      onClick,
      className = '',
      style = {},
    } = props;

    const avatarSize = SIZE_MAP[size];
    const borderRadius = shape === 'circle' ? '50%' : 'var(--avatar-radius, 8px)';

    const avatarStyle: React.CSSProperties = {
      '--avatar-size': `${avatarSize}px`,
      '--avatar-radius': borderRadius,
      width: avatarSize,
      height: avatarSize,
      borderRadius,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--avatar-bg, #e0e0e0)',
      color: 'var(--avatar-color, #333)',
      fontSize: `${avatarSize / 2}px`,
      fontWeight: 500,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`rottay-avatar ${className}`}
        style={avatarStyle}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : icon ? (
          icon
        ) : (
          children
        )}
      </div>
    );
  }
);

BaseAvatar.displayName = 'BaseAvatar';
