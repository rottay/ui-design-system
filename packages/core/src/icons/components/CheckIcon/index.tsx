'use client';

/**
 * @fileoverview Checkmark icon for success states and confirmations.
 */

import { forwardRef } from 'react';
import { BaseIcon } from '../BaseIcon';
import type { SvgIconProps as IconProps } from '../../types';

/** Checkmark icon used in success toasts, checkbox indicators, and form validation. */
export const CheckIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
));

CheckIcon.displayName = 'CheckIcon';
