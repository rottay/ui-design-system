'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de flecha derecha - usado en navegación y paginación.
 */
export const ChevronRightIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </BaseIcon>
));

ChevronRightIcon.displayName = 'ChevronRightIcon';
