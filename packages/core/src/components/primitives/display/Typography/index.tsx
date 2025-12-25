'use client';

import React, { forwardRef } from 'react';
import type { HeadingProps, TextProps, ParagraphProps } from './types';
import {
  TitanHeading,
  TitanText,
  TitanParagraph,
  HermesHeading,
  HermesText,
  HermesParagraph,
  ApolloHeading,
  ApolloText,
  ApolloParagraph,
} from './engines';

/**
 * Heading component with engine-aware rendering.
 *
 * Semantic heading element (h1-h6) with customizable visual appearance.
 *
 * @example
 * ```tsx
 * <Heading level="h1" size="3xl" weight="bold">
 *   Page Title
 * </Heading>
 * ```
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap = {
      titan: TitanHeading,
      hermes: HermesHeading,
      apollo: ApolloHeading,
    };

    const Component = engineMap[engine];
    return <Component ref={ref} {...props} />;
  }
);

Heading.displayName = 'Heading';

/**
 * Text component with engine-aware rendering.
 *
 * Inline text element with customizable appearance and decorations.
 *
 * @example
 * ```tsx
 * <Text size="lg" color="primary" weight="semibold">
 *   Important text
 * </Text>
 * ```
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap = {
      titan: TitanText,
      hermes: HermesText,
      apollo: ApolloText,
    };

    const Component = engineMap[engine];
    return <Component ref={ref} {...props} />;
  }
);

Text.displayName = 'Text';

/**
 * Paragraph component with engine-aware rendering.
 *
 * Block-level paragraph element with optimized line-height and spacing.
 *
 * @example
 * ```tsx
 * <Paragraph size="md" color="muted">
 *   Lorem ipsum dolor sit amet...
 * </Paragraph>
 * ```
 */
export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap = {
      titan: TitanParagraph,
      hermes: HermesParagraph,
      apollo: ApolloParagraph,
    };

    const Component = engineMap[engine];
    return <Component ref={ref} {...props} />;
  }
);

Paragraph.displayName = 'Paragraph';

// Composite Typography component
export const Typography = {
  Heading,
  Text,
  Paragraph,
};

// Export types
export type {
  HeadingProps,
  TextProps,
  ParagraphProps,
  HeadingLevel,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
} from './types';
