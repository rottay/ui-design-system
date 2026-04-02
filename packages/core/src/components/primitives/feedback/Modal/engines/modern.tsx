'use client';

/**
 * @fileoverview Modal Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Modal component.
 * A lightweight, utility-first alternative to the Classic engine.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Classic while maintaining
 * core modal functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI modal component classes
 * - Custom keyboard and scroll handling
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Modern uses the DS token system with DaisyUI color variables.
 * Tenant themes override via `--ds-color-*` and `--color-*` (DaisyUI 5 oklch).
 * Motion uses `--ds-duration-*` and `--ds-ease-*` tokens.
 * Reduced motion is respected via `--ds-motion-reduce`.
 *
 * **Size Classes:**
 * | Size | CSS Class |
 * |------|-----------|
 * | xs | w-80 |
 * | sm | w-96 |
 * | md | w-[520px] |
 * | lg | w-[720px] |
 * | xl | w-[900px] |
 * | full | w-11/12 max-w-7xl |
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal engine="modern" open={open} onClose={onClose}>
 *   <p>Tailwind-styled modal</p>
 * </Modal>
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Modal } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <App>
 *     <Modal open={open} onClose={onClose}>
 *       All modals use Modern engine
 *     </Modal>
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link ClassicModal} - Ant Design alternative
 * @see {@link RusticModal} - Vanilla alternative
 * @see {@link https://daisyui.com/components/modal} - DaisyUI Modal docs
 * @module Modal/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect } from 'react';
import type { ModalProps, ModalSize } from '../Modal.types';
import { MODAL_DEFAULTS } from '../Modal.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size class mappings for Modern engine.
 * Uses DaisyUI modal-box class with Tailwind width utilities.
 *
 * @internal
 */
const SIZE_CLASSES: Record<ModalSize, string> = {
  /** Extra small - 320px */
  xs: 'modal-box w-80',
  /** Small - 384px */
  sm: 'modal-box w-96',
  /** Medium - 520px (default) */
  md: 'modal-box w-[520px]',
  /** Large - 720px */
  lg: 'modal-box w-[720px]',
  /** Extra large - 900px */
  xl: 'modal-box w-[900px]',
  /** 2X large - 960px */
  '2xl': 'modal-box w-[960px]',
  /** 3X large - 1120px */
  '3xl': 'modal-box w-[1120px]',
  /** 4X large - 1280px */
  '4xl': 'modal-box w-[1280px]',
  /** 5X large - 1440px */
  '5xl': 'modal-box w-[1440px]',
  /** Full width with max constraint */
  full: 'modal-box w-11/12 max-w-7xl',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Modal component.
 *
 * @description
 * Custom modal implementation using DaisyUI classes and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses `useEffect` for keyboard event handling
 * - Implements body scroll lock when modal is open
 * - DaisyUI modal classes for styling
 * - Custom backdrop handling
 *
 * **CSS Classes Used:**
 * - `modal`, `modal-open`, `modal-middle`: Container classes
 * - `modal-box`: Content container
 * - `modal-backdrop`: Overlay element
 * - `modal-action`: Footer container
 * - `btn`, `btn-primary`, `btn-ghost`: Button classes
 *
 * **Accessibility:**
 * - Close button has `aria-label="Close"`
 * - Escape key handling for keyboard users
 *
 * @param props - {@link ModalProps}
 * @returns The rendered DaisyUI Modal or empty fragment when closed
 *
 * @example
 * ```tsx
 * <ModernModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   title="Filter Options"
 *   centered
 * >
 *   <FilterForm />
 * </ModernModal>
 * ```
 */
export default function ModernModal(props: ModalProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,

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

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle cancel/close action.
   * Called when X button clicked, backdrop clicked, or Escape pressed.
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

  // Manual Escape key handling because DaisyUI's modal component doesn't
  // provide built-in keyboard dismiss. The listener is scoped to the
  // document level so it works regardless of focus position within the modal.
  // Cleanup on unmount or when open/closeOnEscape changes prevents stale handlers.
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape]);

  // ---------------------------------------------------------------------------
  // Body Scroll Lock
  // ---------------------------------------------------------------------------

  // Body scroll lock prevents the page from scrolling behind the modal overlay,
  // which is disorienting on mobile. Setting overflow to '' (empty) rather than
  // 'auto' restores whatever the original value was. The cleanup function ensures
  // scroll is restored if the component unmounts while open (e.g., route change).
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Early return with empty fragment instead of null to satisfy the
  // ReactElement return type. Unlike Classic (which delegates visibility
  // to Ant Design's open prop), Modern must conditionally render because
  // DaisyUI's modal-open class only controls visibility, not DOM presence.
  if (!open) return <></>;

  // ---------------------------------------------------------------------------
  // Size Classes
  // ---------------------------------------------------------------------------

  const modalSize = size as ModalSize;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`modal modal-open ${centered ? 'modal-middle' : ''}`}
      style={style}
    >
      {/* DaisyUI modal-backdrop creates a semi-transparent overlay.
          Click handler is conditionally attached rather than using
          stopPropagation on the content, keeping the event flow cleaner. */}
      <div
        className="modal-backdrop"
        onClick={closeOnOverlayClick ? handleCancel : undefined}
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'ds-backdrop-fade var(--ds-duration-normal, 0.2s) var(--ds-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
        }}
      />

      {/* Modal Content Container */}
      <div
        className={`${SIZE_CLASSES[modalSize]} ${className}`}
        style={{
          animation: 'ds-modal-enter var(--ds-duration-slow, 0.3s) var(--ds-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
          boxShadow: 'var(--ds-shadow-modal, var(--ds-shadow-2xl, 0 25px 50px -12px rgba(0,0,0,.25)))',
        }}
      >
        {/* Close button */}
        {closable && (
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleCancel}
            aria-label="Close"
            style={{
              transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--ds-color-bg-tertiary, rgba(0,0,0,0.06))';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '';
            }}
          >
            ✕
          </button>
        )}

        {/* Title */}
        {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}

        {/* Body content */}
        <div className="py-4">{children}</div>

        {/* Footer with action buttons */}
        {!hideFooter && (
          <div className="modal-action">
            {footer || (
              <>
                {onCancel && (
                  <button className="btn" onClick={handleCancel}>
                    {cancelText}
                  </button>
                )}
                {/* DaisyUI's "loading" class shows a spinner inside the button.
                    disabled prevents double-submission during async operations
                    like API calls triggered by onOk. */}
                {onOk && (
                  <button
                    className={`btn btn-primary ${confirmLoading ? 'loading' : ''}`}
                    onClick={handleOk}
                    disabled={confirmLoading}
                  >
                    {okText}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
