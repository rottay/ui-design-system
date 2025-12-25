'use client';

import React, { forwardRef } from 'react';
import type { HeadingProps, TextProps, ParagraphProps } from '../types';

/**
 * Base Heading component for semantic headings.
 *
 * Features:
 * - Semantic h1-h6 levels
 * - Visual size override
 * - Text alignment
 * - Line clamping
 * - Truncation
 */
export const BaseHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
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

    const sizeMap = {
      xs: '1rem',
      sm: '1.25rem',
      md: '1.5rem',
      lg: '1.875rem',
      xl: '2.25rem',
      '2xl': '3rem',
      '3xl': '3.75rem',
    };

    const weightMap = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };

    const colorMap = {
      default: 'var(--color-text-primary)',
      muted: 'var(--color-text-secondary)',
      primary: 'var(--color-primary)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
    };

    const headingStyles: React.CSSProperties = {
      fontSize: size ? sizeMap[size] : undefined,
      fontWeight: weightMap[weight],
      textAlign: align,
      color: colorMap[color],
      margin: 0,
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    return (
      <Component
        ref={ref as any}
        className={`rottay-heading rottay-heading--${level} ${className || ''}`}
        style={headingStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

BaseHeading.displayName = 'BaseHeading';

/**
 * Base Text component for inline text.
 *
 * Features:
 * - Multiple sizes and weights
 * - Semantic colors
 * - Text decorations
 * - Line clamping
 * - Flexible element rendering
 */
export const BaseText = forwardRef<HTMLElement, TextProps>(
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

    const sizeMap = {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    };

    const weightMap = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };

    const colorMap = {
      default: 'var(--color-text-primary)',
      muted: 'var(--color-text-secondary)',
      primary: 'var(--color-primary)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
    };

    const textStyles: React.CSSProperties = {
      fontSize: sizeMap[size],
      fontWeight: weightMap[weight],
      textAlign: align,
      color: colorMap[color],
      fontFamily: monospace ? 'monospace' : undefined,
      textDecoration: underline ? 'underline' : strikethrough ? 'line-through' : undefined,
      fontStyle: italic ? 'italic' : undefined,
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    return (
      <Component
        ref={ref as any}
        className={`rottay-text rottay-text--${size} ${className || ''}`}
        style={textStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

BaseText.displayName = 'BaseText';

/**
 * Base Paragraph component for block text.
 *
 * Features:
 * - Paragraph spacing
 * - Text alignment
 * - Line clamping
 * - Semantic colors
 */
export const BaseParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
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
    const sizeMap = {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    };

    const weightMap = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };

    const colorMap = {
      default: 'var(--color-text-primary)',
      muted: 'var(--color-text-secondary)',
      primary: 'var(--color-primary)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
    };

    const paragraphStyles: React.CSSProperties = {
      fontSize: sizeMap[size],
      fontWeight: weightMap[weight],
      textAlign: align,
      color: colorMap[color],
      margin: '0 0 1em 0',
      lineHeight: 1.6,
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    return (
      <p
        ref={ref}
        className={`rottay-paragraph rottay-paragraph--${size} ${className || ''}`}
        style={paragraphStyles}
        {...props}
      >
        {children}
      </p>
    );
  }
);

BaseParagraph.displayName = 'BaseParagraph';
