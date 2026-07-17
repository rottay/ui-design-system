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

  // The variant fill and ink are painted by foundation/tokens/css/runtime/engines/modern/skin/avatar.css,
  // keyed on the data-variant stamp below. An explicit backgroundColor prop is a
  // caller's value that cannot be enumerated as a rule, so it rides a custom property
  // the skin reads as the FIRST term of its `background` shorthand -- which is what
  // lets it wipe the gradient variant's image, exactly as the inline shorthand did.
  const customBgStyle = backgroundColor
    ? ({ '--ds-avatar-custom-bg': backgroundColor } as React.CSSProperties)
    : {};

  // DaisyUI 'online' class on the avatar container enables its built-in status dot.
  // P-75: the container is deliberately left unsized and unaltered -- see avatar.css.
  const containerClass = `rottay-avatar rottay-avatar--modern avatar ${status ? 'online' : ''} ${className}`;
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
              ...customBgStyle,
              fontSize: `var(--ds-avatar-${size}-font-size)`,
              fontWeight: `var(--ds-avatar-font-weight)` as any,
              // An explicit textColor is a caller's value, like `style`: it stays
              // inline and outranks the skin's per-variant ink.
              ...(textColor ? { color: textColor } : {}),
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
            transition: `opacity var(--ds-avatar-transition), transform var(--ds-avatar-transition), background-color var(--ds-avatar-transition)`,
            opacity: 1,
          }}
        />
      )}
    </div>
  );
}

ModernAvatar.displayName = 'ModernAvatar';
