'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/**
 * Icono de información - usado en estados informativos.
 */
export const InfoIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
));

InfoIcon.displayName = 'InfoIcon';
