/**
 * Avatar - Base Component
 * Uses CSS variables from design tokens for consistent styling
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
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
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
      '--avatar-size': `var(--avatar-${size}-size)`,
      '--avatar-font-size': `var(--avatar-${size}-font-size)`,
      '--avatar-border-width': bordered ? `var(--avatar-${size}-border-width)` : '0',
      '--avatar-bg': backgroundColor || `var(--avatar-${variant}-bg)`,
      '--avatar-color': textColor || `var(--avatar-${variant}-color)`,
      '--avatar-border-color': bordered ? `var(--avatar-${variant}-border-color)` : 'transparent',
      '--avatar-shape': shape === 'circle' ? 'var(--avatar-circle-radius)' :
                       shape === 'square' ? 'var(--avatar-square-radius)' :
                       'var(--avatar-rounded-radius)',
      '--avatar-ring-color': ringColor || 'var(--avatar-focus-ring-color)',
    } as React.CSSProperties;

    // Computed styles
    const containerStyle: React.CSSProperties = {
      ...avatarVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--avatar-size)',
      height: 'var(--avatar-size)',
      borderRadius: 'var(--avatar-shape)',
      backgroundColor: 'var(--avatar-bg)',
      color: 'var(--avatar-color)',
      fontSize: 'var(--avatar-font-size)',
      fontWeight: 500,
      overflow: 'hidden',
      border: 'var(--avatar-border-width) solid var(--avatar-border-color)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'var(--avatar-transition)',
      outline: ring ? '2px solid var(--avatar-ring-color)' : 'none',
      outlineOffset: ring ? '2px' : '0',
      ...style,
    };

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'var(--avatar-image-object-fit)' as any,
      objectPosition: 'var(--avatar-image-object-position)',
    };

    const statusIndicatorStyle: React.CSSProperties = status ? {
      position: 'absolute',
      bottom: 'var(--avatar-status-offset)',
      right: 'var(--avatar-status-offset)',
      width: `var(--avatar-${size}-status-size)`,
      height: `var(--avatar-${size}-status-size)`,
      borderRadius: '50%',
      backgroundColor: `var(--avatar-status-${status}-color)`,
      border: 'var(--avatar-status-border-width) solid var(--avatar-status-border-color)',
      zIndex: 1,
    } : undefined;

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
