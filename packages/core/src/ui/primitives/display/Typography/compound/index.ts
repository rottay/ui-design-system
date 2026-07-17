/**
 * @fileoverview Typography Compound Components - Rottay Design System
 * @description Barrel export for Typography compound components.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components for the Typography namespace.
 * These components can be used standalone or through the Typography namespace.
 *
 * **Available Components:**
 * - `TypographyHeading` - Engine-aware heading (h1-h6)
 * - `TypographyText` - Engine-aware inline text
 * - `TypographyParagraph` - Engine-aware paragraph
 * - `TypographyLink` - Engine-aware anchor/link with hover effects
 *
 * **Usage Patterns:**
 * ```tsx
 * // Standalone import
 * import { TypographyHeading } from '@rottay/design-system';
 * <TypographyHeading level="h1">Title</TypographyHeading>
 *
 * // Namespace pattern
 * import { Typography } from '@rottay/design-system';
 * <Typography.Heading level="h1">Title</Typography.Heading>
 *
 * // Alias imports
 * import { Heading, Text, Paragraph } from '@rottay/design-system';
 * <Heading level="h1">Title</Heading>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link TypographyHeading} for heading component
 * @see {@link TypographyText} for text component
 * @see {@link TypographyParagraph} for paragraph component
 * @see {@link TypographyLink} for link component
 * @module Typography/compound
 * @category Display
 * @package @rottay/design-system
 */

export { TypographyHeading } from './Heading';
export { TypographyText } from './Text';
export { TypographyParagraph } from './Paragraph';
export { TypographyLink } from './Link';

export type { HeadingProps, TextProps, ParagraphProps, LinkProps } from '../contracts';
