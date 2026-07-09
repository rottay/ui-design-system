'use client';

/**
 * @fileoverview Modal Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Modal component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Maximum accessibility control
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic heavily uses CSS custom properties for theming:
 * - `--ds-color-bg-elevated`: Modal background
 * - `--ds-color-border`: Border color
 * - `--ds-radius-lg`: Border radius
 *
 * **Size Styles:**
 * | Size | Max Width |
 * |------|-----------|
 * | xs | 320px |
 * | sm | 416px |
 * | md | 520px |
 * | lg | 720px |
 * | xl | 900px |
 * | full | 90vw |
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal engine="rustic" open={open} onClose={onClose}>
 *   <p>Vanilla-styled modal</p>
 * </Modal>
 * ```
 *
 * @example With Custom CSS Variables
 * ```tsx
 * <div style={{
 *   '--ds-color-bg-elevated': '#1a1a2e',
 *   '--ds-color-border': '#333',
 *   '--ds-radius-lg': '16px'
 * }}>
 *   <Modal engine="rustic" open={open} onClose={onClose}>
 *     Dark themed modal
 *   </Modal>
 * </div>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link ClassicModal} - Ant Design alternative
 * @see {@link ModernModal} - DaisyUI alternative
 * @module Modal/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect } from 'react';
import type { ModalProps, ModalSize } from '../Modal.types';
import { MODAL_DEFAULTS } from '../Modal.types';
import { Portal } from '../../../overlay/Modal/utils/Portal';
import { useModalInertSiblings } from '../../../overlay/Modal/utils/useModalInertSiblings';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size style mappings for Rustic engine.
 * Uses maxWidth for responsive behavior.
 *
 * @internal
 */
