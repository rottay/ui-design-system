/**
 * @fileoverview Drawer.Header - Rottay Design System
 * @description Header compound component for the Drawer primitive.
 * Provides a consistent header section with title and optional close button.
 *
 * @remarks
 * This component is designed to be used as a child of the Drawer component.
 * It automatically integrates with the Drawer's theming and handles the close
 * action when the close button is clicked.
 *
 * Styling is controlled via CSS custom properties, allowing full customization
 * through Rottay's multi-tenant theming system.
 *
 * @example Basic Usage
 * ```tsx
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Header>Settings</Drawer.Header>
 *   <Drawer.Body>...</Drawer.Body>
 * </Drawer>
 * ```
 *
 * @example With Close Button
 * ```tsx
 * <Drawer.Header onClose={handleClose} closable>
 *   User Profile
 * </Drawer.Header>
 * ```
 *
 * @example With Divider
 * ```tsx
 * <Drawer.Header divider>
 *   Navigation Menu
 * </Drawer.Header>
 * ```
 *
 * @module Drawer/Header
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the DrawerHeader compound component.
 *
 * @interface DrawerHeaderProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface DrawerHeaderProps {
  /**
   * Header content, typically a title string or custom React elements.
   * @example "Settings"
   * @example <><Icon name="settings" /> Settings</>
   */
  children?: ReactNode;

  /**
   * Whether to show a border below the header.
   * Useful for visually separating the header from the body content.
   * @default false
   */
  divider?: boolean;

  /**
   * Whether to show the close button.
   * When true and onClose is provided, displays an X button.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback fired when the close button is clicked.
   * Required if closable is true for the button to appear.
   */
  onClose?: () => void;

  /**
   * Additional CSS class names to apply to the header container.
   * Merged with the default 'rottay-drawer-header' class.
   */
  className?: string;

  /**
   * Inline styles to apply to the header container.
   * Merged with default styles; your styles take precedence.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default padding for the header.
 * Uses CSS custom property with fallback for tenant customization.
 * @internal
 */
const HEADER_PADDING = '16px 24px';

/**
 * Default gap between header elements.
 * @internal
 */
const HEADER_GAP = '12px';

// ============================================================================
// Component
// ============================================================================

/**
 * Drawer header compound component.
 *
 * @description
 * Renders the header section of a Drawer, containing the title and an
 * optional close button. Designed to work seamlessly with Drawer.Body
 * and Drawer.Footer for structured drawer layouts.
 *
 * @remarks
 * - Automatically handles flexbox layout for title and close button
 * - Close button includes proper accessibility attributes
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * CSS Custom Properties:
 * - `--drawer-header-border`: Border color when divider is enabled
 * - `--drawer-header-padding`: Header padding (defaults to 16px 24px)
 * - `--drawer-title-font-size`: Title font size (defaults to 16px)
 * - `--drawer-title-font-weight`: Title font weight (defaults to 600)
 *
 * @param props - {@link DrawerHeaderProps}
 * @param ref - Forwarded ref to the header container div
 * @returns The rendered header element
 *
 * @example
 * ```tsx
 * <Drawer.Header onClose={() => setOpen(false)} divider>
 *   <span>Edit Profile</span>
 * </Drawer.Header>
 * ```
 */
export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      children,
      divider = false,
      closable = true,
      onClose,
      className = '',
      style = {},
    } = props;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Container styles for the header section.
     * Uses flexbox for horizontal layout with space-between alignment.
     */
    const headerStyle: React.CSSProperties = {
      // Layout
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: HEADER_GAP,

      // Spacing
      padding: HEADER_PADDING,

      // Visual
      borderBottom: divider
        ? '1px solid var(--drawer-header-border, var(--color-border, rgba(0, 0, 0, 0.1)))'
        : 'none',

      // Prevent shrinking when content overflows
      flexShrink: 0,

      // Merge user styles (takes precedence)
      ...style,
    };

    /**
     * Styles for the title text container.
     * Allows the title to grow and fill available space.
     */
    const titleStyle: React.CSSProperties = {
      // Layout
      flex: 1,
      margin: 0,

      // Typography - uses CSS custom properties for tenant theming
      fontSize: 'var(--drawer-title-font-size, 16px)',
      fontWeight: 'var(--drawer-title-font-weight, 600)' as React.CSSProperties['fontWeight'],
      lineHeight: 1.4,

      // Inherit color from parent for theme compatibility
      color: 'inherit',
    };

    /**
     * Styles for the close button.
     * Minimal styling for a clean, accessible button.
     */
    const closeButtonStyle: React.CSSProperties = {
      // Reset button styles
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',

      // Spacing
      padding: '4px',

      // Typography
      fontSize: '18px',
      lineHeight: 1,

      // Color - uses CSS custom property for tenant theming
      color: 'var(--drawer-close-color, var(--color-text-secondary, rgba(0, 0, 0, 0.45)))',

      // Hover state handled via CSS in production
      transition: 'color 0.2s ease',
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-drawer-header ${className}`.trim()}
        style={headerStyle}
        // Semantic role for screen readers
        role="heading"
        aria-level={2}
      >
        {/* Title container */}
        <div style={titleStyle}>{children}</div>

        {/* Close button - only rendered if closable and onClose provided */}
        {closable && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="Close drawer"
            // Prevent focus ring on click, allow on keyboard
            className="rottay-drawer-close"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools
DrawerHeader.displayName = 'Drawer.Header';

// Default export for convenience
export default DrawerHeader;
