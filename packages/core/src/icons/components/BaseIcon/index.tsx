'use client';

import React, { forwardRef } from 'react';
import type { IconProps } from '../../types';
import { ICON_SIZE_MAP } from '../../types';

/**
 * Componente base para crear iconos del sistema Rottay.
 * Todos los iconos generados extienden este componente.
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
    const sizeValue = typeof size === 'number' ? size : ICON_SIZE_MAP[size] || 20;

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
