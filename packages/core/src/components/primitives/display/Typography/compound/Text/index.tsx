/**
 * Typography Text - Compound Component
 *
 * Engine-aware Text component that can be used standalone or
 * as Typography.Text in the compound pattern.
 *
 * @module Typography/compound/Text
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { TextProps } from '../../types';
import { TitanText } from '../../engines/titan';
import { HermesText } from '../../engines/hermes';
import { ApolloText } from '../../engines/apollo';

/**
 * Map of engine names to their respective Text implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<TextProps & RefAttributes<HTMLElement>>
> = {
  titan: TitanText,
  hermes: HermesText,
  apollo: ApolloText,
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
 * <TypographyText engine="apollo" underline>
 *   Underlined link text
 * </TypographyText>
 * ```
 */
export const TypographyText = forwardRef<HTMLElement, TextProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const Component = engineMap[engine] || TitanText;
    return <Component ref={ref} {...props} />;
  }
);

TypographyText.displayName = 'Typography.Text';
