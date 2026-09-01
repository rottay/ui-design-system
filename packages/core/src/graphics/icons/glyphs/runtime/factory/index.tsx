'use client';

/**
 * @fileoverview createIcon factory - Rottay Design System
 *
 * Wraps a compatible SVG icon component with DS defaults:
 * - Size defaults to 'md' (20px), reads from --ds-icon-md-size token
 * - Color defaults to 'currentColor' (inherits from parent text)
 * - StrokeWidth defaults to CSS var --ds-icon-stroke-width (1.5)
 * - Adds 'rottay-icon' className for global CSS hooks
 * - aria-hidden="true" by default (decorative)
 */

import React, { forwardRef } from 'react';
import type {
  DSIconComponent,
  DSIconProps,
  DSIconSourceComponent,
  IconSize,
} from '../../foundation/contracts';

const ICON_SIZE_MAP: Record<string, string> = {
  xs: 'var(--ds-icon-xs-size, 12px)',
  sm: 'var(--ds-icon-sm-size, 16px)',
  md: 'var(--ds-icon-md-size, 20px)',
  lg: 'var(--ds-icon-lg-size, 24px)',
  xl: 'var(--ds-icon-xl-size, 32px)',
  '2xl': 'var(--ds-icon-2xl-size, 48px)',
};

/**
 * Factory that wraps a compatible SVG icon component with DS defaults.
 * Its input and output are structural DS contracts so provider declarations
 * never cross the public package boundary.
 */
export function createIcon(
  SourceComponent: DSIconSourceComponent,
  displayName: string,
): DSIconComponent {
  const DSIcon = forwardRef<SVGSVGElement, DSIconProps>((props, ref) => {
    const {
      size = 'md',
      color = 'currentColor',
      strokeWidth,
      className = '',
      style,
      title,
      children,
      'aria-hidden': ariaHidden,
      'aria-label': ariaLabel,
      ...rest
    } = props;

    const resolvedSize = typeof size === 'number'
      ? size
      : (typeof size === 'string' ? (ICON_SIZE_MAP[size] ?? size) : ICON_SIZE_MAP.md);
    const resolvedStrokeWidth = strokeWidth ?? 'var(--ds-icon-stroke-width, 1.5)';
    const hasAccessibleName = Boolean(title || ariaLabel);

    return React.createElement(
      SourceComponent,
      {
        ref,
        size: resolvedSize,
        color,
        strokeWidth: resolvedStrokeWidth,
        className: `rottay-icon ${className}`.trim(),
        style,
        ...rest,
        'aria-hidden': hasAccessibleName ? undefined : (ariaHidden ?? true),
        'aria-label': ariaLabel ?? title,
        role: hasAccessibleName ? 'img' : rest.role,
      } as DSIconProps & React.RefAttributes<SVGSVGElement>,
      title ? React.createElement('title', null, title) : undefined,
      children,
    );
  });

  DSIcon.displayName = displayName;
  return DSIcon;
}

export type { DSIconComponent, DSIconProps, DSIconSourceComponent, IconSize };
