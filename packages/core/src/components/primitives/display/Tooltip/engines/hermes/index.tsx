/**
 * Tooltip - Hermes Engine Implementation
 * Uses DaisyUI/Tailwind CSS for lightweight, utility-first tooltip styling.
 *
 * @module Tooltip/engines/hermes
 * @description Hermes engine implementation using DaisyUI and Tailwind CSS.
 * Provides a lightweight alternative with Tailwind utility classes.
 */

'use client';

import { forwardRef } from 'react';
import { BaseTooltip } from '../../base';
import type { TooltipProps } from '../../types';

/**
 * Maps color variants to DaisyUI tooltip color classes.
 */
const COLOR_CLASS_MAP: Record<string, string> = {
  default: '',
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
};

/**
 * Maps placement to DaisyUI tooltip position classes.
 */
const PLACEMENT_CLASS_MAP: Record<string, string> = {
  'top': 'tooltip-top',
  'top-start': 'tooltip-top',
  'top-end': 'tooltip-top',
  'bottom': 'tooltip-bottom',
  'bottom-start': 'tooltip-bottom',
  'bottom-end': 'tooltip-bottom',
  'left': 'tooltip-left',
  'left-start': 'tooltip-left',
  'left-end': 'tooltip-left',
  'right': 'tooltip-right',
  'right-start': 'tooltip-right',
  'right-end': 'tooltip-right',
};

/**
 * Hermes (DaisyUI/Tailwind) implementation of the Tooltip component.
 *
 * Features:
 * - Lightweight CSS-only implementation
 * - Tailwind utility class styling
 * - DaisyUI color variants
 * - Smooth transitions via CSS
 *
 * @example
 * ```tsx
 * <HermesTooltip content="Helpful tip" color="primary">
 *   <Button>Hover me</Button>
 * </HermesTooltip>
 * ```
 */
const HermesTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    const {
      color = 'default',
      placement = 'top',
      className = '',
      ...restProps
    } = props;

    // Build Tailwind/DaisyUI class names
    const tailwindClasses = [
      'tooltip',
      'tooltip-open',
      COLOR_CLASS_MAP[color] || '',
      PLACEMENT_CLASS_MAP[placement] || 'tooltip-top',
      'transition-opacity',
      'duration-200',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BaseTooltip
        ref={ref}
        placement={placement}
        color={color}
        className={tailwindClasses}
        {...restProps}
      />
    );
  }
);

HermesTooltip.displayName = 'HermesTooltip';

export default HermesTooltip;
