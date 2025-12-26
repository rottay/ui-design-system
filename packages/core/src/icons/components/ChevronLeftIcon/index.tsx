'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de flecha izquierda - usado en navegación y paginación.
 */
export const ChevronLeftIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </BaseIcon>
));

ChevronLeftIcon.displayName = 'ChevronLeftIcon';
