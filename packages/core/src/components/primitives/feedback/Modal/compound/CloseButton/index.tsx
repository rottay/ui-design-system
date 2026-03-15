/**
 * @fileoverview Modal.CloseButton - Rottay Design System
 * @description Standalone close button component for custom modal layouts.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This component provides a reusable close button that can be placed
 * anywhere within a modal for custom layouts. It's used internally by
 * Modal.Header but can also be used independently.
 *
 * **Features:**
 * - Three size variants (sm, md, lg)
 * - SVG X icon for crisp rendering
 * - Hover and focus states
 * - Full accessibility support
 * - CSS custom property theming
 *
 * **Accessibility:**
 * - Proper button semantics (`type="button"`)
 * - Customizable aria-label
 * - Focus visible states
 *
 * **Styling via CSS Custom Properties:**
 * - `--ds-modal-close-color`: Button color (default: rgba(0, 0, 0, 0.45))
 *
 * @example Basic Usage
 * ```tsx
 * <Modal.CloseButton onClose={handleClose} />
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * <Modal.CloseButton size="sm" onClose={handleClose} />
 * <Modal.CloseButton size="md" onClose={handleClose} />
 * <Modal.CloseButton size="lg" onClose={handleClose} />
 * ```
 *
 * @example Custom Aria Label
 * ```tsx
 * <Modal.CloseButton
 *   onClose={handleClose}
 *   aria-label="Dismiss notification"
 * />
 * ```
 *
 * @example Positioned Independently
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <div style={{ position: 'relative' }}>
 *     <Modal.CloseButton
 *       onClose={handleClose}
 *       style={{ position: 'absolute', top: 8, right: 8 }}
 *     />
 *     <Modal.Body padding="lg">
 *       Custom layout without header
 *     </Modal.Body>
 *   </div>
 * </Modal>
 * ```
 *
 * @module Modal/CloseButton
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalCloseButtonProps } from '../../Modal.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size mappings for the close button.
 * Defines button dimensions and icon sizes for each variant.
 * @internal
 */
const SIZE_MAP: Record<'sm' | 'md' | 'lg', { size: string; icon: string }> = {
  /** Small - 24px button, 14px icon */
  sm: { size: '24px', icon: '14px' },
  /** Medium - 32px button, 18px icon (default) */
  md: { size: '32px', icon: '18px' },
  /** Large - 40px button, 22px icon */
  lg: { size: '40px', icon: '22px' },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modal close button compound component.
 *
 * @description
 * Renders a standalone close button with an X icon. Designed for
 * accessibility with proper button semantics and ARIA attributes.
 *
 * @remarks
 * - Uses inline SVG for crisp icon rendering at any size
 * - Transparent background with hover state
 * - Forwards ref for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * @param props - {@link ModalCloseButtonProps}
 * @param ref - Forwarded ref to the button element
 * @returns The rendered close button
 *
 * @example
 * ```tsx
 * <Modal.CloseButton
 *   onClose={() => setModalOpen(false)}
 *   size="md"
 *   aria-label="Close settings"
 * />
 * ```
 */
export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      onClose,
      size = 'md',
      className = '',
      style = {},
      'aria-label': ariaLabel = 'Close modal',
    } = props;

    // -------------------------------------------------------------------------
    // Size Configuration
    // -------------------------------------------------------------------------

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Button styles for the close button.
     * Minimal styling for a clean, accessible button.
     */
    const buttonStyle: React.CSSProperties = {
      // Layout - centered flex container
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',

      // Dimensions - based on size prop
      width: sizeConfig.size,
      height: sizeConfig.size,

      // Reset button defaults
      padding: 0,
      border: 'none',
      borderRadius: '4px',
      background: 'transparent',

      // Color - uses CSS custom property for tenant theming
      color: 'var(--ds-modal-close-color, rgba(0, 0, 0, 0.45))',

      // Interaction
      cursor: 'pointer',
      transition: 'color 0.2s, background-color 0.2s',

      // Prevent shrinking in flex layouts
      flexShrink: 0,

      // Merge user styles (takes precedence)
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-modal-close ${className}`.trim()}
        style={buttonStyle}
        onClick={onClose}
        aria-label={ariaLabel}
      >
        {/* SVG X Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    );
  }
);

// Set display name for React DevTools
ModalCloseButton.displayName = 'Modal.CloseButton';

// Default export for convenience
export default ModalCloseButton;
