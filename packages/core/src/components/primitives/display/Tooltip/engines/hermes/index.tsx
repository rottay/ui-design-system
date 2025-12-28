/**
 * @fileoverview Tooltip Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based tooltip with utility classes.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's tooltip component classes with Tailwind utilities
 * for lightweight, utility-first tooltip rendering.
 *
 * **Implementation Details:**
 * - Uses DaisyUI `tooltip` class for container
 * - Uses `tooltip-{position}` for placement
 * - Uses `tooltip-{color}` for color variants
 * - CSS-only implementation for maximum performance
 *
 * **Class Mappings:**
 * - `tooltip-top`, `tooltip-bottom`, `tooltip-left`, `tooltip-right`
 * - `tooltip-primary`, `tooltip-secondary`, `tooltip-success`, etc.
 * - `transition-opacity`, `duration-200` for animations
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="hermes" content="DaisyUI tooltip" color="primary">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @see {@link https://daisyui.com/components/tooltip/} DaisyUI Tooltip
 * @module Tooltip/engines/hermes
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { TooltipProps } from '../../types';
import { TOOLTIP_DEFAULTS } from '../../types';

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
      content,
      children,
      color = TOOLTIP_DEFAULTS.color,
      placement = TOOLTIP_DEFAULTS.placement,
      disabled = TOOLTIP_DEFAULTS.disabled,
      visible,
      className = '',
      style,
    } = props;

    // Build Tailwind/DaisyUI class names
    const tooltipClasses = [
      'tooltip',
      visible !== undefined && visible ? 'tooltip-open' : '',
      COLOR_CLASS_MAP[color] || '',
      PLACEMENT_CLASS_MAP[placement] || 'tooltip-top',
      'transition-opacity',
      'duration-200',
      disabled && 'opacity-50 cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // DaisyUI tooltip uses data-tip attribute for content
    return (
      <div
        ref={ref}
        className={tooltipClasses}
        data-tip={disabled ? undefined : content}
        style={style}
      >
        {children}
      </div>
    );
  }
);

HermesTooltip.displayName = 'HermesTooltip';

export default HermesTooltip;
