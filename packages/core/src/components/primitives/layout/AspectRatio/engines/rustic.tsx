/**
 * @fileoverview AspectRatio Rustic Engine - Rottay Design System
 * @description Pure CSS implementation with padding-bottom fallback.
 *
 * @module RusticAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../AspectRatio.types';
import { ASPECT_RATIO_DEFAULTS } from '../AspectRatio.types';

export default function RusticAspectRatio(props: AspectRatioProps): React.ReactElement {
  const {
    ratio = ASPECT_RATIO_DEFAULTS.ratio,
    children,
    className = '',
    style,
    maxWidth,
    'data-testid': dataTestId,
  } = props;

  const paddingBottom = `${(1 / ratio) * 100}%`;

  const outerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: maxWidth,
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const ratioBoxStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingBottom,
    overflow: 'hidden',
  };

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
