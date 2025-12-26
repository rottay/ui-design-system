/**
 * Modal.CloseButton - Compound Component
 * Close button for the modal header
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalCloseButtonProps } from '../../types';

const SIZE_MAP = {
  sm: { button: 24, icon: 14 },
  md: { button: 32, icon: 18 },
  lg: { button: 40, icon: 22 },
};

export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  (props, ref) => {
    const {
      onClose,
      size = 'md',
      className = '',
      style = {},
      'aria-label': ariaLabel = 'Close modal',
    } = props;

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

    const buttonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeConfig.button,
      height: sizeConfig.button,
      padding: 0,
      margin: 0,
      border: 'none',
      borderRadius: 'var(--modal-close-button-radius, 6px)',
      backgroundColor: 'transparent',
      color: 'var(--modal-close-button-color, rgba(0, 0, 0, 0.45))',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      flexShrink: 0,
      ...style,
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose?.();
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'var(--modal-close-button-hover-bg, rgba(0, 0, 0, 0.06))';
      e.currentTarget.style.color = 'var(--modal-close-button-hover-color, rgba(0, 0, 0, 0.88))';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--modal-close-button-color, rgba(0, 0, 0, 0.45))';
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-modal-close-button ${className}`}
        style={buttonStyle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
      >
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
