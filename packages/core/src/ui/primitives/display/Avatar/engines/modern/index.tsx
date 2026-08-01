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

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { AvatarProps } from "../../contracts";
import { AVATAR_DEFAULTS, TONE_TO_AVATAR_VARIANT } from "../../contracts";
import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";
import { EntityPersonIcon } from "@/graphics/icons/presentation/semantic/generated/roles/entity-person";

/** Accessible-name fallbacks for the status dot; the i18n catalogue wins when
 * a provider is mounted, the English floor keeps standalone renders honest. */
const STATUS_A11Y: Record<string, { key: string; fallback: string }> = {
  online: { key: "avatar.status.online", fallback: "Online" },
  offline: { key: "avatar.status.offline", fallback: "Offline" },
  away: { key: "avatar.status.away", fallback: "Away" },
  busy: { key: "avatar.status.busy", fallback: "Busy" },
};

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
  // Optional provider + English floor, the same idiom as Spinner/Progress:
  // bare compositions (tests, lightweight consumers) must not crash.
  const i18n = useOptionalTranslation("components");
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
    'data-part': dataPart,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; the skin's
  // per-variant fill rules are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_AVATAR_VARIANT[tone] : variantProp;

  // Track image load failures so we can fall back to initials/children
  const [imageError, setImageError] = useState(false);
  // Track the load lifecycle: the mask's panel fill is the reserved-geometry
  // placeholder and the skin fades the image in once `data-loaded` lands,
  // so a slow src never pops and never shifts layout (fixed-size mask).
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error/load state whenever the src URL changes, giving the new image
  // a chance to load. An image that finished loading BEFORE this commit (cache
  // hit, SSR hydration) never re-fires `load` -- `complete` + naturalWidth is
  // the only observable left for that case.
  useEffect(() => {
    setImageError(false);
    setLoaded(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleError = () => {
    setImageError(true);
    onError?.(new Error("Failed to load image"));
  };

  const handleLoad = () => {
    setLoaded(true);
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
      data-part={dataPart ?? "root"}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-bordered={bordered ? "true" : undefined}
      data-ring={hasRing ? "true" : undefined}
      data-status={status}
      data-loaded={loaded ? "true" : undefined}
      data-interactive={isInteractive ? "true" : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        ...sizeStyle,
        // PINNED (Avatar.modern-engine-advanced): the interactive cursor rides
        // the root's inline style.
        cursor: isInteractive ? "pointer" : undefined,
        ...style,
      }}
    >
      {/* Root and mask intentionally share the same resolved size; transitions
          live in the skin with the rest of the motion ownership. */}
      <div
        data-part="mask"
        style={{
          ...sizeStyle,
          ...ringStyle,
        }}
      >
        {src && !imageError ? (
          // Without a useful name the image is decorative: `alt=""` +
          // aria-hidden keeps screen readers from announcing a generic
          // placeholder (owner directive 2026-07-28); a caller-provided
          // `alt`/`name` always wins.
          <img
            ref={imgRef}
            data-part="img"
            src={src}
            alt={alt || name || ""}
            aria-hidden={alt || name ? undefined : true}
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <div
            data-part="fallback"
            style={{
              ...customBgStyle,
              // An explicit textColor is a caller's value, like `style`: it stays
              // inline and outranks the skin's per-variant ink.
              ...(textColor ? { color: textColor } : {}),
            }}
          >
            {/*
              Empty-fallback anatomy (P2): with no initials and no children the
              tile used to paint a blank disc. The governed entity.person role
              fills the anatomy instead -- decorative like the nameless img law
              above, sized and inked by the declared
              `--ds-avatar-fallback-icon-*` channels through the skin.
            */}
            {displayInitials || children || <EntityPersonIcon decorative />}
          </div>
        )}
      </div>
      {/* Status dot. Position, size, frame, offset, per-status fill and motion
          are painted by the skin with logical properties; the engine stamps
          the contract and the accessible presence name. */}
      {status && (
        <span
          data-part="status-dot"
          data-status={status}
          role="img"
          aria-label={
            STATUS_A11Y[status]
              ? i18n?.tOr(STATUS_A11Y[status].key, STATUS_A11Y[status].fallback) ??
                STATUS_A11Y[status].fallback
              : status
          }
        />
      )}
    </div>
  );
}

ModernAvatar.displayName = "ModernAvatar";
