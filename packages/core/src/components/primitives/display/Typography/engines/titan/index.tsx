'use client';

import { forwardRef } from 'react';
import { Typography as AntTypography } from 'antd';
import type { HeadingProps, TextProps, ParagraphProps } from '../../types';

const { Title, Text: AntText, Paragraph: AntParagraph } = AntTypography;

/**
 * Titan (Ant Design) implementation of Heading component.
 */
export const TitanHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = 'h2',
      size,
      weight,
      align,
      color,
      truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const levelMap = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

    const typeMap = {
      default: undefined,
      muted: 'secondary',
      primary: undefined,
      success: 'success',
      warning: 'warning',
      error: 'danger',
    };

    return (
      <Title
        ref={ref as any}
        level={levelMap[level] as any}
        type={typeMap[color || 'default'] as any}
        ellipsis={truncate || lineClamp ? true : undefined}
        style={{ textAlign: align, ...style }}
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
 */
export const TitanText = forwardRef<HTMLElement, TextProps>(
  (
    {
      size,
      weight,
      color,
      align,
      as,
      truncate,
      lineClamp,
      underline,
      strikethrough,
      italic,
      monospace,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const typeMap = {
      default: undefined,
      muted: 'secondary',
      primary: undefined,
      success: 'success',
      warning: 'warning',
      error: 'danger',
    };

    return (
      <AntText
        ref={ref as any}
        type={typeMap[color || 'default'] as any}
        underline={underline}
        delete={strikethrough}
        italic={italic}
        code={monospace}
        ellipsis={truncate || lineClamp ? true : undefined}
        style={{ textAlign: align, ...style }}
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
 */
export const TitanParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      size,
      weight,
      color,
      align,
      truncate,
      lineClamp,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const typeMap = {
      default: undefined,
      muted: 'secondary',
      primary: undefined,
      success: 'success',
      warning: 'warning',
      error: 'danger',
    };

    return (
      <AntParagraph
        ref={ref as any}
        type={typeMap[color || 'default'] as any}
        ellipsis={truncate || lineClamp ? true : undefined}
        style={{ textAlign: align, ...style }}
        className={className}
        {...props}
      >
        {children}
      </AntParagraph>
    );
  }
);

TitanParagraph.displayName = 'TitanParagraph';
