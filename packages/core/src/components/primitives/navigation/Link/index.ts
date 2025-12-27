/**
 * Link - Engine Router
 *
 * This module exports the Link component with multi-engine support.
 * The Link component provides navigation with consistent styling
 * across Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) engines.
 *
 * @module Link
 * @example
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Basic usage
 * <Link href="/about">About Us</Link>
 *
 * // External link
 * <Link href="https://example.com" external>External Site</Link>
 *
 * // Styled link
 * <Link href="/contact" type="primary" underline={false}>Contact</Link>
 *
 * // With engine override
 * <Link engine="hermes" href="/docs">Documentation</Link>
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { LinkProps } from './types';

// Export types
export type { LinkProps, LinkType } from './types';
export { LINK_DEFAULTS, LINK_TYPE_COLORS } from './types';

// Export base component
export { BaseLink } from './base';

/**
 * Link component with multi-engine support.
 *
 * A styled anchor element for navigation with support for different types,
 * disabled state, external links, and underline control.
 *
 * @param props - Link component props
 * @returns React element
 */
export const Link = createEngineComponent<LinkProps>('Link', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
