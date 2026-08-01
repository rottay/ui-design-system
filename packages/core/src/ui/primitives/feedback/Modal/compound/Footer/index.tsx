/**
 * @fileoverview Modal.Footer - Rottay Design System
 * @description Footer compound component for the Modal primitive.
 * Provides a consistent footer section for action buttons and controls.
 *
 * @remarks
 * This component is designed to be used as a child of the Modal component.
 * It provides a fixed footer area that remains visible while the body
 * content scrolls, perfect for action buttons like Save, Cancel, Submit.
 *
 * **Features:**
 * - Multiple alignment options (start, center, end, space-between)
 * - Optional top divider for visual separation
 * - Automatic button spacing via flexbox gap
 * - CSS custom property theming
 *
 * **Styling via CSS Custom Properties:**
 * - `--ds-modal-footer-border`: Divider border color
 *
 * @example Basic Usage
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Body>Content</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @example With Divider
 * ```tsx
 * <Modal.Footer divider>
 *   <Button>Cancel</Button>
 *   <Button variant="primary">Submit</Button>
 * </Modal.Footer>
 * ```
 *
 * @example Different Alignments
 * ```tsx
 * // Right-aligned (default)
 * <Modal.Footer align="end">...</Modal.Footer>
 *
 * // Left-aligned
 * <Modal.Footer align="start">...</Modal.Footer>
 *
 * // Centered
 * <Modal.Footer align="center">...</Modal.Footer>
 *
 * // Space between (e.g., Delete on left, Save on right)
 * <Modal.Footer align="space-between">
 *   <Button variant="danger">Delete</Button>
 *   <Button variant="primary">Save</Button>
 * </Modal.Footer>
 * ```
 *
 * @module Modal/Footer
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalFooterProps } from '../../contracts';
import { PADDING_MAP } from '../../contracts';

// ============================================================================
// Constants
// ============================================================================

/**
 * Maps alignment prop values to CSS justify-content values.
 * @internal
 */
const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modal footer compound component.
 *
 * @description
 * Renders the footer section of a Modal, typically containing action
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
 * @param props - {@link ModalFooterProps}
 * @param ref - Forwarded ref to the footer container div
 * @returns The rendered footer element
 *
 * @example
 * ```tsx
 * <Modal.Footer divider align="space-between">
 *   <Button variant="danger">Delete Account</Button>
 *   <div>
 *     <Button onClick={onCancel}>Cancel</Button>
 *     <Button variant="primary" onClick={onSave}>Save</Button>
 *   </div>
 * </Modal.Footer>
 * ```
 */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      children,
      divider = false,
      align = 'end',
      padding = 'lg',
      className = '',
      style = {},
    } = props;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Instance styles for the footer section: the prop-driven decisions
     * resolve inline — `align` (ALIGN_MAP contract enum), `padding`
     * (PADDING_MAP contract enum) — plus the `divider` hatch the skin
     * consumes (the "off" branch resolves to the same explicit `none` React
     * used to set inline; the divider color resolves from the semantic
     * border channel, never a hardcoded neutral). The stable frame (flex,
     * alignment, gap, shrink) lives in modal-compounds.css
     * `[data-part='footer']`.
     */
    const footerStyle: React.CSSProperties = {
      // Layout - alignment is a contract enum (ALIGN_MAP)
      justifyContent: ALIGN_MAP[align] || 'flex-end',

      // Spacing - uses PADDING_MAP for consistency
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,

      // Visual - optional top border for separation
      '--ds-modal-footer-divider': divider
        ? '1px solid var(--ds-modal-footer-border, var(--ds-color-border-subtle))'
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
        className={`rottay-modal-footer ${className}`.trim()}
        style={footerStyle}
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools
ModalFooter.displayName = 'Modal.Footer';

// Default export for convenience
export default ModalFooter;
