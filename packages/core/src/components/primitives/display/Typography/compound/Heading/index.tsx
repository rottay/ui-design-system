/**
 * Typography Heading - Compound Component
 *
 * Engine-aware Heading component that can be used standalone or
 * as Typography.Heading in the compound pattern.
 *
 * @module Typography/compound/Heading
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { HeadingProps } from '../../types';
import { TitanHeading } from '../../engines/titan';
import { HermesHeading } from '../../engines/hermes';
import { ApolloHeading } from '../../engines/apollo';

/**
 * Map of engine names to their respective Heading implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<HeadingProps & RefAttributes<HTMLHeadingElement>>
> = {
  titan: TitanHeading,
  hermes: HermesHeading,
  apollo: ApolloHeading,
};

/**
 * Typography Heading component with engine-aware rendering.
 *
 * Renders semantic heading elements (h1-h6) with customizable visual
 * appearance. The visual size can differ from the semantic level,
 * allowing design flexibility while maintaining accessibility.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TypographyHeading level="h1">Page Title</TypographyHeading>
 *
 * // With custom size and color
 * <TypographyHeading level="h2" size="3xl" color="primary">
 *   Section Heading
 * </TypographyHeading>
 *
 * // With specific engine
 * <TypographyHeading engine="hermes" level="h3" weight="semibold">
 *   Subsection
 * </TypographyHeading>
 * ```
 */
export const TypographyHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const Component = engineMap[engine] || TitanHeading;
    return <Component ref={ref} {...props} />;
  }
);

TypographyHeading.displayName = 'Typography.Heading';
