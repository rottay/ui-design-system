/**
 * @fileoverview AspectRatio Modern Engine - Rottay Design System.
 * Tailwind CSS implementation that leverages the native CSS `aspect-ratio`
 * property for a single-div solution. Requires modern browser support
 * (Chrome 88+, Firefox 89+, Safari 15+).
 *
 * @example
 * ```tsx
 * <ModernAspectRatio ratio={4 / 3} maxWidth="800px">
 *   <video src="/intro.mp4" />
 * </ModernAspectRatio>
 * ```
 *
 * @module ModernAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../AspectRatio.types';
import { ASPECT_RATIO_DEFAULTS } from '../AspectRatio.types';

/**
 * Modern (Tailwind) aspect ratio container using native CSS `aspect-ratio`.
 *
 * Unlike the Classic engine's three-layer padding-bottom trick, this uses a single
 * container div with `aspect-ratio` in the inline style. Tailwind utility classes
 * (`relative`, `w-full`, `overflow-hidden`) are applied alongside the inline style
 * to ensure the style cascade works correctly with Tailwind purging.
 *
 * @param props - {@link AspectRatioProps} including ratio, maxWidth, children, and styling overrides.
 * @returns A React element wrapping children in a native aspect ratio container.
 */
export default function ModernAspectRatio(props: AspectRatioProps): React.ReactElement {
  const {
    ratio = ASPECT_RATIO_DEFAULTS.ratio,
    children,
    className = '',
    style,
    maxWidth,
    'data-testid': dataTestId,
  } = props;

  // Inline style uses native aspect-ratio, with overflow hidden to clip
  // children that exceed the ratio box boundaries
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: maxWidth,
    aspectRatio: `${ratio}`,
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={containerStyle}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

ModernAspectRatio.displayName = 'ModernAspectRatio';
