/**
 * @fileoverview Typography - Rottay Design System
 * @description Text rendering components for headings, inline text, and paragraphs.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Typography with rich text features
 * - **Modern**: DaisyUI/Tailwind utility classes
 * - **Rustic**: Pure CSS implementation with zero dependencies
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
 * - `--ds-color-text-primary` - Default text color
 * - `--ds-color-text-secondary` - Muted text color
 * - `--ds-color-primary` - Primary accent color
 * - `--ds-color-success` - Success state color
 * - `--ds-color-warning` - Warning state color
 * - `--ds-color-error` - Error state color
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
 * <Typography.Heading engine="modern" level="h1">
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
  TypographyLink,
} from './compound';

// Export types
export type {
  HeadingProps,
  TextProps,
  ParagraphProps,
  LinkProps,
  TypographyProps,
  HeadingLevel,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
} from './Typography.types';

export { TYPOGRAPHY_DEFAULTS, SIZE_MAP, WEIGHT_MAP, COLOR_MAP } from './Typography.types';

// Export compound components individually
export { TypographyHeading, TypographyText, TypographyParagraph, TypographyLink };

// Export base components for direct usage or extension

// Standalone exports with shorter names
export { TypographyHeading as Heading };
export { TypographyText as Text };
export { TypographyParagraph as Paragraph };
export { TypographyLink as Link };

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

  /**
   * Styled anchor/link component.
   * @see LinkProps
   */
  Link: TypographyLink,
};

// Default export for convenience
export default Typography;
