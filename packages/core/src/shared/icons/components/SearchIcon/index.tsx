'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/**
 * Icono de búsqueda - usado en inputs de búsqueda.
 */
export const SearchIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </BaseIcon>
));

SearchIcon.displayName = 'SearchIcon';
