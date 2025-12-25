'use client';

import React, { forwardRef } from 'react';
import { BaseImage } from '../../base';
import type { ImageProps } from '../../types';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Image component.
 *
 * Uses base implementation with Tailwind utility classes.
 */
export const HermesImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, ...props }, ref) => {
    const tailwindClasses = [
      'object-cover',
      'transition-opacity',
      'duration-300',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <BaseImage ref={ref} className={tailwindClasses} {...props} />;
  }
);

HermesImage.displayName = 'HermesImage';
