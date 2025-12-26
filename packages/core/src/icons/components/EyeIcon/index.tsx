'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de ojo - usado para mostrar contraseñas.
 */
export const EyeIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
));

EyeIcon.displayName = 'EyeIcon';
