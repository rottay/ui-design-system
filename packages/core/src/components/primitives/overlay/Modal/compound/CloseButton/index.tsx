/**
 * @fileoverview ModalCloseButton - Rottay Design System
 * @description Compound component rendering a close button for the Modal header.
 * Provides an accessible dismiss control with hover effects and size variants.
 *
 * @remarks
 * ModalCloseButton renders an "X" icon button that triggers the `onClose`
 * callback when clicked. Its chrome and hover state are painted by the skin,
 * keyed on the `rottay-modal-close-button` class and `data-part="close-button"`.
 *
 * **Key Features:**
 * - Three size variants (sm, md, lg) for button and icon dimensions
 * - Hover effects via CSS variable-driven background and color changes
 * - Click event propagation stopped to prevent backdrop dismissal
 * - Ref forwarding to the underlying `<button>` element
 * - Built-in "X" SVG icon (no external icon dependency)
 *
 * **Accessibility:**
 * - `aria-label` defaults to "Close modal" and is customizable
 * - Rendered as a native `<button>` with `type="button"`
 *
 * @example Basic Usage
 * ```tsx
 * <Modal.CloseButton onClose={handleClose} />
 * ```
 *
 * @example Custom Size
 * ```tsx
 * <Modal.CloseButton onClose={handleClose} size="lg" />
 * ```
 *
 * @example Custom Aria Label
 * ```tsx
 * <Modal.CloseButton
 *   onClose={handleClose}
 *   aria-label="Dismiss dialog"
 * />
 * ```
 *
 * @see {@link ModalHeader} for typical usage context
 * @see {@link Modal} for the parent component
 * @module Modal/Compound/CloseButton
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalCloseButtonProps } from '../../Modal.types';

/** Maps size variants to button and icon pixel dimensions. */
const SIZE_MAP = {
  sm: { button: 24, icon: 14 },
  md: { button: 32, icon: 18 },
  lg: { button: 40, icon: 22 },
};

/**
 * Close button for the Modal with hover effects and accessibility support.
 *
 * @description
 * Renders a transparent button with an "X" SVG icon whose resting and hover
 * chrome come from the skin.
 * Click events are stopped from propagating to prevent triggering backdrop dismiss.
 *
 * @param props - {@link ModalCloseButtonProps}
 * @param ref - Forwarded ref to the `<button>` element
 * @returns An accessible close button element
 *
 * @example
 * ```tsx
 * <ModalCloseButton onClose={() => setOpen(false)} size="md" />
 * ```
 */
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
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      flexShrink: 0,
      ...style,
    };

    // Stop propagation to prevent the modal backdrop's click handler from firing
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose?.();
    };

    return (
      <button
        ref={ref}
        type="button"
        data-part="close-button"
        className={`rottay-modal-close-button ${className}`}
        style={buttonStyle}
        onClick={handleClick}
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
