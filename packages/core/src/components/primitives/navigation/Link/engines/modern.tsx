/**
 * @fileoverview Modern Link Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Link component.
 * Uses DaisyUI's link utility classes for consistent Tailwind-based styling.
 *
 * @remarks
 * The Modern engine uses DaisyUI's link component classes, providing:
 * - Utility-first Tailwind CSS approach
 * - DaisyUI's semantic color system
 * - Lightweight bundle size
 * - Easy customization via className
 *
 * Perfect for projects already using Tailwind CSS or preferring utility classes.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * // Specify the Modern engine
 * <Link engine="modern" href="/dashboard" type="primary">
 *   Dashboard
 * </Link>
 * ```
 *
 * @example With Global Engine Provider
 * ```tsx
 * import { EngineProvider, Link } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   {/* All Links use DaisyUI styling *\/}
 *   <Link href="/about" type="secondary">About Us</Link>
 *   <Link href="/contact" type="primary">Contact</Link>
 * </EngineProvider>
 * ```
 *
 * @example DaisyUI Class Mapping
 * ```tsx
 * // Type to DaisyUI class mapping:
 * // default   -> link-info
 * // primary   -> link-primary
 * // secondary -> link-secondary
 * // success   -> link-success
 * // warning   -> link-warning
 * // danger    -> link-error
 * ```
 *
 * @see {@link LinkProps} for prop documentation
 * @see {@link https://daisyui.com/components/link DaisyUI Link Component}
 *
 * @module Link/engines/modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { LinkProps } from '../Link.types';
import { LINK_DEFAULTS } from '../Link.types';

// ============================================================================
// DaisyUI Class Mapping
// ============================================================================

/**
 * Maps semantic link types to DaisyUI link color classes.
 * DaisyUI uses 'link-error' for danger (not 'link-danger'), so we bridge
 * our API naming convention to DaisyUI's naming convention here.
 */
const typeClassMap: Record<string, string> = {
  default: 'link-info',
  primary: 'link-primary',
  secondary: 'link-secondary',
  success: 'link-success',
  warning: 'link-warning',
  danger: 'link-error',
};

/**
 * Maps semantic link types to DS color token references.
 * These inline styles ensure tenant-aware theming takes precedence
 * over DaisyUI's built-in color classes.
 */
const typeColorMap: Record<string, string> = {
  default: 'var(--ds-color-info, var(--ds-color-primary))',
  primary: 'var(--ds-color-primary)',
  secondary: 'var(--ds-color-secondary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  danger: 'var(--ds-color-error)',
};

// ============================================================================
// Modern Link Component
// ============================================================================

/**
 * Modern engine Link component using DaisyUI/Tailwind CSS classes.
 *
 * @description
 * Implements the Link component using DaisyUI's utility classes for
 * a lightweight, Tailwind-native approach. Combines DaisyUI's semantic
 * link classes with Tailwind utilities for disabled states.
 *
 * @remarks
 * - Uses DaisyUI's `link` base class and color variants
 * - Applies Tailwind utilities for disabled state (opacity-50, cursor-not-allowed)
 * - Supports `no-underline` class for underline control
 * - Prevents click events when disabled via pointer-events-none
 *
 * @param props - {@link LinkProps}
 * @returns Native anchor element with DaisyUI classes
 *
 * @example
 * ```tsx
 * <ModernLink href="/dashboard" type="primary" underline>
 *   Go to Dashboard
 * </ModernLink>
 * ```
 */
export default function ModernLink(props: LinkProps): React.ReactElement {
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
    className = '',
    style,
    onClick,
    ...rest
  } = props;

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
  // Class Name Computation
  // ========================================================================

  /**
   * Combine DaisyUI and Tailwind classes for the link element.
   * - `link`: DaisyUI base link class
   * - `link-{type}`: DaisyUI color variant
   * - `no-underline`: Removes underline when underline=false
   * - Disabled classes: opacity-50, cursor-not-allowed, pointer-events-none
   */
  // Array + filter(Boolean) pattern drops empty strings from conditional
  // classes, producing clean class attributes without extra whitespace
  const linkClasses = [
    'link',
    typeClassMap[type],
    underline ? '' : 'no-underline',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ');

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <a
      href={disabled ? undefined : href}
      className={linkClasses}
      onClick={handleClick}
      aria-disabled={disabled}
      style={{ color: typeColorMap[type], ...style }}
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
ModernLink.displayName = 'ModernLink';
