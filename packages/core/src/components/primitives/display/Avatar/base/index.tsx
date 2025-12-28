/**
 * @fileoverview Avatar Base Component - Rottay Design System
 * @description Core avatar implementation with CSS variables for theming.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The BaseAvatar provides a full-featured avatar with CSS variable support.
 * It handles image loading, error fallback to initials, status indicators,
 * and all visual customization options.
 *
 * **Component Structure:**
 * - Container div with role and aria attributes
 * - Image element (if src provided and loaded)
 * - Initials span (fallback when no image)
 * - Status indicator (if status provided)
 *
 * **CSS Variable Integration:**
 * - `--avatar-size` - Avatar dimensions
 * - `--avatar-font-size` - Initials font size
 * - `--avatar-border-width` - Border thickness
 * - `--avatar-bg` - Background color
 * - `--avatar-color` - Text color
 * - `--avatar-border-color` - Border color
 * - `--avatar-shape` - Border radius
 * - `--avatar-ring-color` - Ring outline color
 *
 * **Initials Generation:**
 * Automatically generates initials from name or alt:
 * - "John Doe" → "JD"
 * - "Alice" → "A"
 * - "Mary Jane Watson" → "MW"
 *
 * @example Using BaseAvatar
 * ```tsx
 * import { BaseAvatar } from '@rottay/design-system';
 *
 * <BaseAvatar
 *   src="/profile.jpg"
 *   name="John Doe"
 *   size="lg"
 *   shape="circle"
 *   status="online"
 * />
 * ```
 *
 * @see {@link Avatar} for the engine-routed component
 * @module BaseAvatar
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import type { AvatarProps } from '../types';
import { AVATAR_DEFAULTS } from '../types';

/**
 * Generates initials from name or alt text
 */
function getInitials(name?: string, alt?: string): string {
  const text = name || alt || '';
  const parts = text.trim().split(/\s+/);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Take first letter of first and last word
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Base Avatar component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseAvatar = forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
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
      className = '',
      style = {},
    } = props;

    const [imageError, setImageError] = useState(false);
    const [_imageLoaded, setImageLoaded] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    const handleImageError = (_e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true);
      onError?.(new Error('Failed to load image'));
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      onLoad?.();
    };

    // Determine what to display
    const displayInitials = initials || getInitials(name, alt);
    const showImage = src && !imageError;
    const showInitials = !showImage && displayInitials;

    // Build CSS variables for the avatar
    const avatarVars: React.CSSProperties = {
      '--ds-avatar-size': `var(--ds-avatar-${size}-size)`,
      '--ds-avatar-font-size': `var(--ds-avatar-${size}-font-size)`,
      '--ds-avatar-border-width': bordered ? `var(--ds-avatar-${size}-border-width)` : '0',
      '--ds-avatar-bg': backgroundColor || `var(--ds-avatar-${variant}-bg)`,
      '--ds-avatar-color': textColor || `var(--ds-avatar-${variant}-color)`,
      '--ds-avatar-border-color': bordered ? `var(--ds-avatar-${variant}-border-color)` : 'transparent',
      '--ds-avatar-shape': shape === 'circle' ? 'var(--ds-avatar-circle-radius)' :
                       shape === 'square' ? 'var(--ds-avatar-square-radius)' :
                       'var(--ds-avatar-rounded-radius)',
      '--ds-avatar-ring-color': ringColor || 'var(--ds-avatar-focus-ring-color)',
    } as React.CSSProperties;

    // Computed styles
    const containerStyle: React.CSSProperties = {
      ...avatarVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--ds-avatar-size)',
      height: 'var(--ds-avatar-size)',
      borderRadius: 'var(--ds-avatar-shape)',
      backgroundColor: 'var(--ds-avatar-bg)',
      color: 'var(--ds-avatar-color)',
      fontSize: 'var(--ds-avatar-font-size)',
      fontWeight: 500,
      overflow: 'hidden',
      border: 'var(--ds-avatar-border-width) solid var(--ds-avatar-border-color)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'var(--ds-avatar-transition)',
      outline: ring ? '2px solid var(--ds-avatar-ring-color)' : 'none',
      outlineOffset: ring ? '2px' : '0',
      ...style,
    };

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'var(--ds-avatar-image-object-fit, cover)' as any,
      objectPosition: 'var(--ds-avatar-image-object-position, center)',
    };

    const statusIndicatorStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: 'var(--ds-avatar-status-offset)',
      right: 'var(--ds-avatar-status-offset)',
      width: `var(--ds-avatar-${size}-status-size)`,
      height: `var(--ds-avatar-${size}-status-size)`,
      borderRadius: '50%',
      backgroundColor: `var(--ds-avatar-status-${status}-color)`,
      border: 'var(--ds-avatar-status-border-width) solid var(--ds-avatar-status-border-color)',
      zIndex: 1,
    };

    return (
      <div
        ref={ref}
        className={`rottay-avatar rottay-avatar--${size} rottay-avatar--${shape} rottay-avatar--${variant} ${className}`}
        style={containerStyle}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={alt || name}
      >
        {showImage && (
          <img
            src={src}
            alt={alt || name || 'avatar'}
            style={imageStyle}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}

        {!showImage && showInitials && (
          <span className="rottay-avatar__initials">
            {displayInitials}
          </span>
        )}

        {!showImage && !showInitials && children}

        {status && <span className="rottay-avatar__status" style={statusIndicatorStyle} />}
      </div>
    );
  }
);

BaseAvatar.displayName = 'BaseAvatar';
