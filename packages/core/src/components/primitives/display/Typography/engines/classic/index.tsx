/**
 * @fileoverview Typography Classic Engine - Rottay Design System
 * @description Ant Design-based typography with rich text features.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Typography components to provide
 * rich text features with consistent design system API.
 *
 * **Available Components:**
 * - `ClassicHeading` - Ant Design Title wrapper
 * - `ClassicText` - Ant Design Text wrapper
 * - `ClassicParagraph` - Ant Design Paragraph wrapper
 *
 * **Implementation Details:**
 * - Maps heading levels to Ant Design Title levels (1-5)
 * - Maps colors to Ant Design text types
 * - Uses built-in ellipsis for truncation
 * - h6 maps to level 5 (Ant Design limitation)
 *
 * **Ant Design Features:**
 * - Built-in copy to clipboard
 * - Editable text support
 * - Expandable truncation
 * - Typography context
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="classic" level="h1">
 *   Rich Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @see {@link https://ant.design/components/typography} Ant Design Typography
 * @module Typography/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import { Typography as AntTypography } from 'antd';
import type { HeadingProps, TextProps, ParagraphProps, LinkProps } from '../../types';
import { TYPOGRAPHY_DEFAULTS } from '../../types';

const { Title, Text: AntText, Paragraph: AntParagraph, Link: AntLink } = AntTypography;

/**
 * Maps design system heading levels to Ant Design Title levels.
 */
const LEVEL_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 5, // Ant Design only supports levels 1-5
};

/**
 * Maps design system color variants to Ant Design text types.
 */
const TYPE_MAP: Record<string, 'secondary' | 'success' | 'warning' | 'danger' | undefined> = {
  default: undefined,
  muted: 'secondary',
  primary: undefined, // Primary uses custom styling
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

/**
 * Classic (Ant Design) implementation of Heading component.
 *
 * Wraps Ant Design's Title component with design system props interface.
 * Supports all heading levels and color variants.
 *
 * @example
 * ```tsx
 * <ClassicHeading level="h1" color="primary">
 *   Welcome to the Dashboard
 * </ClassicHeading>
 * ```
 */
export const ClassicHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = TYPOGRAPHY_DEFAULTS.heading.level,
      size,
      weight,
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
    // Build ellipsis config for truncation
    const ellipsisConfig = truncate || lineClamp
      ? { rows: lineClamp || 1 }
      : undefined;

    return (
      <Title
        ref={ref as React.Ref<HTMLElement>}
        level={LEVEL_MAP[level]}
        type={TYPE_MAP[color]}
        ellipsis={ellipsisConfig}
        style={{
          textAlign: align,
          margin: 0,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </Title>
    );
  }
);

ClassicHeading.displayName = 'ClassicHeading';

/**
 * Classic (Ant Design) implementation of Text component.
 *
 * Wraps Ant Design's Text component with design system props interface.
 * Supports text decorations, colors, and truncation.
 *
 * @example
 * ```tsx
 * <ClassicText color="success" underline>
 *   Successfully saved!
 * </ClassicText>
 * ```
 */
export const ClassicText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size = TYPOGRAPHY_DEFAULTS.text.size,
      weight,
      color = TYPOGRAPHY_DEFAULTS.text.color,
      align = TYPOGRAPHY_DEFAULTS.text.align,
      as,
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
    // Build ellipsis config for truncation
    const ellipsisConfig = truncate || lineClamp ? true : undefined;

    return (
      <AntText
        ref={ref as React.Ref<HTMLElement>}
        type={TYPE_MAP[color]}
        underline={underline}
        delete={strikethrough}
        italic={italic}
        code={monospace}
        ellipsis={ellipsisConfig}
        style={{
          textAlign: align,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </AntText>
    );
  }
);

ClassicText.displayName = 'ClassicText';

/**
 * Classic (Ant Design) implementation of Paragraph component.
 *
 * Wraps Ant Design's Paragraph component with design system props interface.
 * Provides optimized line-height and spacing for body text.
 *
 * @example
 * ```tsx
 * <ClassicParagraph color="muted">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </ClassicParagraph>
 * ```
 */
export const ClassicParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size = TYPOGRAPHY_DEFAULTS.paragraph.size,
      weight,
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
    // Build ellipsis config for truncation
    const ellipsisConfig = truncate || lineClamp
      ? { rows: lineClamp || 1 }
      : undefined;

    return (
      <AntParagraph
        ref={ref as React.Ref<HTMLElement>}
        type={TYPE_MAP[color]}
        ellipsis={ellipsisConfig}
        style={{
          textAlign: align,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </AntParagraph>
    );
  }
);

ClassicParagraph.displayName = 'ClassicParagraph';

/**
 * Classic (Ant Design) implementation of Link component.
 *
 * Wraps Ant Design's Link component with design system props interface.
 * Provides styled anchor elements with consistent appearance.
 *
 * @example
 * ```tsx
 * <ClassicLink href="/about">Learn more</ClassicLink>
 * <ClassicLink href="https://example.com" target="_blank">External link</ClassicLink>
 * ```
 */
export const ClassicLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Auto-set rel for external links
    const computedRel = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);

    return (
      <AntLink
        ref={ref as React.Ref<HTMLElement>}
        href={href}
        target={target}
        rel={computedRel}
        type={TYPE_MAP[color]}
        underline={underline || !underlineOnHover}
        disabled={disabled}
        strong={strong}
        onClick={onClick}
        style={style}
        className={className}
        {...props}
      >
        {children}
      </AntLink>
    );
  }
);

ClassicLink.displayName = 'ClassicLink';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default ClassicHeading;
