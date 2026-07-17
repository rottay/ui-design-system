'use client';

/**
 * @fileoverview X/close icon for dismiss actions and error states.
 */

import { forwardRef } from 'react';
import { BaseIcon } from '../../../foundation/contracts/base';
import type { SvgIconProps as IconProps } from '../../../foundation/contracts';

/** Close/dismiss icon used in modals, tags, toasts, and error indicators. */
export const XIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <BaseIcon ref={ref} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
));

XIcon.displayName = 'XIcon';
