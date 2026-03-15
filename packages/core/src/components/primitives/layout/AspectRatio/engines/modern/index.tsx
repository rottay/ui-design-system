/**
 * @fileoverview AspectRatio Modern Engine - Rottay Design System
 * @description Tailwind CSS implementation using native aspect-ratio CSS property.
 *
 * @module ModernAspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { AspectRatioProps } from '../../types';
import { ASPECT_RATIO_DEFAULTS } from '../../types';

export default function ModernAspectRatio(props: AspectRatioProps): React.ReactElement {
  const {
    ratio = ASPECT_RATIO_DEFAULTS.ratio,
    children,
    className = '',
    style,
    maxWidth,
    'data-testid': dataTestId,
  } = props;

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
