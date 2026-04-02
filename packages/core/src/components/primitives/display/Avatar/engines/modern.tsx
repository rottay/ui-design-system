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
    variant = AVATAR_DEFAULTS.variant,
    name,
    initials,
    status,
    children,
    onClick,
    onError,
    onLoad,
    bordered,
    className = '',
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

  // Map DS variant names to DaisyUI semantic bg classes.
  // The '-content' suffix classes provide automatic contrast text colours.
  const variantBgClass = {
    default: 'bg-neutral',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    gradient: 'bg-gradient-to-br from-primary to-secondary',
  }[variant] || 'bg-neutral';

  const variantTextClass = {
    default: 'text-neutral-content',
    primary: 'text-primary-content',
    secondary: 'text-secondary-content',
    success: 'text-success-content',
    warning: 'text-warning-content',
    error: 'text-error-content',
    gradient: 'text-[var(--ds-avatar-gradient-color)]',
  }[variant] || 'text-neutral-content';

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
  const ringClass = bordered ? 'ring ring-primary ring-offset-base-100 ring-offset-2' : '';

  return (
    <div
      className={containerClass}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      <div
        className={`mask ${maskClass} ${ringClass}`}
        style={{ ...sizeStyle, transition: `var(--ds-avatar-transition)` }}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'avatar'}
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <div
            className={`${variantBgClass} ${variantTextClass} flex items-center justify-center`}
            style={{
              width: '100%',
              height: '100%',
              fontSize: `var(--ds-avatar-${size}-font-size)`,
              fontWeight: `var(--ds-avatar-font-weight)` as any,
              // Ensure initials maintain contrast by using explicit token colors
              // when the variant background is too close to text color
              color: `var(--ds-avatar-${variant}-color)`,
              textShadow: variant === 'gradient' ? '0 1px 2px rgba(0,0,0,0.15)' : undefined,
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
