/**
 * @fileoverview Avatar Rustic Engine - Rottay Design System
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
 * <Avatar engine="rustic" src="/user.jpg" name="John Doe" />
 * ```
 *
 * @example Custom Colors
 * ```tsx
 * <Avatar
 *   engine="rustic"
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
 * @module RusticAvatar
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { AvatarProps } from '../../types';
import { AVATAR_DEFAULTS } from '../../types';

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

export default function RusticAvatar(props: AvatarProps): React.ReactElement {
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

  const displayInitials = initials || getInitials(name, alt);

  // Use CSS custom properties for all visual styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
    borderRadius: shape === 'circle'
      ? 'var(--ds-avatar-radius-circle)'
      : shape === 'square'
        ? 'var(--ds-avatar-radius-square)'
        : 'var(--ds-avatar-radius-rounded)',
    overflow: 'hidden',
    background: backgroundColor || `var(--ds-avatar-${variant}-bg)`,
    color: textColor || `var(--ds-avatar-${variant}-color)`,
    fontSize: `var(--ds-avatar-${size}-font-size)`,
    fontWeight: 'var(--ds-avatar-font-weight)' as any,
    cursor: onClick ? 'pointer' : undefined,
    border: bordered
      ? 'var(--ds-avatar-border-width) solid var(--ds-avatar-border-color)'
      : 'none',
    outline: ring
      ? `var(--ds-avatar-ring-width) solid ${ringColor || 'var(--ds-avatar-ring-color)'}`
      : 'none',
    outlineOffset: ring ? 'var(--ds-avatar-ring-offset)' : '0',
    transition: 'var(--ds-avatar-transition)',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const statusStyle: React.CSSProperties = status ? {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 'var(--ds-avatar-status-size)',
    height: 'var(--ds-avatar-status-size)',
    borderRadius: '50%',
    backgroundColor: `var(--ds-avatar-status-${status})`,
    border: 'var(--ds-avatar-status-border-width) solid var(--ds-avatar-status-border)',
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

RusticAvatar.displayName = 'RusticAvatar';
