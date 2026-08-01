/**
 * @fileoverview Modern engine for the Image display primitive, painted by the
 * modern skin (`foundation/tokens/css/runtime/engines/modern/skin/image.css`).
 * The engine tracks the loading/loaded/error lifecycle and stamps the data-*
 * contract (radius, object-fit, bordered/shadow, interactive, status); all
 * geometry and paint -- including the opacity reveal, the placeholder pulse
 * and the zoom badge -- are skin-owned. The only inline declarations are the
 * caller's measured values and the single pinned logical `end-2` utility on
 * the zoom badge.
 *
 * @example
 * ```tsx
 * <Image engine="modern" src="/photo.jpg" alt="Photo" radius="lg" shadow />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import { ContentImageIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-image';
import { ActionZoomInIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-zoom-in';
import type { ImageProps } from '../../contracts';
import { IMAGE_DEFAULTS } from '../../contracts';
import type { ImageRadius, ImageStatus } from '../../contracts';

/**
 * Modern (skin-painted) Image engine. Tracks the loading lifecycle and
 * composes the frame, the reveal and the overlays through the modern skin's
 * data contract -- no Tailwind utilities remain (the zoom badge's logical
 * `end-2` is the single pinned exception).
 *
 * @param props - Standard ImageProps shared across all engines.
 * @returns A skin-styled container with `<img>`, overlay, and zoom indicator.
 */
export default function ModernImage(props: ImageProps): React.ReactElement {
  const {
    src,
    alt,
    width,
    height,
    objectFit = IMAGE_DEFAULTS.objectFit,
    objectPosition = IMAGE_DEFAULTS.objectPosition,
    radius = IMAGE_DEFAULTS.radius as ImageRadius,
    bordered = IMAGE_DEFAULTS.bordered,
    shadow = IMAGE_DEFAULTS.shadow,
    zoomable = IMAGE_DEFAULTS.zoomable,
    lazy = IMAGE_DEFAULTS.lazy,
    placeholder,
    fallback,
    onClick,
    onLoad,
    onError,
    aspectRatio,
    hoverOverlay,
    className = '',
    style = {},
  } = props;

  // Tracks loading/loaded/error lifecycle for opacity transition and fallback
  const [status, setStatus] = useState<ImageStatus>('loading');
  // The interaction state still drives the root's data-state stamps; the
  // overlays no longer mount on hover -- they render with their feature prop
  // and the SKIN gates their visibility on `[data-state~='hovered']` /
  // `[data-state~='focus-visible']`, so enter/exit is a real transition
  // instead of an abrupt pop (P2 continuity fix).
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();

  // A new src means the image must be re-fetched; reset to loading
  useEffect(() => {
    setStatus('loading');
  }, [src]);

  /**
   * Handles successful image load.
   */
  const handleLoad = useCallback(() => {
    setStatus('loaded');
    onLoad?.();
  }, [onLoad]);

  /**
   * Handles image load error.
   */
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setStatus('error');
      onError?.(event);
    },
    [onError]
  );

  // Geometry and paint are skin-owned (image.css), keyed on the data-*
  // contract below: radius, object-fit, bordered/shadow, interactive cursor
  // and the load-status reveal. The only inline declarations are the
  // caller's measured values (width/height/aspectRatio/objectPosition).
  const containerClasses = ['rottay-image', 'rottay-image--modern', className]
    .filter(Boolean)
    .join(' ');

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || 'auto',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
    ...style,
  };

  const isInteractive = Boolean(onClick || zoomable);

  return (
    <div
      className={containerClasses}
      data-status={status}
      data-radius={radius}
      data-object-fit={objectFit}
      data-bordered={bordered ? 'true' : undefined}
      data-shadow={shadow ? 'true' : undefined}
      data-zoomable={zoomable ? 'true' : undefined}
      data-interactive={isInteractive ? 'true' : undefined}
      style={containerStyle}
      onClick={onClick}
      {...(onClick
        ? {
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            },
          }
        : {})}
      {...interactionHandlers}
      {...partAttributes('root', interaction)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading Placeholder — the pulse animation is owned by the skin
          (ds-foundation-pulse), not a raw Tailwind `animate-pulse` utility;
          the global reduced-motion guard neutralizes it. The panel stays
          MOUNTED once loaded (it only unmounts on error): the skin fades it
          out under the revealing img, so the handoff is a crossfade instead
          of the panel vanishing mid-reveal (P2 continuity fix). */}
      {status !== 'error' && (
        <div data-part="placeholder">
          {placeholder || (
            <div className="rottay-image__pulse" />
          )}
        </div>
      )}

      {/* Error Fallback — the governed content.image role replaces the local
          ad-hoc SVG (same 3rem/2xl size, same currentColor ink the skin paints
          through `--ds-color-text-secondary`; decorative by contract). */}
      {status === 'error' && (
        <div data-part="fallback">
          {fallback || <ContentImageIcon decorative size="2xl" />}
        </div>
      )}

      {/* Main Image — an absent alt floors to "" (decorative): omitting the
          attribute entirely leaves assistive technology announcing the src
          filename, which is strictly worse than an honest empty name. */}
      <img
        data-part="img"
        src={src}
        alt={alt ?? ''}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        style={{ objectPosition }}
      />

      {/* Hover Overlay — rendered with the prop; the skin owns rest/hover
          visibility so the overlay fades instead of popping on mount. */}
      {hoverOverlay && (
        <div data-part="hover-overlay">
          {hoverOverlay}
        </div>
      )}

      {/* Zoom indicator for zoomable images — `end-2` is LOGICAL
          (inset-inline-end), so the badge mirrors under RTL, and it is the one
          utility the quality contract pins verbatim; every other property
          (position, padding, radius, ink) is skin-owned. Same visibility law
          as the hover overlay above: persistent part, skin-gated fade. */}
      {zoomable && (
        <div data-part="zoom-indicator" className="end-2">
          {/* Pure affordance hint on the interactive root: the governed
              action.zoom-in role (1rem = sm, currentColor) replaces the local
              ad-hoc magnifier SVG and stays decorative by contract. */}
          <ActionZoomInIcon decorative size="sm" />
        </div>
      )}
    </div>
  );
}

ModernImage.displayName = 'ModernImage';
