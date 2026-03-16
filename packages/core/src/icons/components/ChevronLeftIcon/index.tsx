'use client';

/** @fileoverview Left chevron icon for back navigation and pagination. */

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/** Chevron pointing left, used in pagination controls and breadcrumb navigation. */
export const ChevronLeftIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </BaseIcon>
));

ChevronLeftIcon.displayName = 'ChevronLeftIcon';
