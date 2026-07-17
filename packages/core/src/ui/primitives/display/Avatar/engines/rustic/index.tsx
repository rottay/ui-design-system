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
import type { AvatarProps } from '../../contracts';
import { AVATAR_DEFAULTS, TONE_TO_AVATAR_VARIANT } from '../../contracts';

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
 * @returns A React element built from native HTML elements and token-backed style objects
 */
export default function RusticAvatar(props: AvatarProps): React.ReactElement {
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
    onLoad,
    backgroundColor,
    textColor,
    ring,
    ringColor,
    bordered,
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

  const handleError = () => {
    setImageError(true);
    onError?.(new Error('Failed to load image'));
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const displayInitials = initials || getInitials(name, alt);

  // Shape, fill, ink, frame and ring are painted by
  // foundation/tokens/css/runtime/engines/rustic/skin/avatar.css, keyed on the data-shape /
  // data-variant / data-bordered / data-ring stamps below. The backgroundColor and
  // ringColor props are caller strings that cannot be enumerated as rules, so they
  // ride custom properties the skin reads with the variant token as the fallback.
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
    overflow: 'hidden',
    fontSize: `var(--ds-avatar-${size}-font-size)`,
    fontWeight: 'var(--ds-avatar-font-weight)' as any,
    cursor: onClick ? 'pointer' : undefined,
    transition: 'var(--ds-avatar-transition)',
    ...(backgroundColor ? ({ '--ds-avatar-custom-bg': backgroundColor } as React.CSSProperties) : {}),
    ...(ringColor ? ({ '--ds-avatar-custom-ring': ringColor } as React.CSSProperties) : {}),
    // An explicit textColor is a caller's value, like `style`: it stays inline and
    // outranks the skin's per-variant ink.
    ...(textColor ? { color: textColor } : {}),
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // Status dot is positioned absolutely at bottom-right; its fill, frame and the
  // translate that overlaps the avatar edge all live in the skin.
  const statusStyle: React.CSSProperties = status ? {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 'var(--ds-avatar-status-size)',
    height: 'var(--ds-avatar-status-size)',
  } : {};

  return (
    <div
      className={`rottay-avatar rottay-avatar--rustic ${className || ''}`.trim()}
      data-part="root"
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-bordered={bordered ? 'true' : undefined}
      data-ring={ring ? 'true' : undefined}
      data-status={status}
      style={containerStyle}
      onClick={onClick}
    >
      {src && !imageError ? (
        <img
          data-part="img"
          src={src}
          alt={alt || name || 'avatar'}
          style={imageStyle}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        // Prevent accidental text selection of initials during click interactions
        <span data-part="fallback" style={{ userSelect: 'none' }}>
          {displayInitials || children}
        </span>
      )}

      {status && <span data-part="status-dot" data-status={status} style={statusStyle} />}
    </div>
  );
}

RusticAvatar.displayName = 'RusticAvatar';
