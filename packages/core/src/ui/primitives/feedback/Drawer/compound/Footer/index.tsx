/**
 * @fileoverview Drawer.Footer - Rottay Design System
 * @description Footer compound component for the Drawer primitive.
 * Provides a consistent footer section for action buttons and controls.
 *
 * @remarks
 * This component is designed to be used as a child of the Drawer component.
 * It provides a fixed footer area that remains visible while the body
 * content scrolls, perfect for action buttons like Save, Cancel, Submit.
 *
 * The footer uses flexbox for automatic button alignment and spacing,
 * making it easy to create consistent action layouts.
 *
 * @example Basic Usage
 * ```tsx
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Body>Content</Drawer.Body>
 *   <Drawer.Footer>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 *
 * @example With Divider
 * ```tsx
 * <Drawer.Footer divider>
 *   <Button>Cancel</Button>
 *   <Button variant="primary">Submit</Button>
 * </Drawer.Footer>
 * ```
 *
 * @example Different Alignments
 * ```tsx
 * // Right-aligned (default)
 * <Drawer.Footer align="end">...</Drawer.Footer>
 *
 * // Left-aligned
 * <Drawer.Footer align="start">...</Drawer.Footer>
 *
 * // Centered
 * <Drawer.Footer align="center">...</Drawer.Footer>
 *
 * // Space between (e.g., Delete on left, Save on right)
 * <Drawer.Footer align="space-between">
 *   <Button variant="danger">Delete</Button>
 *   <Button variant="primary">Save</Button>
 * </Drawer.Footer>
 * ```
 *
 * @module Drawer/Footer
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
 * Props for the DrawerFooter compound component.
 *
 * @interface DrawerFooterProps
 */
export interface DrawerFooterProps {
  /**
   * Footer content, typically action buttons.
   * Buttons are automatically spaced using flexbox gap.
   */
  children?: ReactNode;

  /**
   * Whether to show a border above the footer.
   * Useful for visually separating the footer from the body content.
   * @default false
   */
  divider?: boolean;

  /**
   * Horizontal alignment of footer content.
   *
   * - `start`: Align to the left (flex-start)
   * - `center`: Center the content
   * - `end`: Align to the right (flex-end) - default
   * - `space-between`: First item left, last item right
   *
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'space-between';

  /**
   * Additional CSS class names to apply to the footer container.
   * Merged with the default 'rottay-drawer-footer' class.
   */
  className?: string;

  /**
   * Inline styles to apply to the footer container.
   * Merged with default styles; your styles take precedence.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maps alignment prop to CSS justify-content values.
 * @internal
 */
const ALIGN_MAP: Record<NonNullable<DrawerFooterProps['align']>, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

/**
 * Default padding for the footer.
 * @internal
 */
const FOOTER_PADDING = '16px 24px';

/**
 * Default gap between footer elements.
 * @internal
 */
const FOOTER_GAP = '12px';

// ============================================================================
// Component
// ============================================================================

/**
 * Drawer footer compound component.
 *
 * @description
 * Renders the footer section of a Drawer, typically containing action
 * buttons like Save, Cancel, Submit, or Delete. The footer stays fixed
 * at the bottom while the body content scrolls.
 *
 * @remarks
 * - Uses flexbox for automatic button spacing
 * - Supports multiple alignment options
 * - Optional divider for visual separation
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * CSS Custom Properties:
 * - `--drawer-footer-border`: Border color when divider is enabled
 * - `--drawer-footer-bg`: Background color (defaults to transparent)
 * - `--drawer-footer-padding`: Footer padding (defaults to 16px 24px)
 *
 * @param props - {@link DrawerFooterProps}
 * @param ref - Forwarded ref to the footer container div
 * @returns The rendered footer element
 *
 * @example
 * ```tsx
 * <Drawer.Footer divider align="space-between">
 *   <Button variant="danger">Delete Account</Button>
 *   <div>
 *     <Button onClick={onCancel}>Cancel</Button>
 *     <Button variant="primary" onClick={onSave}>Save</Button>
 *   </div>
 * </Drawer.Footer>
 * ```
 */
export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      children,
      divider = false,
      align = 'end',
      className = '',
      style = {},
    } = props;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Container styles for the footer section.
     * Uses flexbox for horizontal layout with configurable alignment.
     */
    const footerStyle: React.CSSProperties = {
      // Layout - horizontal flex with alignment
      display: 'flex',
      alignItems: 'center',
      justifyContent: ALIGN_MAP[align] || ALIGN_MAP.end,
      gap: FOOTER_GAP,

      // Spacing
      padding: FOOTER_PADDING,

      // Visual - the `divider` decision rides a hatch the skin consumes, so the
      // "off" branch resolves to the same explicit `none` React set inline.
      '--ds-drawer-footer-divider': divider
        ? '1px solid var(--ds-drawer-footer-border, var(--ds-color-border, rgba(0, 0, 0, 0.1)))'
        : 'none',

      // Prevent shrinking when content overflows
      flexShrink: 0,

      // Merge user styles (takes precedence)
      ...style,
    } as React.CSSProperties;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="footer"
        className={`rottay-drawer-footer ${className}`.trim()}
        style={footerStyle}
        // Semantic role for action area
        role="group"
        aria-label="Drawer actions"
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools
DrawerFooter.displayName = 'Drawer.Footer';

// Default export for convenience
export default DrawerFooter;
