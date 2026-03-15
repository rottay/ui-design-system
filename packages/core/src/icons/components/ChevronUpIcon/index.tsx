'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/**
 * Icono de flecha arriba - usado en selects, dropdowns y menús.
 */
export const ChevronUpIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="18 15 12 9 6 15" />
  </BaseIcon>
));

ChevronUpIcon.displayName = 'ChevronUpIcon';
