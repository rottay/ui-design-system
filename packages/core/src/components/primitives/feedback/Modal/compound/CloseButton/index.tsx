/**
 * Modal.CloseButton - Compound Component
 * Custom close button for the modal
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalCloseButtonProps } from '../../types';

export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  (props, ref) => {
    const {
      onClose,
      size = 'md',
      className = '',
      style = {},
      'aria-label': ariaLabel = 'Close modal',
    } = props;

    const sizeMap = {
      sm: { size: '24px', icon: '14px' },
      md: { size: '32px', icon: '18px' },
      lg: { size: '40px', icon: '22px' },
    };

    const buttonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeMap[size].size,
      height: sizeMap[size].size,
      padding: 0,
      border: 'none',
      borderRadius: '4px',
      background: 'transparent',
      color: 'var(--modal-close-color, rgba(0, 0, 0, 0.45))',
      cursor: 'pointer',
      transition: 'color 0.2s, background-color 0.2s',
      flexShrink: 0,
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-modal-close ${className}`}
        style={buttonStyle}
        onClick={onClose}
        aria-label={ariaLabel}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: sizeMap[size].icon, height: sizeMap[size].icon }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    );
  }
);

ModalCloseButton.displayName = 'Modal.CloseButton';

export default ModalCloseButton;
