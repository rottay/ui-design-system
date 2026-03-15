/**
 * @fileoverview Typography Apollo Engine - Rottay Design System
 * @description Pure CSS typography implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides lightweight, dependency-free typography using
 * only CSS variables and semantic HTML elements.
 *
 * **Available Components:**
 * - `ApolloHeading` - Pure CSS heading (h1-h6)
 * - `ApolloText` - Pure CSS inline text
 * - `ApolloParagraph` - Pure CSS paragraph
 *
 * **Implementation Details:**
 * - Self-contained implementation using CSS variables
 * - Semantic HTML elements for accessibility
 * - All styling via var(--ds-*) tokens
 *
 * **CSS Custom Properties:**
 * - `--ds-color-text-primary` - Default text color
 * - `--ds-color-text-secondary` - Muted text color
 * - `--ds-color-primary-500` - Primary accent color
 * - `--ds-color-success-500`, etc.
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="rustic" level="h1">
 *   Lightweight Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @module Typography/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { HeadingProps, TextProps, ParagraphProps, LinkProps } from '../Typography.types';
import { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, COLOR_MAP } from '../Typography.types';

/**
 * Apollo (Vanilla/CSS) implementation of Heading component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides maximum accessibility and zero external dependencies.
 */
export const ApolloHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    const {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight = TYPOGRAPHY_DEFAULTS.heading.weight,
      align = TYPOGRAPHY_DEFAULTS.heading.align,
      color = TYPOGRAPHY_DEFAULTS.heading.color,
      truncate = TYPOGRAPHY_DEFAULTS.heading.truncate,
      lineClamp,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    const Tag = level as keyof React.JSX.IntrinsicElements;

    // Map level to default size if not specified
    const defaultSizeMap: Record<string, keyof typeof SIZE_MAP.heading> = {
      h1: '3xl',
      h2: '2xl',
      h3: 'xl',
      h4: 'lg',
      h5: 'md',
      h6: 'sm',
    };
    const effectiveSize = size || defaultSizeMap[level];

    const headingStyle: React.CSSProperties = {
      fontSize: SIZE_MAP.heading[effectiveSize] || SIZE_MAP.heading.md,
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.bold,
      color: COLOR_MAP[color] || COLOR_MAP.default,
      textAlign: align,
      margin: 0,
      lineHeight: 1.2,
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      ...(lineClamp && {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }),
      ...style,
    };

    const HeadingElement = Tag as React.ElementType;
    return (
      <HeadingElement
        ref={ref}
        className={`rottay-heading rottay-heading--${level} ${className}`.trim()}
        style={headingStyle}
        {...restProps}
      >
        {children}
      </HeadingElement>
    );
  }
);

ApolloHeading.displayName = 'ApolloHeading';

/**
 * Apollo (Vanilla/CSS) implementation of Text component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Supports all text decorations without external dependencies.
 */
export const ApolloText = forwardRef<HTMLElement, TextProps>(
  (props, ref) => {
    const {
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
      className = '',
      style,
      ...restProps
    } = props;

    const Tag = as as keyof React.JSX.IntrinsicElements;

    // Build text decorations
    const decorations: string[] = [];
    if (underline) decorations.push('underline');
    if (strikethrough) decorations.push('line-through');

    const textStyle: React.CSSProperties = {
      fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md,
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.normal,
      color: COLOR_MAP[color] || COLOR_MAP.default,
      textAlign: align,
      fontStyle: italic ? 'italic' : undefined,
      fontFamily: monospace ? 'var(--ds-font-mono, monospace)' : undefined,
      textDecoration: decorations.length > 0 ? decorations.join(' ') : undefined,
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      ...(lineClamp && {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }),
      ...style,
    };

    const TextElement = Tag as React.ElementType;
    return (
      <TextElement
        ref={ref}
        className={`rottay-text ${className}`.trim()}
        style={textStyle}
        {...restProps}
      >
        {children}
      </TextElement>
    );
  }
);

ApolloText.displayName = 'ApolloText';

/**
 * Apollo (Vanilla/CSS) implementation of Paragraph component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides optimized line-height and spacing for readability.
 */
export const ApolloParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => {
    const {
      size = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight = TYPOGRAPHY_DEFAULTS.paragraph.weight,
      color = TYPOGRAPHY_DEFAULTS.paragraph.color,
      align = TYPOGRAPHY_DEFAULTS.paragraph.align,
      truncate = TYPOGRAPHY_DEFAULTS.paragraph.truncate,
      lineClamp,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    const paragraphStyle: React.CSSProperties = {
      fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md,
      fontWeight: WEIGHT_MAP[weight] || WEIGHT_MAP.normal,
      color: COLOR_MAP[color] || COLOR_MAP.default,
      textAlign: align,
      lineHeight: 'var(--ds-line-height-relaxed, 1.625)',
      margin: 0,
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      ...(lineClamp && {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }),
      ...style,
    };

    return (
      <p
        ref={ref}
        className={`rottay-paragraph ${className}`.trim()}
        style={paragraphStyle}
        {...restProps}
      >
        {children}
      </p>
    );
  }
);

ApolloParagraph.displayName = 'ApolloParagraph';

/**
 * Apollo (Vanilla/CSS) implementation of Link component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides styled anchor elements with hover effects.
 */
export const ApolloLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      href,
      target,
      rel,
      size = TYPOGRAPHY_DEFAULTS.link.size,
      weight,
      color = TYPOGRAPHY_DEFAULTS.link.color,
      underlineOnHover = TYPOGRAPHY_DEFAULTS.link.underlineOnHover,
      underline = TYPOGRAPHY_DEFAULTS.link.underline,
      disabled = TYPOGRAPHY_DEFAULTS.link.disabled,
      strong = TYPOGRAPHY_DEFAULTS.link.strong,
      onClick,
      children,
      className = '',
      style,
      ...restProps
    } = props;

    // Auto-set rel for external links
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

    const linkStyle: React.CSSProperties = {
      fontSize: SIZE_MAP.text[size] || SIZE_MAP.text.md,
      fontWeight: strong ? WEIGHT_MAP.semibold : (weight ? WEIGHT_MAP[weight] : WEIGHT_MAP.normal),
      color: COLOR_MAP[color] || COLOR_MAP.primary,
      textDecoration: underline ? 'underline' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'color 0.2s, text-decoration 0.2s',
      ...style,
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        target={target}
        rel={computedRel}
        onClick={handleClick}
        className={`rottay-link ${className}`.trim()}
        style={linkStyle}
        aria-disabled={disabled}
        {...restProps}
      >
        {children}
      </a>
    );
  }
);

ApolloLink.displayName = 'ApolloLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
// Aliases for rustic naming convention
export { ApolloHeading as RusticHeading };
export { ApolloText as RusticText };
export { ApolloParagraph as RusticParagraph };
export { ApolloLink as RusticLink };

export default ApolloHeading;
