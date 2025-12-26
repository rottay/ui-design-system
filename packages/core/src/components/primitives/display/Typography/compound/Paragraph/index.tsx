/**
 * Typography Paragraph - Compound Component
 *
 * Engine-aware Paragraph component that can be used standalone or
 * as Typography.Paragraph in the compound pattern.
 *
 * @module Typography/compound/Paragraph
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { ParagraphProps } from '../../types';
import { TitanParagraph } from '../../engines/titan';
import { HermesParagraph } from '../../engines/hermes';
import { ApolloParagraph } from '../../engines/apollo';

/**
 * Map of engine names to their respective Paragraph implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<ParagraphProps & RefAttributes<HTMLParagraphElement>>
> = {
  titan: TitanParagraph,
  hermes: HermesParagraph,
  apollo: ApolloParagraph,
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
  ({ engine = 'titan', ...props }, ref) => {
    const Component = engineMap[engine] || TitanParagraph;
    return <Component ref={ref} {...props} />;
  }
);

TypographyParagraph.displayName = 'Typography.Paragraph';
