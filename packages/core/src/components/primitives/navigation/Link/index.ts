/**
 * @fileoverview Link Component - Rottay Design System
 * @description A styled anchor element for navigation with multi-engine support.
 * Part of the Rottay Design System's navigation primitives collection.
 *
 * @remarks
 * The Link component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - link styling automatically adapts
 * to your tenant's brand colors, typography, and interaction states.
 *
 * @example Basic Usage
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <nav>
 *       <Link href="/home">Home</Link>
 *       <Link href="/about">About Us</Link>
 *       <Link href="/contact">Contact</Link>
 *     </nav>
 *   );
 * }
 * ```
 *
 * @example External Links
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // External link opens in new tab with security attributes
 * <Link href="https://github.com" external>
 *   View on GitHub
 * </Link>
 *
 * // Automatically adds target="_blank" and rel="noopener noreferrer"
 * ```
 *
 * @example Link Types (Semantic Colors)
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Default blue link
 * <Link href="/docs" type="default">Documentation</Link>
 *
 * // Primary brand color
 * <Link href="/features" type="primary">Features</Link>
 *
 * // Secondary/accent color
 * <Link href="/blog" type="secondary">Blog</Link>
 *
 * // Success state (green)
 * <Link href="/success" type="success">Completed</Link>
 *
 * // Warning state (orange)
 * <Link href="/warning" type="warning">Attention Required</Link>
 *
 * // Danger state (red)
 * <Link href="/delete" type="danger">Delete Account</Link>
 * ```
 *
 * @example Underline Control
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // With underline (default)
 * <Link href="/about" underline>Underlined Link</Link>
 *
 * // Without underline
 * <Link href="/about" underline={false}>Clean Link</Link>
 * ```
 *
 * @example Disabled State
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Disabled link - prevents navigation and shows disabled styling
 * <Link href="/restricted" disabled>
 *   Premium Content (Upgrade Required)
 * </Link>
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * import { Link, ThemeProvider } from '@rottay/design-system';
 *
 * // Link automatically inherits tenant theme colors
 * <ThemeProvider tenant="acme-corp">
 *   <Link href="/dashboard" type="primary">
 *     {/* Uses ACME Corp's primary brand color *\/}
 *     Go to Dashboard
 *   </Link>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Force Hermes engine (DaisyUI/Tailwind styling)
 * <Link engine="hermes" href="/docs" type="primary">
 *   Documentation
 * </Link>
 *
 * // Force Apollo engine (Vanilla CSS, zero dependencies)
 * <Link engine="apollo" href="/about">
 *   About Us
 * </Link>
 * ```
 *
 * @see {@link LinkProps} for complete prop documentation
 * @see {@link LinkType} for available semantic color types
 * @see {@link LINK_DEFAULTS} for default prop values
 * @see {@link LINK_TYPE_COLORS} for color mappings
 *
 * @module Link
 * @category Navigation
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { LinkProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export type { LinkProps, LinkType } from './types';
export { LINK_DEFAULTS, LINK_TYPE_COLORS } from './types';

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Link component with multi-engine support.
 *
 * @description
 * A styled anchor element for navigation with support for different semantic
 * types, disabled state, external links, and underline control. Ideal for:
 * - Navigation menus
 * - Inline text links
 * - Call-to-action elements
 * - External resource references
 * - Breadcrumb navigation
 *
 * @remarks
 * - Supports six semantic color types (default, primary, secondary, success, warning, danger)
 * - External links automatically include security attributes (target="_blank", rel="noopener noreferrer")
 * - Disabled state prevents navigation and applies visual feedback
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link LinkProps}
 * @returns React anchor element with consistent styling across engines
 *
 * @example
 * ```tsx
 * <Link href="/dashboard" type="primary" external={false}>
 *   Go to Dashboard
 * </Link>
 * ```
 */
export const Link = createEngineComponent<LinkProps>('Link', {
  /** Ant Design implementation - uses Typography.Link with full Ant styling */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first with DaisyUI link classes */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - zero dependencies, pure inline styles */
  apollo: () => import('./engines/apollo'),
});
