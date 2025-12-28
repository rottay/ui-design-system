/**
 * @fileoverview Typography.Heading Compound - Rottay Design System
 * @description Engine-aware semantic heading component (h1-h6).
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TypographyHeading component provides semantic heading elements with
 * customizable visual appearance independent of semantic level.
 *
 * **Features:**
 * - Semantic h1-h6 levels for document outline
 * - Visual size independent of semantic level
 * - Multiple font weights and colors
 * - Text alignment options
 * - Line clamping and truncation
 * - Engine-aware rendering
 *
 * **Accessibility:**
 * - Uses proper heading hierarchy for screen readers
 * - Maintains semantic structure regardless of visual size
 *
 * @example Basic Usage
 * ```tsx
 * <Typography.Heading level="h1" size="3xl">
 *   Page Title
 * </Typography.Heading>
 * ```
 *
 * @example Visual Override
 * ```tsx
 * <Typography.Heading level="h3" size="xl" color="primary">
 *   Section (h3 with xl visual size)
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link HeadingProps} for available props
 * @module Typography/compound/Heading
 * @category Display
 * @package @rottay/design-system
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
