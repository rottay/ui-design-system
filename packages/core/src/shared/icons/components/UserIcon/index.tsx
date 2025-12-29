'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/**
 * Icono de usuario - usado como fallback en Avatar.
 */
export const UserIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BaseIcon>
));

UserIcon.displayName = 'UserIcon';
