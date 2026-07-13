/**
 * @fileoverview ModalBody - Rottay Design System
 * @description Compound component for the scrollable content area of a Modal.
 * Provides the main body section with configurable padding and overflow handling.
 *
 * @remarks
 * ModalBody fills the available space between the Modal header and footer using
 * `flex: 1`. It enables vertical scrolling for content that exceeds the modal
 * height while hiding horizontal overflow.
 *
 * **Key Features:**
 * - Fills remaining modal space via `flex: 1`
 * - Vertical scrolling for overflow content (`overflowY: auto`)
 * - Configurable padding via PADDING_MAP (sm, md, lg, xl, none)
 * - Theming via CSS variables for text color and font size
 * - Ref forwarding for programmatic scroll control
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal open={isOpen} onClose={handleClose}>
 *   <Modal.Header onClose={handleClose}>Title</Modal.Header>
 *   <Modal.Body>
 *     <p>Your modal content goes here.</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Close</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @example Custom Padding
 * ```tsx
 * <Modal.Body padding="sm">
 *   <CompactContent />
 * </Modal.Body>
 * ```
 *
 * @see {@link ModalHeader} for the header section
 * @see {@link ModalFooter} for the footer section
 * @see {@link Modal} for the parent component
 * @module Modal/Compound/Body
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalBodyProps } from '../../Modal.types';
import { PADDING_MAP } from '../../Modal.types';

/**
 * Scrollable content area for the Modal.
 *
 * @description
 * Renders a div that fills the remaining modal space between header and footer,
 * with vertical scrolling enabled for overflow content.
 *
 * @param props - {@link ModalBodyProps}
 * @param ref - Forwarded ref to the body container div
 * @returns The modal body content container
 *
 * @example
 * ```tsx
 * <ModalBody padding="lg">
 *   <Text>Long form content that may scroll...</Text>
 * </ModalBody>
 * ```
 */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  (props, ref) => {
    const {
      children,
      padding = 'lg',
      className = '',
      style = {},
    } = props;

    const bodyStyle: React.CSSProperties = {
      flex: 1,
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,
      overflowY: 'auto',
      overflowX: 'hidden',
      fontSize: 'var(--ds-modal-body-font-size, 14px)',
      lineHeight: 1.6,
      ...style,
    };

    return (
      <div
        ref={ref}
        data-part="body"
        className={`rottay-overlay-modal-body ${className}`}
        style={bodyStyle}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'Modal.Body';

export default ModalBody;
