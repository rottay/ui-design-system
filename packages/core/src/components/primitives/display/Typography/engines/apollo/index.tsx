/**
 * @fileoverview Typography Apollo Engine - Rottay Design System
 * @description Pure CSS typography implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides lightweight, dependency-free typography using
 * the base components with CSS variables.
 *
 * **Available Components:**
 * - `ApolloHeading` - Pure CSS heading (h1-h6)
 * - `ApolloText` - Pure CSS inline text
 * - `ApolloParagraph` - Pure CSS paragraph
 *
 * **Implementation Details:**
 * - Extends BaseHeading, BaseText, BaseParagraph
 * - Uses CSS variables for all visual properties
 * - Semantic HTML elements for accessibility
 * - Full keyboard navigation support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full CSS variable customization
 * - Maximum accessibility compliance
 *
 * **CSS Custom Properties:**
 * - `--color-text-primary` - Default text color
 * - `--color-text-secondary` - Muted text color
 * - `--color-primary` - Primary accent color
 * - `--color-success`, `--color-warning`, `--color-error`
 *
 * @example Basic Usage
 * ```tsx
 * import { Typography } from '@rottay/design-system';
 *
 * <Typography.Heading engine="apollo" level="h1">
 *   Lightweight Heading
 * </Typography.Heading>
 * ```
 *
 * @see {@link Typography} for the main component
 * @see {@link BaseHeading} for CSS variable implementation
 * @module Typography/engines/apollo
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import { BaseHeading, BaseText, BaseParagraph } from '../../base';
import type { HeadingProps, TextProps, ParagraphProps } from '../../types';

/**
 * Apollo (Vanilla/CSS) implementation of Heading component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides maximum accessibility and zero external dependencies.
 *
 * @example
 * ```tsx
 * <ApolloHeading level="h1" size="3xl" color="primary">
 *   Welcome to the Dashboard
 * </ApolloHeading>
 * ```
 */
export const ApolloHeading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => <BaseHeading ref={ref} {...props} />
);

ApolloHeading.displayName = 'ApolloHeading';

/**
 * Apollo (Vanilla/CSS) implementation of Text component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Supports all text decorations without external dependencies.
 *
 * @example
 * ```tsx
 * <ApolloText color="success" underline>
 *   Successfully saved!
 * </ApolloText>
 * ```
 */
export const ApolloText = forwardRef<HTMLElement, TextProps>(
  (props, ref) => <BaseText ref={ref} {...props} />
);

ApolloText.displayName = 'ApolloText';

/**
 * Apollo (Vanilla/CSS) implementation of Paragraph component.
 *
 * Pure CSS implementation using CSS variables and inline styles.
 * Provides optimized line-height and spacing for readability.
 *
 * @example
 * ```tsx
 * <ApolloParagraph color="muted" align="justify">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * </ApolloParagraph>
 * ```
 */
export const ApolloParagraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (props, ref) => <BaseParagraph ref={ref} {...props} />
);

ApolloParagraph.displayName = 'ApolloParagraph';

/**
 * Default export for engine factory compatibility.
 * Exports the primary Heading component for the Typography namespace.
 */
export default ApolloHeading;
