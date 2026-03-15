'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/**
 * Icono de X/close/error - usado en botones de cerrar y estados de error.
 */
export const XIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
));

XIcon.displayName = 'XIcon';
