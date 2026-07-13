/**
 * @fileoverview Drawer.Body - Rottay Design System
 * @description Body compound component for the Drawer primitive.
 * Provides the main content area with automatic scroll handling.
 *
 * @remarks
 * This component is designed to be used as a child of the Drawer component.
 * It provides a flexible, scrollable content area that works seamlessly
 * with Drawer.Header and Drawer.Footer.
 *
 * The body automatically handles overflow scrolling, ensuring the header
 * and footer remain fixed while the content scrolls.
 *
 * @example Basic Usage
 * ```tsx
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Body>
 *     <p>Your content goes here</p>
 *   </Drawer.Body>
 * </Drawer>
 * ```
 *
 * @example With Custom Padding
 * ```tsx
 * <Drawer.Body padding="sm">
 *   <CompactContent />
 * </Drawer.Body>
 *
 * <Drawer.Body padding="none">
 *   <FullBleedImage />
 * </Drawer.Body>
 * ```
 *
 * @example Full Layout
 * ```tsx
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Header>Edit User</Drawer.Header>
 *   <Drawer.Body>
 *     <UserForm user={user} />
 *   </Drawer.Body>
 *   <Drawer.Footer>
 *     <Button onClick={handleSave}>Save</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 *
 * @module Drawer/Body
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
 * Props for the DrawerBody compound component.
 *
 * @interface DrawerBodyProps
 */
export interface DrawerBodyProps {
  /**
   * Body content - forms, text, lists, or any React elements.
   */
  children?: ReactNode;

  /**
   * Padding size for the body content.
   * Maps to the design system's spacing tokens.
   *
   * - `none`: 0px - For full-bleed content like images
   * - `sm`: 12px - Compact content
   * - `md`: 16px - Standard content
   * - `lg`: 24px - Comfortable spacing (default)
   *
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Additional CSS class names to apply to the body container.
   * Merged with the default 'rottay-drawer-body' class.
   */
  className?: string;

  /**
   * Inline styles to apply to the body container.
   * Merged with default styles; your styles take precedence.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Padding size mappings.
 * Uses design system spacing tokens with pixel fallbacks.
 * @internal
 */
const PADDING_MAP: Record<DrawerBodyProps['padding'] & string, string> = {
  none: '0',
  sm: 'var(--ds-spacing-3, 12px)',
  md: 'var(--ds-spacing-4, 16px)',
  lg: 'var(--ds-spacing-6, 24px)',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Drawer body compound component.
 *
 * @description
 * Renders the main content area of a Drawer. This is where you place
 * forms, lists, text, or any other content that should appear in the
 * drawer's scrollable region.
 *
 * @remarks
 * - Automatically handles vertical overflow with scroll
 * - Hides horizontal overflow to prevent layout issues
 * - Uses flex: 1 to fill available space between header and footer
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * CSS Custom Properties:
 * - `--drawer-body-bg`: Background color (defaults to transparent)
 * - `--drawer-body-color`: Text color (defaults to inherit)
 *
 * @param props - {@link DrawerBodyProps}
 * @param ref - Forwarded ref to the body container div
 * @returns The rendered body element
 *
 * @example
 * ```tsx
 * <Drawer.Body padding="lg">
 *   <form>
 *     <Input label="Name" />
 *     <Input label="Email" />
 *   </form>
 * </Drawer.Body>
 * ```
 */
export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      children,
      padding = 'lg',
      className = '',
      style = {},
    } = props;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Container styles for the body section.
     * Designed to fill available space and handle overflow.
     */
    const bodyStyle: React.CSSProperties = {
      // Layout - fill available vertical space
      flex: 1,

      // Spacing - use padding map for consistent sizing
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,

      // Overflow handling - scroll vertically, hide horizontal
      overflowY: 'auto',
      overflowX: 'hidden',

      // Background - transparent by default, customizable via CSS var
      backgroundColor: 'var(--ds-drawer-body-bg, transparent)',

      // Typography - inherit from parent for theme compatibility
      color: 'var(--ds-drawer-body-color, inherit)',

      // Merge user styles (takes precedence)
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="body"
        className={`rottay-drawer-body ${className}`.trim()}
        style={bodyStyle}
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools
DrawerBody.displayName = 'Drawer.Body';

// Default export for convenience
export default DrawerBody;
