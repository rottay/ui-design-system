/**
 * @fileoverview ModalFooter - Rottay Design System
 * @description Compound component for the footer area of a Modal, typically
 * containing action buttons like "Submit", "Cancel", or "Close".
 *
 * @remarks
 * ModalFooter renders a flexbox row with configurable horizontal alignment
 * and an optional top border divider. It uses `flexShrink: 0` to maintain
 * its height even when body content overflows.
 *
 * **Key Features:**
 * - Configurable alignment: start, center, end, space-between
 * - Optional top border divider for visual separation
 * - Configurable padding via PADDING_MAP
 * - Fixed height (non-shrinkable) via `flexShrink: 0`
 * - 12px gap between child elements
 * - Ref forwarding for DOM access
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal, Button } from '@rottay/design-system';
 *
 * <Modal.Footer>
 *   <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
 *   <Button variant="primary" onClick={handleSubmit}>Submit</Button>
 * </Modal.Footer>
 * ```
 *
 * @example With Divider and Space-Between Alignment
 * ```tsx
 * <Modal.Footer divider align="space-between">
 *   <Button variant="danger">Delete</Button>
 *   <Flex gap="3">
 *     <Button variant="ghost">Cancel</Button>
 *     <Button variant="primary">Save</Button>
 *   </Flex>
 * </Modal.Footer>
 * ```
 *
 * @see {@link ModalHeader} for the header section
 * @see {@link ModalBody} for the body section
 * @see {@link Modal} for the parent component
 * @module Modal/Compound/Footer
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalFooterProps } from '../../Modal.types';
import { PADDING_MAP } from '../../Modal.types';

/**
 * Footer section for the Modal with action buttons.
 *
 * @description
 * Renders a flex container for action buttons with configurable alignment,
 * optional top divider border, and customizable padding.
 *
 * @param props - {@link ModalFooterProps}
 * @param ref - Forwarded ref to the footer container div
 * @returns The modal footer element
 *
 * @example
 * ```tsx
 * <ModalFooter divider align="end">
 *   <Button onClick={onCancel}>Cancel</Button>
 *   <Button variant="primary" onClick={onConfirm}>Confirm</Button>
 * </ModalFooter>
 * ```
 */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  (props, ref) => {
    const {
      children,
      divider = false,
      align = 'end',
      padding = 'lg',
      className = '',
      style = {},
    } = props;

    // Maps semantic alignment values to CSS flexbox justify-content values
    const alignMap: Record<string, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      'space-between': 'space-between',
    };

    const footerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: alignMap[align] || 'flex-end',
      gap: '12px',
      padding: PADDING_MAP[padding] || PADDING_MAP.lg,
      flexShrink: 0,
      ...style,
    };

    return (
      <div
        ref={ref}
        data-part="footer"
        data-divider={divider ? 'true' : 'false'}
        className={`rottay-overlay-modal-footer ${className}`}
        style={footerStyle}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'Modal.Footer';

export default ModalFooter;
