'use client';

import React, { forwardRef } from 'react';
import type { HeadingProps, TextProps, ParagraphProps } from '../../types';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Heading component.
 */
export const HermesHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = 'h2',
      size,
      weight = 'bold',
      align = 'left',
      color = 'default',
      truncate = false,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const Component = level;

    const sizeClasses = {
      xs: 'text-base',
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
      '2xl': 'text-4xl',
      '3xl': 'text-5xl',
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const colorClasses = {
      default: 'text-base-content',
      muted: 'text-base-content/70',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    };

    const classes = [
      size ? sizeClasses[size] : '',
      weightClasses[weight],
      alignClasses[align],
      colorClasses[color],
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component ref={ref as any} className={classes} style={style} {...props}>
        {children}
      </Component>
    );
  }
);

HermesHeading.displayName = 'HermesHeading';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Text component.
 */
export const HermesText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size = 'md',
      weight = 'normal',
      color = 'default',
      align = 'left',
      as = 'span',
      truncate = false,
      lineClamp,
      underline = false,
      strikethrough = false,
      italic = false,
      monospace = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const Component = as;

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const colorClasses = {
      default: 'text-base-content',
      muted: 'text-base-content/70',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    };

    const classes = [
      sizeClasses[size],
      weightClasses[weight],
      alignClasses[align],
      colorClasses[color],
      underline ? 'underline' : '',
      strikethrough ? 'line-through' : '',
      italic ? 'italic' : '',
      monospace ? 'font-mono' : '',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component ref={ref as any} className={classes} style={style} {...props}>
        {children}
      </Component>
    );
  }
);

HermesText.displayName = 'HermesText';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Paragraph component.
 */
export const HermesParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = 'md',
      weight = 'normal',
      color = 'default',
      align = 'left',
      truncate = false,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    };

    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const colorClasses = {
      default: 'text-base-content',
      muted: 'text-base-content/70',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    };

    const classes = [
      sizeClasses[size],
      weightClasses[weight],
      alignClasses[align],
      colorClasses[color],
      'leading-relaxed',
      'mb-4',
      truncate ? 'truncate' : '',
      lineClamp ? `line-clamp-${lineClamp}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <p ref={ref} className={classes} style={style} {...props}>
        {children}
      </p>
    );
  }
);

HermesParagraph.displayName = 'HermesParagraph';
