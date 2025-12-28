/**
 * @fileoverview Link Component Type Definitions - Rottay Design System
 * @description TypeScript interfaces and type definitions for the Link component.
 * Provides complete type safety for all Link props across all engines.
 *
 * @remarks
 * These types are designed to be engine-agnostic, ensuring consistent API
 * across Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) implementations.
 * The types extend native HTML anchor attributes while adding design system features.
 *
 * @example Importing Types
 * ```tsx
 * import type { LinkProps, LinkType } from '@rottay/design-system';
 *
 * // Use in custom components
 * const CustomLink: React.FC<LinkProps> = (props) => {
 *   return <Link {...props} />;
 * };
 * ```
 *
 * @example Using LinkType
 * ```tsx
 * import type { LinkType } from '@rottay/design-system';
 *
 * const linkVariants: LinkType[] = ['default', 'primary', 'secondary', 'success', 'warning', 'danger'];
 * ```
 *
 * @module Link/types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, AnchorHTMLAttributes } from 'react';

// ============================================================================
// Link Type Enum
// ============================================================================

/**
 * Semantic color types for the Link component.
 *
 * @description
 * Defines the visual appearance and semantic meaning of links:
 * - `default` - Standard link color (blue)
 * - `primary` - Primary brand color for important navigation
 * - `secondary` - Secondary/accent color for supporting links
 * - `success` - Positive actions or confirmations (green)
 * - `warning` - Cautionary links requiring attention (orange)
 * - `danger` - Destructive actions or alerts (red)
 *
 * @example
 * ```tsx
 * <Link type="primary" href="/signup">Sign Up Now</Link>
 * <Link type="danger" href="/delete">Delete Account</Link>
 * ```
 */
export type LinkType = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

// ============================================================================
// Link Props Interface
// ============================================================================

/**
 * Props interface for the Link component.
 *
 * @description
 * Extends native HTML anchor attributes while providing additional
 * design system features like semantic types, disabled state, and engine selection.
 *
 * @extends {Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'>}
 *
 * @example
 * ```tsx
 * const linkProps: LinkProps = {
 *   href: '/dashboard',
 *   type: 'primary',
 *   external: false,
 *   underline: true,
 *   disabled: false,
 *   children: 'Go to Dashboard',
 * };
 * ```
 */
export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  /**
   * Content to render inside the link.
   * Can be text, icons, or any React node.
   *
   * @example
   * ```tsx
   * <Link href="/about">About Us</Link>
   * <Link href="/docs"><Icon name="book" /> Documentation</Link>
   * ```
   */
  children?: ReactNode;

  /**
   * The URL or path the link points to.
   * Can be relative paths or absolute URLs.
   *
   * @example
   * ```tsx
   * <Link href="/about">Relative Path</Link>
   * <Link href="https://example.com" external>External URL</Link>
   * ```
   */
  href?: string;

  /**
   * Semantic color type of the link.
   * Determines the visual styling based on the link's purpose.
   *
   * @default 'default'
   *
   * @example
   * ```tsx
   * <Link type="primary" href="/signup">Primary Action</Link>
   * <Link type="danger" href="/delete">Destructive Action</Link>
   * ```
   */
  type?: LinkType;

  /**
   * Whether the link is disabled.
   * Prevents navigation and applies disabled visual styling.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <Link href="/premium" disabled>
   *   Premium Feature (Upgrade Required)
   * </Link>
   * ```
   */
  disabled?: boolean;

  /**
   * Whether to show underline decoration on the link.
   *
   * @default true
   *
   * @example
   * ```tsx
   * <Link href="/about" underline>Underlined (default)</Link>
   * <Link href="/about" underline={false}>No Underline</Link>
   * ```
   */
  underline?: boolean;

  /**
   * Whether the link points to an external resource.
   * When true, adds target="_blank" and rel="noopener noreferrer" for security.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <Link href="https://github.com" external>
   *   View on GitHub
   * </Link>
   * ```
   */
  external?: boolean;

  /**
   * Override the rendering engine for this specific link instance.
   * Useful for mixing engine styles within the same application.
   *
   * @default undefined (uses context provider's engine or 'titan')
   *
   * @example
   * ```tsx
   * <Link engine="hermes" href="/docs">DaisyUI Styled Link</Link>
   * <Link engine="apollo" href="/about">Vanilla CSS Link</Link>
   * ```
   */
  engine?: 'titan' | 'hermes' | 'apollo';

  /**
   * Additional CSS class names to apply to the link element.
   *
   * @example
   * ```tsx
   * <Link href="/about" className="nav-link highlight">
   *   About Us
   * </Link>
   * ```
   */
  className?: string;

  /**
   * Inline styles to apply to the link element.
   * Useful for one-off styling adjustments.
   *
   * @example
   * ```tsx
   * <Link href="/about" style={{ fontWeight: 'bold' }}>
   *   About Us
   * </Link>
   * ```
   */
  style?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for Link component props.
 *
 * @description
 * Provides consistent default behavior across all engine implementations.
 * These defaults ensure links behave predictably when props are omitted.
 *
 * @example
 * ```tsx
 * import { LINK_DEFAULTS } from '@rottay/design-system';
 *
 * console.log(LINK_DEFAULTS.type);      // 'default'
 * console.log(LINK_DEFAULTS.disabled);  // false
 * console.log(LINK_DEFAULTS.underline); // true
 * console.log(LINK_DEFAULTS.external);  // false
 * ```
 */
export const LINK_DEFAULTS: Required<Pick<LinkProps, 'type' | 'disabled' | 'underline' | 'external'>> = {
  type: 'default',
  disabled: false,
  underline: true,
  external: false,
};

// ============================================================================
// Color Configuration
// ============================================================================

/**
 * Color mappings for each Link type.
 *
 * @description
 * Defines the base color and hover color for each semantic link type.
 * Used by engines that require explicit color values (Apollo, BaseLink).
 * Titan and Hermes engines may use their own color tokens.
 *
 * @example
 * ```tsx
 * import { LINK_TYPE_COLORS } from '@rottay/design-system';
 *
 * const primaryColors = LINK_TYPE_COLORS.primary;
 * console.log(primaryColors.color);      // '#1677ff'
 * console.log(primaryColors.hoverColor); // '#4096ff'
 * ```
 */
export const LINK_TYPE_COLORS: Record<LinkType, { color: string; hoverColor: string }> = {
  default: { color: 'var(--ds-color-primary-500, #1890ff)', hoverColor: 'var(--ds-color-primary-400, #40a9ff)' },
  primary: { color: 'var(--ds-color-primary-500, #1677ff)', hoverColor: 'var(--ds-color-primary-400, #4096ff)' },
  secondary: { color: 'var(--ds-color-secondary-500, #722ed1)', hoverColor: 'var(--ds-color-secondary-400, #9254de)' },
  success: { color: 'var(--ds-color-success-500, #52c41a)', hoverColor: 'var(--ds-color-success-400, #73d13d)' },
  warning: { color: 'var(--ds-color-warning-500, #faad14)', hoverColor: 'var(--ds-color-warning-400, #ffc53d)' },
  danger: { color: 'var(--ds-color-error-500, #ff4d4f)', hoverColor: 'var(--ds-color-error-400, #ff7875)' },
};
