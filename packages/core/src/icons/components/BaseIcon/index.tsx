'use client';

/**
 * @fileoverview Base SVG icon wrapper used by every icon in the design system.
 *
 * Renders a 24x24 viewBox SVG with consistent stroke defaults, token-driven
 * sizing, and built-in accessibility support (aria-hidden for decorative icons,
 * aria-label + `<title>` for meaningful ones).
 */

import React, { forwardRef } from 'react';
import type { SvgIconProps as IconProps } from '../../types';
import { ICON_SIZE_MAP } from '../../types';

/**
 * Foundation component for all DS icons. Renders children inside a configured
 * SVG element with standardized stroke settings and token-based dimensions.
 *
 * Accepts either a named size token (`'xs'`-`'2xl'`) or a numeric pixel value.
 * When `decorative` is true (default) and no `title` is set, the icon is hidden
 * from assistive technology via `aria-hidden`.
 */
export const BaseIcon = forwardRef<SVGSVGElement, IconProps & { children: React.ReactNode }>(
  (
    {
      size = 'md',
      color = 'currentColor',
      title,
      decorative = true,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Numeric sizes are treated as pixel values; named sizes resolve to CSS variables
    const sizeValue = typeof size === 'number' ? `${size}px` : (ICON_SIZE_MAP[size] || 'var(--ds-icon-md-size)');

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`rottay-icon ${className}`}
        style={style}
        aria-hidden={decorative && !title}
        aria-label={title}
        role={title ? 'img' : undefined}
        {...props}
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    );
  }
);

BaseIcon.displayName = 'BaseIcon';
