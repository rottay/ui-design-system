/**
 * @fileoverview Typography.Paragraph Compound - Rottay Design System
 * @description Engine-aware block-level paragraph component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TypographyParagraph component provides block-level text with
 * optimized line-height and spacing for readable body content.
 *
 * **Features:**
 * - Optimized line-height (1.6) for readability
 * - Automatic bottom margin for spacing
 * - Multiple sizes and colors
 * - Text alignment options
 * - Line clamping for excerpts
 * - Engine-aware rendering
 *
 * **Use Cases:**
 * - Body text and content
 * - Article paragraphs
 * - Descriptions and summaries
 * - Truncated previews
 *
 * @example Basic Usage
 * ```tsx
 * <Typography.Paragraph>
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *   Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * </Typography.Paragraph>
 * ```
 *
 * @example With Line Clamping
 * ```tsx
 * <Typography.Paragraph lineClamp={3} color="muted">
 *   This long paragraph will be truncated after 3 lines
 *   with an ellipsis indicator...
 * </Typography.Paragraph>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link ParagraphProps} for available props
 * @module Typography/compound/Paragraph
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useOptionalTokens } from '../../../../../../core/hooks';
import {
  mergePersonalityStyle,
  resolveTypographyTextStyle,
} from '../../../../../../core/personality/primitives';
import type { ParagraphProps } from '../../types';
import { ClassicParagraph } from '../../engines/classic';
import { ModernParagraph } from '../../engines/modern';
import { RusticParagraph } from '../../engines/rustic';

/**
 * Map of engine names to their respective Paragraph implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<ParagraphProps & RefAttributes<HTMLParagraphElement>>
> = {
  classic: ClassicParagraph,
  modern: ModernParagraph,
  rustic: RusticParagraph,
};

/**
 * Typography Paragraph component with engine-aware rendering.
 *
 * Renders block-level text with optimized line-height and spacing
 * for readable body text. Supports alignment, colors, and truncation.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TypographyParagraph>
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </TypographyParagraph>
 *
 * // With styling options
 * <TypographyParagraph size="lg" color="muted" align="justify">
 *   This is a longer paragraph with justified text alignment and
 *   a muted color for secondary content.
 * </TypographyParagraph>
 *
 * // With line clamping
 * <TypographyParagraph lineClamp={3}>
 *   This paragraph will be truncated after 3 lines with an ellipsis
 *   if the content exceeds that limit.
 * </TypographyParagraph>
 * ```
 */
export const TypographyParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ engine = 'classic', ...props }, ref) => {
    const tokens = useOptionalTokens();
    const Component = engineMap[engine] || ClassicParagraph;

    return (
      <Component
        ref={ref}
        {...props}
        style={mergePersonalityStyle(
          props.style,
          tokens ? resolveTypographyTextStyle(tokens, false) : undefined
        )}
      />
    );
  }
);

TypographyParagraph.displayName = 'Typography.Paragraph';
