'use client';

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { IconProps } from '../../types';

/**
 * Icono de cámara - usado en upload de avatares.
 */
export const CameraIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="13" r="3" />
  </BaseIcon>
));

CameraIcon.displayName = 'CameraIcon';
