/**
 * @fileoverview Typography.Link Compound - Rottay Design System
 * @description Engine-aware anchor/link component with consistent styling.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TypographyLink component provides styled anchor elements with
 * hover effects and consistent appearance across the design system.
 *
 * **Features:**
 * - Multiple color variants
 * - Underline on hover option
 * - External link handling (auto rel="noopener noreferrer")
 * - Disabled state support
 * - Engine-aware rendering
 *
 * **Use Cases:**
 * - Navigation links
 * - External links
 * - Inline text links
 * - Call-to-action links
 *
 * @example Basic Usage
 * ```tsx
 * <Typography.Link href="/about">About us</Typography.Link>
 * ```
 *
 * @example External Link
 * ```tsx
 * <Typography.Link href="https://example.com" target="_blank">
 *   Visit website
 * </Typography.Link>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link LinkProps} for available props
 * @module Typography/compound/Link
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LinkProps } from '../../types';
import { TitanLink } from '../../engines/titan';
import { HermesLink } from '../../engines/hermes';
import { ApolloLink } from '../../engines/apollo';

/**
 * Map of engine names to their respective Link implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>
> = {
  titan: TitanLink,
  hermes: HermesLink,
  apollo: ApolloLink,
};

/**
 * Typography Link component with engine-aware rendering.
 *
 * Renders styled anchor elements with customizable appearance
 * and hover effects. Supports external links and disabled state.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TypographyLink href="/dashboard">Go to Dashboard</TypographyLink>
 *
 * // External link with new tab
 * <TypographyLink href="https://docs.example.com" target="_blank">
 *   Documentation
 * </TypographyLink>
 *
 * // Styled link
 * <TypographyLink href="/contact" color="primary" underline>
 *   Contact us
 * </TypographyLink>
 *
 * // With specific engine
 * <TypographyLink engine="apollo" href="/about">
 *   About
 * </TypographyLink>
 * ```
 */
export const TypographyLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const Component = engineMap[engine] || TitanLink;
    return <Component ref={ref} {...props} />;
  }
);

TypographyLink.displayName = 'Typography.Link';
