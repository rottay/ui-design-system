/**
 * @fileoverview Modern engine for the Avatar component, painted by the modern skin.
 * All shape, clip, fill, ink, ring and status paint lives in
 * `foundation/tokens/css/runtime/engines/modern/skin/avatar.css`, keyed on the
 * `rottay-avatar rottay-avatar--modern` scope and the `data-*` contract stamped
 * below. No DaisyUI mask/avatar classes and no Tailwind utilities are used: the
 * skin owns the corner grammar so identical markup cannot fork between apps that
 * compile different utility sets.
 *
 * @example
 * ```tsx
 * <Avatar engine="modern" src="/user.jpg" name="Jane Doe" tone="primary" bordered />
 * ```
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { AvatarProps } from "../../contracts";
import { AVATAR_DEFAULTS, TONE_TO_AVATAR_VARIANT } from "../../contracts";

/**
 * Derives up to two uppercase initials from a display name or alt text.
 * Uses first and last word so "John Michael Doe" produces "JD", not "JM".
 *
 * @param name - Primary display name
 * @param alt - Fallback alt text if name is absent
 * @returns One or two uppercase characters, or empty string
 */
function getInitials(name?: string, alt?: string): string {
  const text = name || alt || "";
  const parts = text.trim().split(/\s+/);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // Take first + last word to handle multi-word names gracefully
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Modern (skin-painted) implementation of the Avatar component.
 *
 * Renders avatar content inside a clipped mask container whose corner grammar,
 * variant fill and ink are owned entirely by the modern skin. Status is shown
 * via an absolutely-positioned dot placed with logical properties so RTL needs
 * no markup fork.
 *
 * @param props - Unified AvatarProps from the design system type contract
 * @returns A React element using the modern Avatar anatomy
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
    clickable,
    children,
    onClick,
    onError,
    onLoad,
    backgroundColor,
    textColor,
    bordered,
    ring,
    ringColor,
    className = "",
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; the skin's
  // per-variant fill rules are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_AVATAR_VARIANT[tone] : variantProp;

  // Track image load failures so we can fall back to initials/children
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever the src URL changes, giving the new image a chance to load
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const handleError = () => {
    setImageError(true);
    onError?.(new Error("Failed to load image"));
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const displayInitials = initials || getInitials(name, alt);

  // Dimensions come from CSS custom properties so tenant themes can override sizes.
  // Root and mask share the same token-driven dimensions (see the skin header).
  const sizeStyle = {
    width: `var(--ds-avatar-${size}-size)`,
    height: `var(--ds-avatar-${size}-size)`,
  };

  // The variant fill and ink are painted by
  // foundation/tokens/css/runtime/engines/modern/skin/avatar.css, keyed on the
  // data-variant stamp below. An explicit backgroundColor prop is a caller's value
  // that cannot be enumerated as a rule, so it rides a custom property the skin
  // reads as the FIRST term of its `background` shorthand -- which is what lets it
  // wipe the gradient variant's image, exactly as the inline shorthand did.
  const customBgStyle = backgroundColor
    ? ({ "--ds-avatar-custom-bg": backgroundColor } as React.CSSProperties)
    : {};

  const containerClass = `rottay-avatar rottay-avatar--modern ${className}`.trim();

  // An interactive avatar is a button for keyboard and assistive-technology users;
  // the focus ring itself is painted by the skin on :focus-visible.
  const isInteractive = Boolean(clickable || onClick);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive || !onClick) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onClick();
    },
    [isInteractive, onClick]
  );

  // Ring color rides a custom property; the skin paints the frame, offset ring
  // and elevation shadow from it.
  const hasRing = Boolean(bordered || ring);
  const ringStyle: React.CSSProperties = hasRing
    ? ({
        "--ds-avatar-ring-color": ringColor || "var(--ds-color-primary)",
      } as React.CSSProperties)
    : {};

  return (
    <div
      className={containerClass}
      data-part="root"
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-bordered={bordered ? "true" : undefined}
      data-ring={hasRing ? "true" : undefined}
      data-status={status}
      data-interactive={isInteractive ? "true" : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        ...sizeStyle,
        cursor: isInteractive ? "pointer" : undefined,
        overflow: "visible",
        ...style,
      }}
    >
      {/* Root and mask intentionally share the same resolved size. The transition
          is scoped to the properties the skin animates -- never `all`. */}
      <div
        data-part="mask"
        style={{
          ...sizeStyle,
          ...ringStyle,
          transition: `transform var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out), box-shadow var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out), border-color var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out)`,
        }}
      >
        {src && !imageError ? (
          <img
            data-part="img"
            src={src}
            alt={alt || name || "avatar"}
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <div
            data-part="fallback"
            style={{
              width: "100%",
              height: "100%",
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
      {/* Status dot. Position, frame, offset and per-status fill are painted by
          the skin with logical properties; the engine only stamps the contract. */}
      {status && (
        <span
          data-part="status-dot"
          data-status={status}
          style={{
            width: "var(--ds-avatar-status-size)",
            height: "var(--ds-avatar-status-size)",
            transition: `opacity var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out), transform var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out), background-color var(--ds-avatar-transition-duration, var(--ds-motion-fast)) var(--ds-avatar-transition-timing, ease-in-out)`,
            opacity: 1,
          }}
        />
      )}
    </div>
  );
}

ModernAvatar.displayName = "ModernAvatar";
