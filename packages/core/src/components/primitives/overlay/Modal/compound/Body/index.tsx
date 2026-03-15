/**
 * Modal.Body - Compound Component
 * Body/content section of the modal with optional scrolling
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalBodyProps } from '../../../../../../contracts/primitives/feedback/Modal';
import { PADDING_MAP } from '../../Modal.types';

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
      color: 'var(--ds-modal-body-color, inherit)',
      fontSize: 'var(--ds-modal-body-font-size, 14px)',
      lineHeight: 1.6,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-modal-body ${className}`}
        style={bodyStyle}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'Modal.Body';

export default ModalBody;
