/**
 * @fileoverview Modern engine for the Avatar component, backed by DaisyUI/Tailwind.
 * Uses DaisyUI mask classes for shape clipping and Tailwind semantic colour
 * utilities for variant styling, keeping the bundle lightweight.
 *
 * @example
 * ```tsx
 * <Avatar engine="modern" src="/user.jpg" name="Jane Doe" variant="primary" bordered />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { AvatarProps } from '../Avatar.types';
import { AVATAR_DEFAULTS, TONE_TO_AVATAR_VARIANT } from '../Avatar.types';

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
 * Modern (DaisyUI) implementation of the Avatar component.
 *
 * Renders avatar content inside a DaisyUI mask container with Tailwind utility
 * classes for variant colours. Status is shown via an absolutely-positioned dot
 * rather than wrapping in a Badge component (unlike the Classic engine).
 *
 * @param props - Unified AvatarProps from the design system type contract
 * @returns A React element using DaisyUI avatar markup
 */
export default function ModernAvatar(props: AvatarProps): React.ReactElement {
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
    bordered,
    className = '',
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; variantBgStyle
  // and variantTextStyle below are keyed by the same internal color-token name either way.
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

  // DaisyUI mask classes clip the avatar into the desired shape.
  // Both 'square' and 'rounded' map to squircle because DaisyUI's squircle
  // provides the expected soft-rounded appearance for non-circular avatars.
  const maskClass = shape === 'circle' ? 'mask-circle' :
                    shape === 'square' ? 'mask-squircle' :
                    'mask-squircle';

  // Dimensions come from CSS custom properties so tenant themes can override sizes
  const sizeStyle = {
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
  };

  // Map DS variant names to inline style objects using DS tokens.
  const variantBgStyle: React.CSSProperties = {
    default: { background: 'var(--ds-surface-panel)' },
    primary: { background: 'var(--ds-color-primary)' },
    secondary: { background: 'var(--ds-color-secondary)' },
    success: { background: 'var(--ds-color-success)' },
    warning: { background: 'var(--ds-color-warning)' },
    error: { background: 'var(--ds-color-error)' },
    gradient: { background: 'linear-gradient(to bottom right, var(--ds-color-primary), var(--ds-color-secondary))' },
  }[variant] || { background: 'var(--ds-surface-panel)' };

  const variantTextStyle: React.CSSProperties = {
    default: { color: 'var(--ds-color-text-inverse)' },
    primary: { color: 'var(--ds-color-text-inverse)' },
    secondary: { color: 'var(--ds-color-text-inverse)' },
    success: { color: 'var(--ds-color-text-inverse)' },
    warning: { color: 'var(--ds-color-text-inverse)' },
    error: { color: 'var(--ds-color-text-inverse)' },
    gradient: { color: 'var(--ds-avatar-gradient-color)' },
  }[variant] || { color: 'var(--ds-color-text-inverse)' };

  // Status indicator uses DS token colours for consistent theming
  const statusTokenColor = status ? {
    online: 'var(--ds-avatar-status-online)',
    offline: 'var(--ds-avatar-status-offline)',
    away: 'var(--ds-avatar-status-away)',
    busy: 'var(--ds-avatar-status-busy)',
  }[status] : undefined;

  // DaisyUI 'online' class on the avatar container enables its built-in status dot
  const containerClass = `avatar ${status ? 'online' : ''} ${className}`;
  // Ring utility provides the bordered outline; ring-offset prevents it from touching the avatar
  const ringClass = bordered ? 'ring ring-offset-2' : '';
  const ringStyle: React.CSSProperties = bordered
    ? { '--tw-ring-color': 'var(--ds-color-primary)', '--tw-ring-offset-color': 'var(--ds-surface-card)' } as React.CSSProperties
    : {};

  return (
    <div
      className={containerClass}
      data-part="root"
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-bordered={bordered ? 'true' : undefined}
      data-status={status}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {/* The real size token lives on THIS child (P-75) -- the container above
          is deliberately left unsized so its shipped 40x40 clip/halo behaviour
          (theme.css:1069) is unchanged by this stamp. */}
      <div
        className={`mask ${maskClass} ${ringClass}`}
        data-part="mask"
        style={{ ...sizeStyle, ...ringStyle, transition: `var(--ds-avatar-transition)` }}
      >
        {src && !imageError ? (
          <img
            data-part="img"
            src={src}
            alt={alt || name || 'avatar'}
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            data-part="fallback"
            style={{
              width: '100%',
              height: '100%',
              // Explicit backgroundColor/textColor props win (e.g. an entity
              // tint-scale tone) and fall back to the variant tokens otherwise.
              background: backgroundColor || variantBgStyle.background,
              fontSize: `var(--ds-avatar-${size}-font-size)`,
              fontWeight: `var(--ds-avatar-font-weight)` as any,
              color: textColor || variantTextStyle.color || `var(--ds-avatar-${variant}-color)`,
              textShadow: variant === 'gradient' ? '0 1px 2px color-mix(in srgb, var(--ds-color-black) 15%, transparent)' : undefined,
            }}
          >
            {displayInitials || children}
          </div>
        )}
      </div>
      {/* Status dot positioned at the bottom-right corner with a themed border
          to visually separate it from the avatar background. Transitions smoothly
          on appear via opacity + scale for a polished status change effect. */}
      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full"
          data-part="status-dot"
          data-status={status}
          style={{
            width: 'var(--ds-avatar-status-size)',
            height: 'var(--ds-avatar-status-size)',
            backgroundColor: statusTokenColor,
            border: 'var(--ds-avatar-status-border-width) solid var(--ds-avatar-status-border)',
            transform: 'translate(25%, 25%)',
            transition: `opacity var(--ds-avatar-transition), transform var(--ds-avatar-transition), background-color var(--ds-avatar-transition)`,
            opacity: 1,
          }}
        />
      )}
    </div>
  );
}

ModernAvatar.displayName = 'ModernAvatar';
