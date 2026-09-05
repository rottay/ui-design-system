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
 * @module Typography/compound/link
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LinkProps } from '../../contracts';
import { ClassicLink } from '../../engines/classic';
import { ModernLink } from '../../engines/modern';
import { RusticLink } from '../../engines/rustic';
import { useDeclaredEngine } from '../../../../../../infrastructure/runtime/engines/composition/react/provider';
import type { ImplementedEngineName } from '../../../../../../infrastructure/runtime/engines/presentation/component-factory';

type LinkImplementation = ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>;

/**
 * Map of engine names to their respective Link implementations.
 */
const engineMap: Record<ImplementedEngineName, LinkImplementation> = {
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
  ({ engine, ...props }, ref) => {
    const declaredEngine = useDeclaredEngine();
    const activeEngine = engine ?? declaredEngine;
    const Component = engineMap[activeEngine as ImplementedEngineName] as
      | LinkImplementation
      | undefined;
    if (!Component) {
      throw new Error(
        `TypographyLink: no implementation for engine ${JSON.stringify(activeEngine)}. ` +
          'Pass an `engine` prop or mount a provider; there is no fallback engine.'
      );
    }
    // Link does not apply personality tokens; styling is fully engine-driven
    return <Component ref={ref} {...props} />;
  }
);

TypographyLink.displayName = 'Typography.Link';

/**
 * Short alias for direct-entrypoint consumers.
 *
 * The parent `Typography` barrel also publishes this alias, but the governed
 * public entrypoint and every deep import resolve this module directly, so the
 * alias has to exist here or those bindings resolve to `undefined`.
 */
export { TypographyLink as Link };
