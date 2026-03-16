/**
 * @fileoverview AspectRatio Rustic Engine - Rottay Design System.
 * Pure inline CSS implementation using the padding-bottom fallback technique.
 * Zero external dependencies -- ideal for embedded widgets or SSR without
 * CSS extraction. Inherits the tenant font via `--ds-font-family-base`.
 *
 * @example
 * ```tsx
 * <RusticAspectRatio ratio={1} maxWidth="400px">
 *   <img src="/avatar.png" alt="Profile" />
 * </RusticAspectRatio>
 * ```
 *
 * @module RusticAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../AspectRatio.types';
import { ASPECT_RATIO_DEFAULTS } from '../AspectRatio.types';

/**
 * Rustic (vanilla CSS) aspect ratio container using the padding-bottom technique.
 *
 * Similar to the Classic engine but adds `height: 0` on the ratio box and
 * `overflow: hidden` to clip overflowing content. It also binds the
 * `--ds-font-family-base` CSS variable so nested text inherits the tenant font.
 *
 * @param props - {@link AspectRatioProps} including ratio, maxWidth, children, and styling overrides.
 * @returns A React element wrapping children in a self-contained aspect ratio container.
 */
export default function RusticAspectRatio(props: AspectRatioProps): React.ReactElement {
  const {
    ratio = ASPECT_RATIO_DEFAULTS.ratio,
    children,
    className = '',
    style,
    maxWidth,
    'data-testid': dataTestId,
  } = props;

  // Inverse ratio expressed as a percentage for padding-bottom
  const paddingBottom = `${(1 / ratio) * 100}%`;

  // Outer wrapper provides width constraint and binds the DS font variable
  // so any text rendered inside stays consistent with tenant theming
  const outerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: maxWidth,
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  // Ratio box: height is explicitly 0 and paddingBottom creates the
  // proportional height. Overflow hidden clips any content bleeding out.
  const ratioBoxStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingBottom,
    overflow: 'hidden',
  };

  // Absolute positioning fills the ratio box so children stretch to fit
  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div
      className={`rottay-aspect-ratio-rustic ${className}`}
      style={outerStyle}
      data-testid={dataTestId}
    >
      <div style={ratioBoxStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

RusticAspectRatio.displayName = 'RusticAspectRatio';