const SIZE_STYLES: Record<ModalSize, { maxWidth: string; width?: string }> = {
  /** Extra small - 320px */
  xs: { maxWidth: '320px' },
  /** Small - 416px */
  sm: { maxWidth: '416px' },
  /** Medium - 520px (default) */
  md: { maxWidth: '520px' },
  /** Large - 720px */
  lg: { maxWidth: '720px' },
  /** Extra large - 900px */
  xl: { maxWidth: '900px' },
  /** 2X large - 960px */
  '2xl': { maxWidth: '960px' },
  /** 3X large - 1120px */
  '3xl': { maxWidth: '1120px' },
  /** 4X large - 1280px */
  '4xl': { maxWidth: '1280px' },
  /** 5X large - 1440px */
  '5xl': { maxWidth: '1440px' },
  /** Full width with constraint */
  full: { maxWidth: '90vw', width: '100%' },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Modal component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through CSS custom properties
 * and inline styles.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses flexbox for centering
 * - Implements body scroll lock when open
 * - Custom keyboard handling for Escape key
 * - CSS custom properties for theming
 * - Semantic HTML with ARIA attributes
 *
 * **Accessibility Features:**
 * - `role="dialog"` on modal container
 * - `aria-modal="true"` for modal behavior
 * - Close button with proper semantics
 * - Focus management via native browser behavior
 *
 * **CSS Custom Properties:**
 * | Property | Default | Description |
 * |----------|---------|-------------|
 * | `--ds-color-bg-elevated` | #fff | Modal background |
 * | `--ds-color-border` | #f0f0f0 | Border color |
 * | `--ds-radius-lg` | 8px | Border radius |
 *
 * @param props - {@link ModalProps}
 * @returns The rendered vanilla Modal or empty fragment when closed
 *
 * @example
 * ```tsx
 * <RusticModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   title="Accessibility Settings"
 *   centered
 * >
 *   <AccessibilityForm />
 * </RusticModal>
 * ```
 */
export default function RusticModal(props: ModalProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,
    zIndex = MODAL_DEFAULTS.zIndex,

    // Content
    title,
    children,
    footer,
    hideFooter,

    // Behavior
    onClose,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,

    // Overlay
    overlayOpacity = MODAL_DEFAULTS.overlayOpacity,

    // Confirmation
    okText = 'OK',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    confirmLoading,

    // Styling
    className = '',
    style,
  } = props;

  const isOpen = Boolean(open);

  useModalInertSiblings(isOpen);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle cancel/close action.
   * Called when X button clicked, overlay clicked, or Escape pressed.
   */
  const handleCancel = () => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  };

  /**
   * Handle OK/confirm action.
   * Called when OK button is clicked.
   */
  const handleOk = () => {
    onOk?.();
  };

  // ---------------------------------------------------------------------------
  // Keyboard Handling
  // ---------------------------------------------------------------------------

  /**
   * Effect: Handle Escape key press to close modal.
   * Only active when modal is open and closeOnEscape is true.
   */
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // ---------------------------------------------------------------------------
  // Body Scroll Lock
  // ---------------------------------------------------------------------------

  /**
   * Effect: Lock body scroll when modal is open.
   * Prevents background content from scrolling while modal is visible.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render anything when closed
  if (!isOpen) return <></>;

  // ---------------------------------------------------------------------------
  // Size Styles
  // ---------------------------------------------------------------------------

  const modalSize = size as ModalSize;

  // ---------------------------------------------------------------------------
  // Style Definitions
  // ---------------------------------------------------------------------------

  // Overlay uses fixed positioning to cover the entire viewport.
  // overflowY: 'auto' allows scrolling tall modals when content exceeds
  // viewport height. The centered prop switches between vertical centering
  // (dialogs) and top-aligned (long form modals that need scroll room).
  // overlayOpacity is configurable per instance for different visual weights.
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    display: 'flex',
    alignItems: centered ? 'center' : 'flex-start',
    justifyContent: 'center',
    padding: '20px',
    zIndex,
    overflowY: 'auto',
  };

  // Three-level CSS variable fallback chain: component-specific token ->
  // global semantic token -> hardcoded default. This allows tenants to
  // customize at any granularity (modal-specific, theme-wide, or neither).
  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--ds-modal-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
    borderRadius: 'var(--ds-modal-radius, var(--ds-radius-lg, 12px))',
    boxShadow: 'var(--ds-modal-shadow, var(--ds-shadow-xl))',
    position: 'relative',
    width: '100%',
    ...SIZE_STYLES[modalSize],
    ...style,
  };

  /**
   * Header section styles.
   */
  const headerStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-header-padding, 16px 24px)',
    borderBottom: '1px solid var(--ds-modal-border-color, var(--ds-color-border-primary, var(--ds-color-border)))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  /**
   * Footer section styles.
   */
  const footerStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-footer-padding, 10px 16px)',
    borderTop: '1px solid var(--ds-modal-border-color, var(--ds-color-border-primary, var(--ds-color-border)))',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--ds-modal-footer-gap, 12px)',
  };

  /**
   * Cancel button styles.
   */
  const cancelButtonStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-btn-padding, 4px 15px)',
    fontSize: 'var(--ds-modal-btn-font-size, 14px)',
    borderRadius: 'var(--ds-modal-btn-radius, 4px)',
    cursor: 'pointer',
    border: '1px solid var(--ds-modal-cancel-border, var(--ds-color-border-secondary, var(--ds-color-border-primary)))',
    background: 'var(--ds-modal-cancel-bg, var(--ds-color-bg-elevated, var(--ds-color-bg-primary)))',
    color: 'var(--ds-modal-cancel-color, var(--ds-color-text-primary, inherit))',
  };

  /**
   * OK/primary button styles.
   */
  const okButtonStyle: React.CSSProperties = {
    padding: 'var(--ds-modal-btn-padding, 4px 15px)',
    fontSize: 'var(--ds-modal-btn-font-size, 14px)',
    borderRadius: 'var(--ds-modal-btn-radius, 4px)',
    cursor: 'pointer',
    background: 'var(--ds-modal-ok-bg, var(--ds-color-primary-500, var(--ds-color-primary)))',
    color: 'var(--ds-modal-ok-color, var(--ds-color-text-on-primary, var(--ds-color-text-inverse)))',
    border: 'none',
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Portal>
      <div
        className={`rottay-modal-overlay ${className}`}
        style={overlayStyle}
        onClick={closeOnOverlayClick ? handleCancel : undefined}
      >
        {/* stopPropagation prevents overlay click handler from firing when
          user clicks inside the modal content. role="dialog" + aria-modal="true"
          informs assistive technologies this is a modal context, enabling
          proper focus trapping behavior in screen readers. */}
      <div
        className="rottay-modal"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header section */}
        {(title || closable) && (
          <div style={headerStyle}>
            {title && (
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                {title}
              </h3>
            )}
            {closable && (
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onClick={handleCancel}
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body section */}
        <div style={{ padding: '24px' }}>{children}</div>

        {/* Footer section */}
        {!hideFooter && (
          <div style={footerStyle}>
            {footer || (
              <>
                {onCancel && (
                  <button style={cancelButtonStyle} onClick={handleCancel}>
                    {cancelText}
                  </button>
                )}
                {/* Text-based loading indicator ("Loading...") instead of a
                    spinner because Rustic avoids icon/animation dependencies.
                    disabled prevents double-submission during async confirmation. */}
                {onOk && (
                  <button
                    style={okButtonStyle}
                    onClick={handleOk}
                    disabled={confirmLoading}
                  >
                    {confirmLoading ? 'Loading...' : okText}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </Portal>
  );
}
