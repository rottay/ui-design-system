'use client';

import React, { forwardRef } from 'react';
import { BaseTooltip } from '../../base';
import type { TooltipProps } from '../../types';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Tooltip component.
 *
 * Uses DaisyUI tooltip with Tailwind classes.
 */
export const HermesTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, ...props }, ref) => {
    const tailwindClasses = [
      'tooltip',
      'transition-opacity',
      'duration-200',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <BaseTooltip ref={ref} className={tailwindClasses} {...props} />;
  }
);

HermesTooltip.displayName = 'HermesTooltip';
