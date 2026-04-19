'use client';

/**
 * @fileoverview createIcon factory - Rottay Design System
 *
 * Wraps a lucide-react icon component with DS defaults:
 * - Size defaults to 'md' (20px), reads from --ds-icon-md-size token
 * - Color defaults to 'currentColor' (inherits from parent text)
 * - StrokeWidth defaults to CSS var --ds-icon-stroke-width (1.5)
 * - Adds 'rottay-icon' className for global CSS hooks
 * - aria-hidden="true" by default (decorative)
 */

import React, { forwardRef } from 'react';

const ICON_SIZE_MAP: Record<string, string> = {
  xs: 'var(--ds-icon-xs-size, 12px)',
  sm: 'var(--ds-icon-sm-size, 16px)',
  md: 'var(--ds-icon-md-size, 20px)',
  lg: 'var(--ds-icon-lg-size, 24px)',
  xl: 'var(--ds-icon-xl-size, 32px)',
  '2xl': 'var(--ds-icon-2xl-size, 48px)',
};

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

interface DSIconProps {
  size?: IconSize;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
}

/**
 * Factory that wraps a lucide-react icon component with DS defaults.
 *
 * - Size defaults to 'md' (20px), reads from --ds-icon-md-size token
 * - Color defaults to 'currentColor' (inherits from parent text)
 * - StrokeWidth defaults to CSS var --ds-icon-stroke-width (1.5)
 * - Adds 'rottay-icon' className for global CSS hooks
 * - aria-hidden="true" by default (decorative)
 */
export function createIcon(
  LucideComponent: React.ComponentType<any>,
  displayName: string,
) {
  const DSIcon = forwardRef<SVGSVGElement, DSIconProps>((props, ref) => {
    const {
      size = 'md',
      color = 'currentColor',
      strokeWidth,
      className = '',
      style,
      title,
      'aria-hidden': ariaHidden,
      'aria-label': ariaLabel,
      ...rest
    } = props;

    const resolvedSize = typeof size === 'number' ? size : ICON_SIZE_MAP[size] ?? ICON_SIZE_MAP.md;
    const resolvedStrokeWidth = strokeWidth ?? 'var(--ds-icon-stroke-width, 1.5)';

    return React.createElement(LucideComponent, {
      ref,
      size: resolvedSize,
      color,
      strokeWidth: resolvedStrokeWidth,
      className: `rottay-icon ${className}`.trim(),
      style,
      'aria-hidden': title || ariaLabel ? undefined : (ariaHidden ?? true),
      'aria-label': ariaLabel,
      ...rest,
      // If title is provided, lucide renders a <title> element inside the SVG
      ...(title ? { 'aria-hidden': false, role: 'img' } : {}),
    });
  });

  DSIcon.displayName = displayName;
  return DSIcon;
}

export type { DSIconProps, IconSize };
