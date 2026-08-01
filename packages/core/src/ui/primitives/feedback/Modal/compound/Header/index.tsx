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
import type { ModalHeaderProps } from '../../contracts';
import { ModalCloseButton } from './CloseButton';

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
     * Instance styles for the header section: only the `divider` decision
     * rides inline, as a hatch the skin consumes (the "off" branch resolves
     * to the same explicit `none` React used to set inline; the divider color
     * resolves from the semantic border channel, never a hardcoded neutral).
     * Layout (flex, gap, padding, shrink) AND typography are skin-owned —
     * modal-compounds.css `[data-part='header']` / `[data-part='title']`.
     */
    const headerStyle: React.CSSProperties = {
      '--ds-modal-header-divider': divider
        ? '1px solid var(--ds-modal-header-border, var(--ds-color-border-subtle))'
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
        data-part="header"
        className={`rottay-modal-header ${className}`.trim()}
        style={headerStyle}
      >
        {/* Title container (layout + typography skin-owned) */}
        <div data-part="title">{children}</div>

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
