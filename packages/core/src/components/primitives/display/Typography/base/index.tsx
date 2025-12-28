/**
 * @fileoverview Typography Base Components - Rottay Design System
 * @description CSS variable-based typography with semantic structure.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The base Typography components use CSS custom properties for theming
 * and serve as the foundation for engine-specific implementations.
 *
 * **Available Components:**
 * - `BaseHeading` - Semantic heading (h1-h6) with visual customization
 * - `BaseText` - Inline text with decorations and styles
 * - `BaseParagraph` - Block-level paragraph with spacing
 *
 * **CSS Custom Properties:**
 * - `--ds-color-text-primary` - Default text color
 * - `--ds-color-text-secondary` - Muted text color
 * - `--ds-color-primary-500` - Primary accent color
 * - `--ds-color-success-500` - Success state color
 * - `--ds-color-warning-500` - Warning state color
 * - `--ds-color-error-500` - Error state color
 *
 * **Features:**
 * - Semantic HTML elements for accessibility
 * - CSS variable-based theming
 * - Line clamping and truncation support
 * - Text decorations (underline, strikethrough, italic)
 * - Monospace font support for code
 * - Flexible element rendering
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseHeading, BaseText, BaseParagraph } from '@rottay/design-system';
 *
 * <BaseHeading level="h1" size="3xl">Title</BaseHeading>
 * <BaseText color="primary" italic>Emphasized text</BaseText>
 * <BaseParagraph lineClamp={3}>Long content...</BaseParagraph>
 * ```
 *
 * @see {@link Typography} for the main component
 * @module Typography/base
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { HeadingProps, TextProps, ParagraphProps } from '../types';
import {
  TYPOGRAPHY_DEFAULTS,
  SIZE_MAP,
  WEIGHT_MAP,
  COLOR_MAP,
} from '../types';

/**
 * Base Heading component for semantic headings.
 *
 * Renders an HTML heading element (h1-h6) with customizable visual appearance.
 * Supports text truncation, line clamping, and semantic color variants.
 *
 * Features:
 * - Semantic h1-h6 levels for accessibility
 * - Visual size independent of semantic level
 * - Text alignment and color variants
 * - Line clamping and truncation support
 * - CSS variable-based theming
 *
 * @example
 * ```tsx
 * <BaseHeading level="h1" size="3xl" weight="bold" color="primary">
 *   Welcome to the Dashboard
 * </BaseHeading>
 * ```
 */
export const BaseHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight = TYPOGRAPHY_DEFAULTS.heading.weight,
      align = TYPOGRAPHY_DEFAULTS.heading.align,
      color = TYPOGRAPHY_DEFAULTS.heading.color,
      truncate = TYPOGRAPHY_DEFAULTS.heading.truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const Component = level;

    // Build computed styles using CSS variables and mappings
    const headingStyles: React.CSSProperties = {
      fontSize: size ? SIZE_MAP.heading[size] : undefined,
      fontWeight: WEIGHT_MAP[weight],
      textAlign: align,
      color: COLOR_MAP[color],
      margin: 0,
      lineHeight: 1.2,
      // Truncation styles
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      // Line clamping (CSS multi-line truncation)
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    const classNames = [
      'rottay-heading',
      `rottay-heading--${level}`,
      size && `rottay-heading--${size}`,
      `rottay-heading--${color}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={ref as React.Ref<HTMLHeadingElement>}
        className={classNames}
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
 * Base Text component for inline text elements.
 *
 * Renders inline text with customizable appearance, decorations, and
 * flexible element rendering. Supports various text styles including
 * underline, strikethrough, italic, and monospace.
 *
 * Features:
 * - Multiple size and weight options
 * - Semantic color variants
 * - Text decorations (underline, strikethrough, italic)
 * - Monospace font support for code
 * - Flexible element rendering (span, p, div, label)
 * - Line clamping and truncation
 *
 * @example
 * ```tsx
 * <BaseText size="lg" color="primary" weight="semibold" italic>
 *   Important emphasized text
 * </BaseText>
 * ```
 */
export const BaseText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size = TYPOGRAPHY_DEFAULTS.text.size,
      weight = TYPOGRAPHY_DEFAULTS.text.weight,
      color = TYPOGRAPHY_DEFAULTS.text.color,
      align = TYPOGRAPHY_DEFAULTS.text.align,
      as = TYPOGRAPHY_DEFAULTS.text.as,
      truncate = TYPOGRAPHY_DEFAULTS.text.truncate,
      lineClamp,
      underline = TYPOGRAPHY_DEFAULTS.text.underline,
      strikethrough = TYPOGRAPHY_DEFAULTS.text.strikethrough,
      italic = TYPOGRAPHY_DEFAULTS.text.italic,
      monospace = TYPOGRAPHY_DEFAULTS.text.monospace,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const Component = as;

    // Compute text decoration value
    const getTextDecoration = (): string | undefined => {
      if (underline && strikethrough) return 'underline line-through';
      if (underline) return 'underline';
      if (strikethrough) return 'line-through';
      return undefined;
    };

    // Build computed styles
    const textStyles: React.CSSProperties = {
      fontSize: SIZE_MAP.text[size],
      fontWeight: WEIGHT_MAP[weight],
      textAlign: align,
      color: COLOR_MAP[color],
      fontFamily: monospace ? 'ui-monospace, monospace' : undefined,
      textDecoration: getTextDecoration(),
      fontStyle: italic ? 'italic' : undefined,
      // Truncation styles
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      // Line clamping
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    const classNames = [
      'rottay-text',
      `rottay-text--${size}`,
      `rottay-text--${color}`,
      underline && 'rottay-text--underline',
      strikethrough && 'rottay-text--strikethrough',
      italic && 'rottay-text--italic',
      monospace && 'rottay-text--monospace',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={ref as any}
        className={classNames}
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
 * Base Paragraph component for block-level text.
 *
 * Renders a paragraph element with optimized line-height and spacing
 * for readable body text. Supports text alignment, color variants,
 * and truncation options.
 *
 * Features:
 * - Optimized line-height (1.6) for readability
 * - Automatic bottom margin for spacing
 * - Text alignment and color variants
 * - Line clamping and truncation support
 * - CSS variable-based theming
 *
 * @example
 * ```tsx
 * <BaseParagraph size="md" color="muted" align="justify">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *   Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * </BaseParagraph>
 * ```
 */
export const BaseParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight = TYPOGRAPHY_DEFAULTS.paragraph.weight,
      color = TYPOGRAPHY_DEFAULTS.paragraph.color,
      align = TYPOGRAPHY_DEFAULTS.paragraph.align,
      truncate = TYPOGRAPHY_DEFAULTS.paragraph.truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Build computed styles
    const paragraphStyles: React.CSSProperties = {
      fontSize: SIZE_MAP.text[size],
      fontWeight: WEIGHT_MAP[weight],
      textAlign: align,
      color: COLOR_MAP[color],
      margin: '0 0 1em 0',
      lineHeight: 1.6,
      // Truncation styles
      overflow: truncate || lineClamp ? 'hidden' : undefined,
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      // Line clamping
      display: lineClamp ? '-webkit-box' : undefined,
      WebkitLineClamp: lineClamp,
      WebkitBoxOrient: lineClamp ? 'vertical' : undefined,
      ...style,
    };

    const classNames = [
      'rottay-paragraph',
      `rottay-paragraph--${size}`,
      `rottay-paragraph--${color}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <p
        ref={ref}
        className={classNames}
        style={paragraphStyles}
        {...props}
      >
        {children}
      </p>
    );
  }
);

BaseParagraph.displayName = 'BaseParagraph';
