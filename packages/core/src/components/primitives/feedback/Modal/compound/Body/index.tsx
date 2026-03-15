/**
 * @fileoverview Modal.Body - Rottay Design System
 * @description Body compound component for the Modal primitive.
 * Provides the main content area with automatic scroll handling.
 *
 * @remarks
 * This component is designed to be used as a child of the Modal component.
 * It provides a flexible, scrollable content area that works seamlessly
 * with Modal.Header and Modal.Footer.
 *
 * **Features:**
 * - Automatic vertical scrolling for overflow content
 * - Configurable padding (none, sm, md, lg)
 * - CSS custom property theming
 * - Fills available space between header and footer
 *
 * **Styling via CSS Custom Properties:**
 * - `--ds-modal-body-color`: Body text color
 * - `--ds-modal-body-font-size`: Body font size (default: 14px)
 *
 * @example Basic Usage
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Body>
 *     <p>Your content goes here</p>
 *   </Modal.Body>
 * </Modal>
 * ```
 *
 * @example With Custom Padding
 * ```tsx
 * // Compact content
 * <Modal.Body padding="sm">
 *   <CompactForm />
 * </Modal.Body>
 *
 * // Full-bleed content (no padding)
 * <Modal.Body padding="none">
 *   <FullWidthImage />
 * </Modal.Body>
 * ```
 *
 * @example Full Layout
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Header>Edit User</Modal.Header>
 *   <Modal.Body>
 *     <UserForm user={user} />
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleSave}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @module Modal/Body
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalBodyProps } from '../../../../../../contracts/primitives/feedback/Modal';
import { PADDING_MAP } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Modal body compound component.
 *
 * @description
 * Renders the main content area of a Modal. This is where you place
 * forms, lists, text, or any other content that should appear in the
 * modal's scrollable region.
 *
 * @remarks
 * - Automatically handles vertical overflow with scroll
 * - Hides horizontal overflow to prevent layout issues
 * - Uses flex: 1 to fill available space between header and footer
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * @param props - {@link ModalBodyProps}
 * @param ref - Forwarded ref to the body container div
 * @returns The rendered body element
 *
 * @example
 * ```tsx
 * <Modal.Body padding="lg">
 *   <form>
 *     <Input label="Name" />
 *     <Input label="Email" />
 *   </form>
 * </Modal.Body>
 * ```
 */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
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

      // Spacing - uses PADDING_MAP for consistent sizing
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,

      // Overflow handling - scroll vertically, hide horizontal
      overflowY: 'auto',
      overflowX: 'hidden',

      // Typography - uses CSS custom properties for tenant theming
      color: 'var(--ds-modal-body-color, inherit)',
      fontSize: 'var(--ds-modal-body-font-size, 14px)',
      lineHeight: 1.6,

      // Merge user styles (takes precedence)
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-modal-body ${className}`.trim()}
        style={bodyStyle}
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools
ModalBody.displayName = 'Modal.Body';

// Default export for convenience
export default ModalBody;
