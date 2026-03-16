'use client';

/** @fileoverview Upward chevron icon for collapsible sections and sort indicators. */

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/** Chevron pointing up, used in collapsed-state toggles and ascending sort headers. */
export const ChevronUpIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="18 15 12 9 6 15" />
  </BaseIcon>
));

ChevronUpIcon.displayName = 'ChevronUpIcon';
