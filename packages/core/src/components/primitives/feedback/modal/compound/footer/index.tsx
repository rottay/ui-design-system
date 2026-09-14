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
 * @module Modal/footer
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalFooterProps } from '../../contracts';

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
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="footer"
        data-divider={divider ? 'true' : 'false'}
        data-align={align}
        data-padding={padding}
        className={`ds-modal-footer ${className}`.trim()}
        style={style}
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
