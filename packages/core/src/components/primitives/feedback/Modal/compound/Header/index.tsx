/**
 * @fileoverview Modal.Header - Rottay Design System
 * @description Header compound component for the Modal primitive.
 * Provides a consistent header section with title and optional close button.
 *
 * @remarks
 * This component is designed to be used as a child of the Modal component.
 * It automatically integrates with the Modal's theming and handles the close
 * action when the close button is clicked.
 *
 * **Features:**
 * - Flexible title content (string or React elements)
 * - Optional close button with accessibility
 * - Optional bottom divider
 * - CSS custom property theming
 *
 * **Styling via CSS Custom Properties:**
 * - `--ds-modal-title-font-size`: Title text size (default: 18px)
 * - `--ds-modal-title-font-weight`: Title weight (default: 600)
 * - `--ds-modal-title-color`: Title text color
 * - `--ds-modal-header-border`: Divider border color
 *
 * @example Basic Usage
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Header>User Settings</Modal.Header>
 *   <Modal.Body>...</Modal.Body>
 * </Modal>
 * ```
 *
 * @example With Close Button
 * ```tsx
 * <Modal.Header onClose={handleClose} closable>
 *   Edit Profile
 * </Modal.Header>
 * ```
 *
 * @example With Divider and Custom Content
 * ```tsx
 * <Modal.Header onClose={handleClose} divider>
 *   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 *     <Avatar src={user.avatar} size="sm" />
 *     <span>{user.name}</span>
 *     <Badge variant="success">Online</Badge>
 *   </div>
 * </Modal.Header>
 * ```
 *
 * @module Modal/Header
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalHeaderProps } from '../../../../../../types/primitives/feedback/Modal';
import { ModalCloseButton } from '../CloseButton';
import { PADDING_MAP } from '../../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Modal header compound component.
 *
 * @description
 * Renders the header section of a Modal, containing the title and an
 * optional close button. Designed to work seamlessly with Modal.Body
 * and Modal.Footer for structured modal layouts.
 *
 * @remarks
 * - Uses flexbox for horizontal layout with space-between alignment
 * - Close button includes proper accessibility attributes
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * @param props - {@link ModalHeaderProps}
 * @param ref - Forwarded ref to the header container div
 * @returns The rendered header element
 *
 * @example
 * ```tsx
 * <Modal.Header onClose={() => setOpen(false)} divider>
 *   <span>Edit Profile</span>
 * </Modal.Header>
 * ```
 */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
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
      // Layout - horizontal flex with space between title and close
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',

      // Spacing - uses PADDING_MAP for consistency
      padding: PADDING_MAP.lg,

      // Visual - optional bottom border for separation
      borderBottom: divider
        ? '1px solid var(--ds-modal-header-border, rgba(0, 0, 0, 0.1))'
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
      // Layout - fill available space
      flex: 1,
      margin: 0,

      // Typography - uses CSS custom properties for tenant theming
      fontSize: 'var(--ds-modal-title-font-size, 18px)',
      fontWeight: 'var(--ds-modal-title-font-weight, 600)',
      lineHeight: 1.4,

      // Color - inherits or uses custom property
      color: 'var(--ds-modal-title-color, inherit)',
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-modal-header ${className}`.trim()}
        style={headerStyle}
      >
        {/* Title container */}
        <div style={titleStyle}>{children}</div>

        {/* Close button - only rendered if closable and onClose provided */}
        {closable && onClose && (
          <ModalCloseButton onClose={onClose} />
        )}
      </div>
    );
  }
);

// Set display name for React DevTools
ModalHeader.displayName = 'Modal.Header';

// Default export for convenience
export default ModalHeader;
