'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de check/success - usado en estados de éxito.
 */
export const CheckIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
));

CheckIcon.displayName = 'CheckIcon';
