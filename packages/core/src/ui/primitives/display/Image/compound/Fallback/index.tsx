/**
 * @fileoverview Image.Fallback compound component.
 * Displays custom fallback content when an image fails to load.
 * Can be used standalone or as part of the Image component.
 */

'use client';

import React, { forwardRef } from 'react';
import type { ImageFallbackProps } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ContentImageIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-image';

/** Accessible name for the fallback panel; the i18n catalogue wins when a
 * provider is mounted, the pinned English floor keeps standalone renders
 * (and the provider-less test contract) byte-identical. */
const FALLBACK_A11Y = { key: 'image.failedToLoad', fallback: 'Image failed to load' };

/**
 * Image.Fallback component for displaying fallback content when image load fails.
 *
 * Features:
 * - Customizable fallback content
 * - Default broken image icon
 * - Flexible sizing
 * - Accessible styling
 *
 * @param props - ImageFallbackProps including optional children, width, height, and style overrides
 * @param ref - Forwarded ref to the root div element
 * @returns A styled div container with fallback content or a default broken-image SVG icon
 *
 * @example
 * ```tsx
 * <Image.Fallback width={200} height={200}>
 *   <span>Image not available</span>
 * </Image.Fallback>
 * ```
 */
export const ImageFallback = forwardRef<HTMLDivElement, ImageFallbackProps>(
  ({ children, className = '', style, width, height, ...props }, ref) => {
    // Optional provider + English floor, the same idiom as Avatar's status
    // names: bare compositions (tests, lightweight consumers) must not crash.
    const i18n = useOptionalTranslation('components');

    // Container styles — inline is caller geometry only (width/height); the
    // semantic type role moved to image-compounds.css with the rest of the
    // fallback paint (P2 inline-drain).
    const fallbackStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: typeof width === 'number' ? `${width}px` : width || '100%',
      height: typeof height === 'number' ? `${height}px` : height || '100%',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-image-fallback ${className}`}
        data-part="fallback"
        style={fallbackStyles}
        role="img"
        aria-label={i18n?.tOr(FALLBACK_A11Y.key, FALLBACK_A11Y.fallback) ?? FALLBACK_A11Y.fallback}
        {...props}
      >
        {/* The governed content.image role replaces the local ad-hoc SVG at the
            same 48px (icon 2xl = 3rem), same currentColor ink, decorative. */}
        {children || <ContentImageIcon decorative size="2xl" />}
      </div>
    );
  }
);

ImageFallback.displayName = 'ImageFallback';
