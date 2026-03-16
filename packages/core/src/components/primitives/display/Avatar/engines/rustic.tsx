/**
 * @fileoverview Rustic engine for the Avatar component, using pure HTML/CSS.
 * Zero external dependencies -- all styling is inline via CSS custom properties,
 * making it the smallest bundle option and fully portable across environments.
 *
 * @example
 * ```tsx
 * <Avatar engine="rustic" name="JD" backgroundColor="#1a1a2e" ring ringColor="#00ff88" />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { AvatarProps } from '../Avatar.types';
import { AVATAR_DEFAULTS } from '../Avatar.types';

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
 * Rustic (pure HTML/CSS) implementation of the Avatar component.
 *
 * Every visual property is expressed via inline styles backed by CSS custom
 * properties (--ds-avatar-*), so tenant theming works without any CSS
 * framework dependency. Supports images, initials fallback, ring outlines,
 * and status indicator dots.
 *
 * @param props - Unified AvatarProps from the design system type contract
 * @returns A React element built entirely from native HTML elements and inline styles
 */
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

  // Track image load failures so we can fall back to initials/children
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever the src URL changes, giving the new image a chance to load
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

  // All visual properties use CSS custom properties (--ds-avatar-*) so the
  // avatar adapts to tenant themes automatically. Explicit backgroundColor /
  // textColor / ringColor props override the token values per-instance.
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
    // Three shape tiers: circle (50%), square (small radius), rounded (medium radius)
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
    // Ring uses CSS outline so it doesn't affect layout (unlike border)
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

  // Status dot is positioned absolutely at bottom-right with a small translate
  // to overlap the avatar edge. White border separates it from the avatar bg.
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
        // Prevent accidental text selection of initials during click interactions
        <span style={{ userSelect: 'none' }}>
          {displayInitials || children}
        </span>
      )}

      {status && <span style={statusStyle} />}
    </div>
  );
}

RusticAvatar.displayName = 'RusticAvatar';
