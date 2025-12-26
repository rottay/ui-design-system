/**
 * Typography - Apollo Engine Implementation
 *
 * Pure CSS/Vanilla implementation of Typography components.
 * Provides headless, accessible components without external dependencies.
 * Uses the base components for maximum flexibility and accessibility.
 *
 * @module Typography/engines/apollo
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
