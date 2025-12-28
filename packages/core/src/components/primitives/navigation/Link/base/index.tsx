/**
 * @fileoverview Base Link Component - Rottay Design System
 * @description Foundational Link implementation with CSS variables and inline styles.
 * Serves as the reference implementation for all engine-specific versions.
 *
 * @remarks
 * The BaseLink component provides a pure React implementation without external
 * UI library dependencies. It uses CSS variables for theming and inline styles
 * for consistent rendering across all environments.
 *
 * This component is:
 * - Framework-agnostic (works without Ant Design or DaisyUI)
 * - Fully accessible with ARIA attributes
 * - SSR-compatible with 'use client' directive
 * - Ref-forwardable for DOM access
 *
 * @example Basic Usage
 * ```tsx
 * import { BaseLink } from '@rottay/design-system';
 *
 * <BaseLink href="/about">About Us</BaseLink>
 * ```
 *
 * @example With All Props
 * ```tsx
 * import { BaseLink } from '@rottay/design-system';
 *
 * <BaseLink
 *   href="https://github.com"
 *   type="primary"
 *   external
 *   underline={false}
 *   className="nav-link"
 *   style={{ fontWeight: 'bold' }}
 * >
 *   View on GitHub
 * </BaseLink>
 * ```
 *
 * @see {@link LinkProps} for prop documentation
 * @see {@link LINK_TYPE_COLORS} for color mappings
 *
 * @module Link/base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { LinkProps } from '../types';
import { LINK_DEFAULTS, LINK_TYPE_COLORS } from '../types';

// ============================================================================
// Base Link Component
// ============================================================================

/**
 * Base Link component with CSS variables and inline styles.
 *
 * @description
 * A foundational anchor element implementation that provides consistent
 * styling across all rendering contexts. Uses inline styles for maximum
 * compatibility and ref forwarding for DOM manipulation.
 *
 * @remarks
 * - Uses forwardRef for ref forwarding to the underlying anchor element
 * - Applies ARIA attributes for accessibility
 * - Handles disabled state by preventing navigation
 * - Supports external links with security attributes
 *
 * @param props - {@link LinkProps}
 * @param ref - Forwarded ref to the anchor element
 * @returns React anchor element with consistent styling
 *
 * @example
 * ```tsx
 * const linkRef = useRef<HTMLAnchorElement>(null);
 *
 * <BaseLink ref={linkRef} href="/dashboard" type="primary">
 *   Dashboard
 * </BaseLink>
 * ```
 */
export const BaseLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
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
      style = {},
      onClick,
      ...rest
    } = props;

    // ========================================================================
    // Style Computation
    // ========================================================================

    /** Get colors based on the link type */
    const colors = LINK_TYPE_COLORS[type];

    /** Computed inline styles for the link element */
    const linkStyle: React.CSSProperties = {
      color: disabled ? '#00000040' : colors.color,
      textDecoration: underline ? 'underline' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'color 0.2s ease-in-out',
      ...style,
    };

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
    // Render
    // ========================================================================

    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        className={`rottay-link rottay-link--${type} ${disabled ? 'rottay-link--disabled' : ''} ${className}`}
        style={linkStyle}
        onClick={handleClick}
        aria-disabled={disabled}
        {...externalProps}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

/** Set display name for React DevTools debugging */
BaseLink.displayName = 'BaseLink';
