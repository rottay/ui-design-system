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
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
   * Applied on top of the compound skin's paint; your styles take precedence.
   */
  style?: React.CSSProperties;
}

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

    // Optional channel with an English floor (components.drawer.actions ships
    // for en/es/ar): the action group's accessible name localizes and a
    // standalone composition still announces the English floor.
    const i18n = useOptionalTranslation('components');
    const actionsLabel = i18n?.tOr('drawer.actions', 'Drawer actions') ?? 'Drawer actions';

    // Layout (flex row, padding, gap) and the four `align` variants live in
    // drawer-compounds.css, keyed on `data-align`; an out-of-contract value
    // degrades to the skin's `end` base, exactly what the old inline map
    // fallback did.
    const resolvedAlign =
      align === 'start' || align === 'center' || align === 'end' || align === 'space-between'
        ? align
        : 'end';

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * The only inline hatch is the per-instance `divider` decision the skin
     * consumes; a caller's `style` still wins over both.
     */
    const footerStyle: React.CSSProperties = {
      // The `divider` decision rides a hatch the skin consumes, so the "off"
      // branch resolves to the same explicit `none` React used to set inline.
      // `--ds-drawer-footer-border` is a declared channel: bare var (no
      // fallback) so the tenant default governs.
      '--ds-drawer-footer-divider': divider
        ? '1px solid var(--ds-drawer-footer-border)'
        : 'none',

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
        data-align={resolvedAlign}
        className={`rottay-drawer-footer ${className}`.trim()}
        style={footerStyle}
        // Semantic role for action area
        role="group"
        aria-label={actionsLabel}
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
