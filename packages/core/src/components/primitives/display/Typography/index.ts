/**
 * Typography - Engine Router
 *
 * Main entry point for the Typography component family.
 * Provides engine-aware Heading, Text, and Paragraph components
 * with a compound component pattern (Typography.Heading, etc.).
 *
 * @module Typography
 *
 * @example
 * ```tsx
 * // Using compound pattern
 * import { Typography } from '@es-rottay/designsystem-core';
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
 * @example
 * ```tsx
 * // Using individual components
 * import { Heading, Text, Paragraph } from '@es-rottay/designsystem-core';
 *
 * <Heading level="h2">Section Title</Heading>
 * <Text underline>Click here</Text>
 * <Paragraph lineClamp={3}>Long content...</Paragraph>
 * ```
 *
 * @example
 * ```tsx
 * // Using specific engine
 * <Typography.Heading engine="hermes" level="h1">
 *   Tailwind-styled Heading
 * </Typography.Heading>
 * ```
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
