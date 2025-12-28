/**
 * @fileoverview Typography - Rottay Design System
 * @description Text rendering components for headings, inline text, and paragraphs.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Typography with rich text features
 * - **Hermes**: DaisyUI/Tailwind utility classes
 * - **Apollo**: Pure CSS implementation with zero dependencies
 *
 * **Key Features:**
 * - Semantic heading levels (h1-h6) with visual size override
 * - Multiple text sizes (xs, sm, md, lg, xl, 2xl, 3xl)
 * - Font weights (normal, medium, semibold, bold)
 * - Text alignment (left, center, right, justify)
 * - Semantic colors (default, muted, primary, success, warning, error)
 * - Text decorations (underline, strikethrough, italic, monospace)
 * - Line clamping and truncation
 * - Flexible element rendering
 *
 * **Compound Components:**
 * - `Typography.Heading` - Semantic heading elements (h1-h6)
 * - `Typography.Text` - Inline text with decorations
 * - `Typography.Paragraph` - Block-level body text
 *
 * **CSS Custom Properties:**
 * - `--color-text-primary` - Default text color
 * - `--color-text-secondary` - Muted text color
 * - `--color-primary` - Primary accent color
 * - `--color-success` - Success state color
 * - `--color-warning` - Warning state color
 * - `--color-error` - Error state color
 *
 * @example Compound Pattern
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading level="h1" size="3xl">
 *   Page Title
 * </Typography.Heading>
 *
 * <Typography.Text color="muted">
 *   Some descriptive text
 * </Typography.Text>
 *
 * <Typography.Paragraph>
 *   Lorem ipsum dolor sit amet...
 * </Typography.Paragraph>
 * ```
 *
 * @example Individual Components
 * ```tsx
 * import { Heading, Text, Paragraph } from '@rottay/design-system';
 *
 * <Heading level="h2">Section Title</Heading>
 * <Text underline italic>Emphasized link</Text>
 * <Paragraph lineClamp={3}>Long content...</Paragraph>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Typography.Heading engine="hermes" level="h1">
 *   Tailwind-styled Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link HeadingProps} for heading properties
 * @see {@link TextProps} for text properties
 * @see {@link ParagraphProps} for paragraph properties
 * @module Typography
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import {
  TypographyHeading,
  TypographyText,
  TypographyParagraph,
} from './compound';

// Export types
export type {
  HeadingProps,
  TextProps,
  ParagraphProps,
  TypographyProps,
  HeadingLevel,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
} from './types';

export { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, COLOR_MAP } from './types';

// Export compound components individually
export { TypographyHeading, TypographyText, TypographyParagraph };

// Export base components for direct usage or extension
export { BaseHeading, BaseText, BaseParagraph } from './base';

// Standalone exports with shorter names
export { TypographyHeading as Heading };
export { TypographyText as Text };
export { TypographyParagraph as Paragraph };

/**
 * Typography compound component.
 *
 * Provides access to Heading, Text, and Paragraph sub-components
 * through a namespace pattern for organized imports.
 *
 * @example
 * ```tsx
 * <Typography.Heading level="h1">Title</Typography.Heading>
 * <Typography.Text color="primary">Highlighted text</Typography.Text>
 * <Typography.Paragraph>Body content...</Typography.Paragraph>
 * ```
 */
export const Typography = {
  /**
   * Semantic heading component (h1-h6).
   * @see HeadingProps
   */
  Heading: TypographyHeading,

  /**
   * Inline text component with decorations.
   * @see TextProps
   */
  Text: TypographyText,

  /**
   * Block-level paragraph component.
   * @see ParagraphProps
   */
  Paragraph: TypographyParagraph,
};

// Default export for convenience
export default Typography;
