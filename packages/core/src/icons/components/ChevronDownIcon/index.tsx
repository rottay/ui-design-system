'use client';

/** @fileoverview Downward chevron icon for dropdowns, selects, and collapsible sections. */

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/** Chevron pointing down, commonly rotated to indicate expanded/collapsed state. */
export const ChevronDownIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </BaseIcon>
));

ChevronDownIcon.displayName = 'ChevronDownIcon';
