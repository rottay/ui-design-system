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
import type { LucideIcon, LucideProps } from 'lucide-react';

const ICON_SIZE_MAP: Record<string, string> = {
  xs: 'var(--ds-icon-xs-size, 12px)',
  sm: 'var(--ds-icon-sm-size, 16px)',
  md: 'var(--ds-icon-md-size, 20px)',
  lg: 'var(--ds-icon-lg-size, 24px)',
  xl: 'var(--ds-icon-xl-size, 32px)',
  '2xl': 'var(--ds-icon-2xl-size, 48px)',
};

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

/** DS icon props - superset of LucideProps with DS-specific size tokens. */
interface DSIconProps extends Omit<LucideProps, 'ref' | 'size'> {
  /** DS size token or numeric px value. Defaults to 'md' (20px). */
  size?: IconSize | string | number;
  /** Accessible title rendered as SVG <title> element. */
  title?: string;
}

/**
 * Factory that wraps a lucide-react icon component with DS defaults.
 *
 * Returns a component typed as LucideIcon for full compatibility with
 * existing code that expects lucide-react icon types.
 */
export function createIcon(
  LucideComponent: React.ComponentType<LucideProps>,
  displayName: string,
): LucideIcon {
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

    const resolvedSize = typeof size === 'number'
      ? size
      : (typeof size === 'string' ? (ICON_SIZE_MAP[size] ?? size) : ICON_SIZE_MAP.md);
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
      ...(title ? { 'aria-hidden': false, role: 'img' } : {}),
    } as LucideProps);
  });

  DSIcon.displayName = displayName;
  return DSIcon as unknown as LucideIcon;
}

export type { DSIconProps, IconSize };
