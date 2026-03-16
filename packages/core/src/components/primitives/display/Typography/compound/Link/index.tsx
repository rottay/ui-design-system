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
import type { LinkProps } from '../../Typography.types';
import { ClassicLink } from '../../engines/classic';
import { ModernLink } from '../../engines/modern';
import { RusticLink } from '../../engines/rustic';

/**
 * Map of engine names to their respective Link implementations.
 */
const engineMap: Record<
  string,
  ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>
> = {
  classic: ClassicLink,
  modern: ModernLink,
  rustic: RusticLink,
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
 * <TypographyLink engine="rustic" href="/about">
 *   About
 * </TypographyLink>
 * ```
 *
 * @param props - LinkProps including engine, href, target, color, underline, and disabled
 * @param ref - Forwarded ref to the underlying anchor element
 * @returns The engine-specific anchor element with consistent link styling
 */
export const TypographyLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ engine = 'classic', ...props }, ref) => {
    // Fall back to ClassicLink if an unrecognized engine name is provided
    const Component = engineMap[engine] || ClassicLink;
    // Link does not apply personality tokens; styling is fully engine-driven
    return <Component ref={ref} {...props} />;
  }
);

TypographyLink.displayName = 'Typography.Link';
