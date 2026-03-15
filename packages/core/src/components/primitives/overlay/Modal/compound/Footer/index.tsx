/**
 * Modal.Footer - Compound Component
 * Footer section of the modal with actions
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalFooterProps } from '../../../../../../contracts/primitives/feedback/Modal';
import { PADDING_MAP } from '../../Modal.types';

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
      borderTop: divider ? '1px solid var(--ds-modal-footer-border, rgba(0, 0, 0, 0.1))' : 'none',
      flexShrink: 0,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-modal-footer ${className}`}
        style={footerStyle}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'Modal.Footer';

export default ModalFooter;
