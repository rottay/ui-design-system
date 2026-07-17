'use client';

/**
 * @fileoverview Triangle alert/warning icon for validation and status feedback.
 */

import { forwardRef } from 'react';
import { BaseIcon } from '../../../foundation/contracts/base';
import type { SvgIconProps as IconProps } from '../../../foundation/contracts';

/** Warning triangle icon used in alert banners and validation error states. */
export const AlertIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
));

AlertIcon.displayName = 'AlertIcon';
