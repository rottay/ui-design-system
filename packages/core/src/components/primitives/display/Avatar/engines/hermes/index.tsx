/**
 * @fileoverview Avatar Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based avatar with mask utilities.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's avatar component with mask classes for
 * shape styling and Tailwind utilities for colors.
 *
 * **Implementation Details:**
 * - Uses DaisyUI `avatar` class for container
 * - Uses DaisyUI `mask-*` classes for shape styling
 * - Uses Tailwind `bg-*` and `text-*-content` for variant colors
 * - Uses `ring` utilities for bordered style
 *
 * **Mask Classes:**
 * - `circle` → `mask-circle`
 * - `square` → `mask-squircle`
 * - `rounded` → `mask-squircle`
 *
 * **Variant Mapping:**
 * - Uses DaisyUI semantic colors (primary, secondary, success, etc.)
 * - Automatically applies `-content` text color for contrast
 * - Gradient variant uses `bg-gradient-to-br`
 *
 * **Ring Support:**
 * - Uses Tailwind `ring` utilities
 * - Includes `ring-offset-base-100` for proper spacing
 *
 * @example Basic Usage
 * ```tsx
 * import { Avatar } from '@rottay/design-system';
 *
 * <Avatar engine="hermes" src="/user.jpg" name="Jane Doe" />
 * ```
 *
 * @example With DaisyUI Styling
 * ```tsx
 * <Avatar
 *   engine="hermes"
 *   name="JD"
 *   variant="primary"
 *   bordered
 *   status="online"
 * />
 * ```
 *
 * @see {@link Avatar} for the main component
 * @see {@link https://daisyui.com/components/avatar/} DaisyUI Avatar
 * @module HermesAvatar
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

export default function HermesAvatar(props: AvatarProps): React.ReactElement {
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

  // DaisyUI mask classes
  const maskClass = shape === 'circle' ? 'mask-circle' :
                    shape === 'square' ? 'mask-squircle' :
                    'mask-squircle';

  // Use CSS variables for sizing
  const sizeStyle = {
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
  };

  // Variant to DaisyUI color classes
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
    gradient: 'text-white',
  }[variant] || 'text-neutral-content';

  // Status indicator color
  const statusColor = status ? {
    online: 'bg-success',
    offline: 'bg-neutral',
    away: 'bg-warning',
    busy: 'bg-error',
  }[status] : undefined;

  const containerClass = `avatar ${status ? 'online' : ''} ${className}`;
  const ringClass = bordered ? 'ring ring-primary ring-offset-base-100 ring-offset-2' : '';

  return (
    <div
      className={containerClass}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      <div
        className={`mask ${maskClass} ${ringClass}`}
        style={sizeStyle}
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
            className={`${variantBgClass} ${variantTextClass} flex items-center justify-center font-medium`}
            style={{
              width: '100%',
              height: '100%',
              fontSize: `var(--ds-avatar-${size}-font-size)`,
            }}
          >
            {displayInitials || children}
          </div>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusColor} border-2 border-white rounded-full`}
          style={{
            width: 'var(--ds-avatar-status-size)',
            height: 'var(--ds-avatar-status-size)',
            transform: 'translate(25%, 25%)',
          }}
        />
      )}
    </div>
  );
}

HermesAvatar.displayName = 'HermesAvatar';
