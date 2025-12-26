/**
 * Typography - Titan Engine Implementation
 *
 * Ant Design-based implementation of Typography components.
 * Uses Ant Design's Typography components for consistent styling
 * with the Ant Design ecosystem.
 *
 * @module Typography/engines/titan
 */

'use client';

import { forwardRef } from 'react';
import { Typography as AntTypography } from 'antd';
import type { HeadingProps, TextProps, ParagraphProps } from '../../types';
import { TYPOGRAPHY_DEFAULTS } from '../../types';

const { Title, Text: AntText, Paragraph: AntParagraph } = AntTypography;

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
 * Titan (Ant Design) implementation of Heading component.
 *
 * Wraps Ant Design's Title component with design system props interface.
 * Supports all heading levels and color variants.
 *
 * @example
 * ```tsx
 * <TitanHeading level="h1" color="primary">
 *   Welcome to the Dashboard
 * </TitanHeading>
 * ```
 */
export const TitanHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
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

TitanHeading.displayName = 'TitanHeading';

/**
 * Titan (Ant Design) implementation of Text component.
 *
 * Wraps Ant Design's Text component with design system props interface.
 * Supports text decorations, colors, and truncation.
 *
 * @example
 * ```tsx
 * <TitanText color="success" underline>
 *   Successfully saved!
 * </TitanText>
 * ```
 */
export const TitanText = forwardRef<HTMLElement, TextProps>(
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

TitanText.displayName = 'TitanText';

/**
 * Titan (Ant Design) implementation of Paragraph component.
 *
 * Wraps Ant Design's Paragraph component with design system props interface.
 * Provides optimized line-height and spacing for body text.
 *
 * @example
 * ```tsx
 * <TitanParagraph color="muted">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </TitanParagraph>
 * ```
 */
export const TitanParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
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

TitanParagraph.displayName = 'TitanParagraph';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default TitanHeading;
