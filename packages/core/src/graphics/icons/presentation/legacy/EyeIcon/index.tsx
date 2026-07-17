'use client';

/** @fileoverview Eye icon for password visibility toggle (show). */

import { forwardRef } from 'react';
import { BaseIcon } from '../../../foundation/contracts/base';
import type { SvgIconProps as IconProps } from '../../../foundation/contracts';

/** Open eye icon, paired with EyeOffIcon for password show/hide toggling. */
export const EyeIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
));

EyeIcon.displayName = 'EyeIcon';
