/**
 * @fileoverview AspectRatio Classic Engine - Rottay Design System
 * @description Ant Design compatible implementation using padding-bottom trick.
 *
 * @module ClassicAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../AspectRatio.types';
import { ASPECT_RATIO_DEFAULTS } from '../AspectRatio.types';

export default function ClassicAspectRatio(props: AspectRatioProps): React.ReactElement {
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
    ...style,
  };

  const innerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom,
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
