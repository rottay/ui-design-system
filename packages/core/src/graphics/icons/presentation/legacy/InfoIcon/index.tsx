'use client';

/** @fileoverview Circled "i" information icon for help text and info alerts. */

import { forwardRef } from 'react';
import { BaseIcon } from '../../../foundation/contracts/base';
import type { SvgIconProps as IconProps } from '../../../foundation/contracts';

/** Information icon used in tooltips, info banners, and contextual help. */
export const InfoIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
));

InfoIcon.displayName = 'InfoIcon';
