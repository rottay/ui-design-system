/**
 * Modal.Header - Compound Component
 * Header section of the modal with title and close button
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalHeaderProps } from '../../../../../../contracts/primitives/feedback/Modal';
import { ModalCloseButton } from '../CloseButton';
import { PADDING_MAP } from '../../Modal.types';

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
        className={`rottay-modal-header ${className}`}
        style={headerStyle}
      >
        <div style={titleStyle}>{children}</div>
        {closable && onClose && (
          <ModalCloseButton onClose={onClose} />
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'Modal.Header';

export default ModalHeader;
