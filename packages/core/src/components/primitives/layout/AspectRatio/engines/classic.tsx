/**
 * @fileoverview AspectRatio Classic Engine - Rottay Design System.
 * Ant Design compatible implementation that uses the padding-bottom trick
 * to maintain a fixed aspect ratio regardless of content dimensions.
 * This approach ensures broad browser compatibility (IE11+).
 *
 * @example
 * ```tsx
 * <ClassicAspectRatio ratio={16 / 9} maxWidth="600px">
 *   <img src="/hero.jpg" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
 * </ClassicAspectRatio>
 * ```
 *
 * @module ClassicAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../AspectRatio.types';
import { ASPECT_RATIO_DEFAULTS } from '../AspectRatio.types';

/**
 * Classic (Ant Design) aspect ratio container using the padding-bottom technique.
 *
 * Uses a three-layer div structure: outer (sizing) -> inner (ratio via padding) -> content (absolute fill).
 * The padding-bottom percentage is derived from the inverse of the ratio, which forces the inner
 * div to maintain the correct proportional height relative to its width.
 *
 * @param props - {@link AspectRatioProps} including ratio, maxWidth, children, and styling overrides.
 * @returns A React element wrapping children in a fixed aspect ratio container.
 */
export default function ClassicAspectRatio(props: AspectRatioProps): React.ReactElement {
  const {
    ratio = ASPECT_RATIO_DEFAULTS.ratio,
    children,
    className = '',
    style,
    maxWidth,
    'data-testid': dataTestId,
  } = props;

  // Convert ratio to a percentage for the padding-bottom trick.
  // e.g., 16/9 ratio -> (1 / 1.778) * 100 = ~56.25% padding-bottom
  const paddingBottom = `${(1 / ratio) * 100}%`;

  // Outer container establishes the width constraint and receives user styles
  const outerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: maxWidth,
    ...style,
  };

  // Inner div uses paddingBottom to create the intrinsic ratio box.
  // Height is implicitly zero; the padding creates the visual height.
  const innerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom,
  };

  // Content layer fills the ratio box absolutely so children stretch to fit
  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div
      className={`rottay-aspect-ratio-classic ${className}`}
      style={outerStyle}
      data-testid={dataTestId}
    >
      <div style={innerStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

ClassicAspectRatio.displayName = 'ClassicAspectRatio';
