'use client';

/** @fileoverview Right chevron icon for forward navigation and pagination. */

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/** Chevron pointing right, used in pagination controls and next-step actions. */
export const ChevronRightIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </BaseIcon>
));

ChevronRightIcon.displayName = 'ChevronRightIcon';
