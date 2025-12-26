'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de flecha abajo - usado en selects, dropdowns y menús.
 */
export const ChevronDownIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </BaseIcon>
));

ChevronDownIcon.displayName = 'ChevronDownIcon';
