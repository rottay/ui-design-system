/**
 * @fileoverview Rustic Link Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Link component.
 * Uses inline styles for zero external dependencies and maximum compatibility.
 *
 * @remarks
 * The Rustic engine provides a vanilla implementation with:
 * - Zero UI framework dependencies
 * - Inline styles for complete portability
 * - Full accessibility support
 * - Smallest possible bundle impact
 *
 * Ideal for projects that want design system consistency without
 * additional CSS framework overhead or for SSR environments.
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Specify the Rustic engine for vanilla CSS styling
 * <Link engine="rustic" href="/dashboard" type="primary">
 *   Dashboard
 * </Link>
 * ```
 *
 * @example With Global Engine Provider
 * ```tsx
 * import { EngineProvider, Link } from '@rottay/design-system';
 *
 * <EngineProvider engine="rustic">
 *   {/* Links use pure HTML/CSS *\/}
 *   <Link href="/about" type="secondary">About Us</Link>
 *   <Link href="/contact" type="primary">Contact</Link>
 * </EngineProvider>
 * ```
 *
 * @example Inline Styles Applied
 * ```tsx
 * // Rustic applies these inline styles:
 * // - color: Based on type (e.g., '#1677ff' for primary)
 * // - textDecoration: 'underline' or 'none' based on underline prop
 * // - cursor: 'pointer' or 'not-allowed' based on disabled state
 * // - transition: 'color 0.2s ease-in-out' for smooth hover effects
 * ```
 *
 * @see {@link LinkProps} for prop documentation
 * @see {@link LINK_TYPE_COLORS} for color definitions
 *
 * @module Link/engines/rustic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { LinkProps } from '../../contracts';
import { LINK_DEFAULTS } from '../../contracts';

// ============================================================================
// Rustic Link Component
// ============================================================================

/**
 * Rustic engine Link component using pure HTML and inline CSS.
 *
 * @description
 * Implements the Link component using native anchor elements and inline
 * styles, providing a dependency-free solution that works in any React
 * environment without CSS framework requirements.
 *
 * @remarks
 * - Uses LINK_TYPE_COLORS for consistent color mapping
 * - Combines authored engine CSS with bounded runtime state values
 * - Includes color transition for smooth hover states
 * - Fully accessible with ARIA disabled attribute
 *
 * @param props - {@link LinkProps}
 * @returns Native anchor element with inline styles
 *
 * @example
 * ```tsx
 * <RusticLink href="/dashboard" type="primary" underline>
 *   Go to Dashboard
 * </RusticLink>
 * ```
 */
export default function RusticLink(props: LinkProps): React.ReactElement {
  // ========================================================================
  // Props Destructuring
  // ========================================================================

  const {
    children,
    href,
    type = LINK_DEFAULTS.type,
    disabled = LINK_DEFAULTS.disabled,
    underline = LINK_DEFAULTS.underline,
    external = LINK_DEFAULTS.external,
    className,
    style,
    onClick,
    ...rest
  } = props;

  // ========================================================================
  // Style Computation
  // ========================================================================

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle click events on the link.
   * Prevents navigation when the link is disabled.
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // ========================================================================
  // External Link Attributes
  // ========================================================================

  /** Security attributes for external links */
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  // ========================================================================
  // Computed Styles
  // ========================================================================

  /**
   * Build complete inline styles for the link element.
   * Combines underline, disabled state, and custom styles.
   */
  const linkStyle: React.CSSProperties = {
    textDecoration: underline ? 'underline' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'color 0.2s ease-in-out',
    ...style,
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <a
      href={disabled ? undefined : href}
      className={`rottay-link-shell rottay-link-shell--rustic ${className}`.trim()}
      onClick={handleClick}
      aria-disabled={disabled}
      data-part="root"
      data-variant={type}
      data-disabled={disabled || undefined}
      style={linkStyle}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}

// ============================================================================
// Display Name
// ============================================================================

/** Set display name for React DevTools debugging */
RusticLink.displayName = 'RusticLink';
