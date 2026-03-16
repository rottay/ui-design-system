/**
 * @fileoverview Typography.Text Compound - Rottay Design System
 * @description Engine-aware inline text component with decorations.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TypographyText component provides inline text with customizable
 * appearance, decorations, and flexible element rendering.
 *
 * **Features:**
 * - Multiple sizes and font weights
 * - Semantic color variants
 * - Text decorations (underline, strikethrough, italic)
 * - Monospace font for code
 * - Flexible element rendering (span, p, div, label)
 * - Line clamping and truncation
 * - Engine-aware rendering
 *
 * **Use Cases:**
 * - Inline emphasized text
 * - Code snippets
 * - Labels and annotations
 * - Styled links
 *
 * @example Basic Usage
 * ```tsx
 * <Typography.Text color="primary" weight="semibold">
 *   Important text
 * </Typography.Text>
 * ```
 *
 * @example With Decorations
 * ```tsx
 * <Typography.Text underline italic color="muted">
 *   Emphasized note
 * </Typography.Text>
 * ```
 *
 * @example Code Style
 * ```tsx
 * <Typography.Text monospace color="error">
 *   console.error('message')
 * </Typography.Text>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link TextProps} for available props
 * @module Typography/compound/Text
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useOptionalTokens } from '../../../../../../hooks';
import {
  mergePersonalityStyle,
  resolveTypographyTextStyle,
} from '../../../../../../personality/primitives';
import type { TextProps } from '../../Typography.types';
import { ClassicText } from '../../engines/classic';
import { ModernText } from '../../engines/modern';
import { RusticText } from '../../engines/rustic';

/**
 * Map of engine names to their respective Text implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<TextProps & RefAttributes<HTMLElement>>
> = {
  classic: ClassicText,
  modern: ModernText,
  rustic: RusticText,
};

/**
 * Typography Text component with engine-aware rendering.
 *
 * Renders inline text with customizable appearance, decorations,
 * and flexible element rendering. Supports underline, strikethrough,
 * italic, and monospace styles.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TypographyText>Regular text content</TypographyText>
 *
 * // With styling options
 * <TypographyText size="lg" color="primary" weight="semibold" italic>
 *   Emphasized important text
 * </TypographyText>
 *
 * // Code-style text
 * <TypographyText monospace color="error">
 *   console.error('Something went wrong')
 * </TypographyText>
 *
 * // With specific engine
 * <TypographyText engine="rustic" underline>
 *   Underlined link text
 * </TypographyText>
 * ```
 *
 * @param props - TextProps including engine, as, size, weight, color, monospace, italic, underline, and children
 * @param ref - Forwarded ref to the underlying inline element (span, p, div, or label)
 * @returns The engine-specific inline text element with personality token styles merged in
 */
export const TypographyText = forwardRef<HTMLElement, TextProps>(
  ({ engine = 'classic', ...props }, ref) => {
    // Resolve optional personality tokens from context (if a PersonalityProvider is present)
    const tokens = useOptionalTokens();
    // Fall back to ClassicText if an unrecognized engine name is provided
    const Component = engineMap[engine] || ClassicText;

    return (
      <Component
        ref={ref}
        {...props}
        style={mergePersonalityStyle(
          props.style,
          // When as="label", resolveTypographyTextStyle applies label-specific token overrides
          tokens ? resolveTypographyTextStyle(tokens, props.as === 'label') : undefined
        )}
      />
    );
  }
);

TypographyText.displayName = 'Typography.Text';
