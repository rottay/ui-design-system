/**
 * @fileoverview ModalHeader - Rottay Design System
 * @description Compound component for the header area of a Modal, displaying
 * a title and an optional close button.
 *
 * @remarks
 * ModalHeader renders a flex row with a title slot and an optional
 * ModalCloseButton. It uses `flexShrink: 0` to maintain its height
 * even when body content overflows.
 *
 * **Key Features:**
 * - Title with configurable font size and weight via CSS variables
 * - Optional bottom border divider for visual separation
 * - Integrated ModalCloseButton (shown when `closable` is true and `onClose` provided)
 * - Fixed height (non-shrinkable) via `flexShrink: 0`
 * - 12px gap between title and close button
 * - Ref forwarding for DOM access
 *
 * **CSS Variables:**
 * - `--ds-modal-title-font-size` - Title font size (default: 18px)
 * - `--ds-modal-title-font-weight` - Title font weight (default: 600)
 * - `--ds-modal-title-color` - Title text color
 * - `--ds-modal-header-border` - Divider border color
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal.Header onClose={handleClose}>
 *   Edit Profile
 * </Modal.Header>
 * ```
 *
 * @example With Divider and No Close Button
 * ```tsx
 * <Modal.Header divider closable={false}>
 *   Important Notice
 * </Modal.Header>
 * ```
 *
 * @see {@link ModalCloseButton} for the close button component
 * @see {@link ModalBody} for the body section
 * @see {@link ModalFooter} for the footer section
 * @see {@link Modal} for the parent component
 * @module Modal/Compound/Header
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalHeaderProps } from '../../Modal.types';
import { ModalCloseButton } from '../CloseButton';
import { PADDING_MAP } from '../../Modal.types';

/**
 * Header section for the Modal with title and optional close button.
 *
 * @description
 * Renders a flex container with the title on the left and an optional
 * close button on the right. The close button is rendered via the
 * ModalCloseButton compound component.
 *
 * @param props - {@link ModalHeaderProps}
 * @param ref - Forwarded ref to the header container div
 * @returns The modal header element
 *
 * @example
 * ```tsx
 * <ModalHeader closable onClose={handleClose} divider>
 *   Confirm Deletion
 * </ModalHeader>
 * ```
 */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  (props, ref) => {
    const {
      children,
      divider = false,
      closable = true,
      onClose,
      className = '',
      style = {},
    } = props;

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: PADDING_MAP.lg,
      borderBottom: divider ? '1px solid var(--ds-modal-header-border, rgba(0, 0, 0, 0.1))' : 'none',
      flexShrink: 0,
      ...style,
    };

    const titleStyle: React.CSSProperties = {
      flex: 1,
      margin: 0,
      fontSize: 'var(--ds-modal-title-font-size, 18px)',
      fontWeight: 'var(--ds-modal-title-font-weight, 600)',
      lineHeight: 1.4,
      color: 'var(--ds-modal-title-color, inherit)',
    };

    return (
      <div
        ref={ref}
        data-part="header"
        className={`rottay-overlay-modal-header ${className}`}
        style={headerStyle}
      >
        <div data-part="title" style={titleStyle}>{children}</div>
        {closable && onClose && (
          <ModalCloseButton onClose={onClose} />
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'Modal.Header';

export default ModalHeader;
