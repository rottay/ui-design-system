/**
 * @fileoverview Avatar Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS avatar implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free avatar using
 * only inline styles and standard HTML elements.
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Computes sizes from SIZE_MAP constants
 * - Handles image loading and fallback to initials
 * - Supports all variant colors with gradient option
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full control over styles
 *
 * **Variant Colors:**
 * - Each variant has predefined `bg` and `color` values
 * - Gradient variant uses CSS `linear-gradient`
 * - Custom colors via `backgroundColor` and `textColor` props
 *
 * **Status Indicator:**
 * - Positioned absolute at bottom-right
 * - Size scales with avatar (25% of avatar size, min 8px)
 * - White border for separation from avatar
 *
 * @example Basic Usage
 * ```tsx
 * import { Avatar } from '@rottay/design-system';
 *
 * <Avatar engine="apollo" src="/user.jpg" name="John Doe" />
 * ```
 *
 * @example Custom Colors
 * ```tsx
 * <Avatar
 *   engine="apollo"
 *   name="JD"
 *   backgroundColor="#1a1a2e"
 *   textColor="#eaeaea"
 *   ring
 *   ringColor="#00ff88"
 * />
 * ```
 *
 * @see {@link Avatar} for the main component
 * @see {@link BaseAvatar} for CSS variable implementation
 * @module ApolloAvatar
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect } from 'react';
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

export default function ApolloAvatar(props: AvatarProps): React.ReactElement {
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
    onLoad,
    backgroundColor,
    textColor,
    ring,
    ringColor,
    bordered,
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
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const sizeValue = SIZE_MAP[size];
  const displayInitials = initials || getInitials(name, alt);

  // Variant color mapping
  const variantColors = {
    default: { bg: '#f0f0f0', color: '#333333' },
    primary: { bg: '#e6f7ff', color: '#0066cc' },
    secondary: { bg: '#f0f0ff', color: '#6b6bd4' },
    success: { bg: '#f6ffed', color: '#22c55e' },
    warning: { bg: '#fffbe6', color: '#f59e0b' },
    error: { bg: '#fff1f0', color: '#ef4444' },
    gradient: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#ffffff' },
  };

  const colors = variantColors[variant] || variantColors.default;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeValue,
    height: sizeValue,
    borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px',
    overflow: 'hidden',
    background: backgroundColor || colors.bg,
    color: textColor || colors.color,
    fontSize: sizeValue * 0.4,
    fontWeight: 500,
    cursor: onClick ? 'pointer' : undefined,
    border: bordered ? '2px solid rgba(0,0,0,0.1)' : 'none',
    outline: ring ? `2px solid ${ringColor || '#0066cc'}` : 'none',
    outlineOffset: ring ? '2px' : '0',
    transition: 'all 0.2s ease-in-out',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const statusColors = {
    online: '#52c41a',
    offline: '#d9d9d9',
    away: '#faad14',
    busy: '#ff4d4f',
  };

  const statusStyle: React.CSSProperties = status ? {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: Math.max(sizeValue * 0.25, 8),
    height: Math.max(sizeValue * 0.25, 8),
    borderRadius: '50%',
    backgroundColor: statusColors[status],
    border: '2px solid white',
    transform: 'translate(15%, 15%)',
  } : {};

  return (
    <div className={className} style={containerStyle} onClick={onClick}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'avatar'}
          style={imageStyle}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <span style={{ userSelect: 'none' }}>
          {displayInitials || children}
        </span>
      )}

      {status && <span style={statusStyle} />}
    </div>
  );
}

ApolloAvatar.displayName = 'ApolloAvatar';
