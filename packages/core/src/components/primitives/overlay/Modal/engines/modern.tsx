/**
 * @fileoverview Modal Modern (Hermes) Engine - Rottay Design System.
 * DaisyUI/Tailwind implementation using the native HTML <dialog> element for
 * proper focus management. Provides a scale+opacity entrance animation,
 * backdrop blur, scrollbar-width compensation, and close-button hover effects.
 *
 * @example
 * ```tsx
 * <Modal engine="modern" open={open} onClose={close} title="Edit Profile" size="lg">
 *   <ProfileForm />
 * </Modal>
 * ```
 *
 * @module Modal/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { ModalProps } from '../Modal.types';
import { MODAL_DEFAULTS, SIZE_MAP, RADIUS_MAP, PADDING_MAP } from '../Modal.types';
import { Portal } from '../utils/Portal';
import { useTranslation } from '../../../../../i18n';

/** Maps design-system size tokens to Tailwind max-width utility classes. */
const SIZE_CLASS_MAP: Record<string, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full',
};

/**
 * Calculate scrollbar width for body padding compensation.
 */
function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Modern engine implementation of Modal using DaisyUI and the native <dialog> API.
 *
 * Leverages showModal()/close() for built-in top-layer stacking and browser
 * focus trapping. Compensates for scrollbar layout shift by adding padding-right
 * to <body> equal to the scrollbar width while the modal is open. Injects
 * keyframe animations via a <style> tag so no external stylesheet is required.
 *
 * @param props - Modal configuration props
 * @returns DaisyUI-styled dialog element, or null when closed
 */
export default function ModernModal(props: ModalProps): React.ReactElement | null {
  const { t } = useTranslation('components');

  const {
    open,
    onClose,
    children,
    size = MODAL_DEFAULTS.size,
    title,
    description,
    header,
    footer,
    closeOnBackdropClick = MODAL_DEFAULTS.closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    closable = MODAL_DEFAULTS.closable,
    showBackdrop = MODAL_DEFAULTS.showBackdrop,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop,
    placement = MODAL_DEFAULTS.placement,
    fullScreen = false,
    preventScroll = MODAL_DEFAULTS.preventScroll,
    radius = MODAL_DEFAULTS.radius,
    shadow = MODAL_DEFAULTS.shadow,
    padding = MODAL_DEFAULTS.padding,
    divider = MODAL_DEFAULTS.divider,
    zIndex = MODAL_DEFAULTS.zIndex,
    disableAnimation: _disableAnimation = MODAL_DEFAULTS.disableAnimation,
    className = '',
    style = {},
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  // Handle ESC key
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        e.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, open, onClose]
  );

  // Sync the native <dialog> open state with the controlled `open` prop.
  // showModal() promotes the element to the top layer with a built-in backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  // ESC key listener
  useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [open, closeOnEscape, handleEscKey]);

  // Lock body scroll and compensate for disappearing scrollbar to prevent layout shift
  useEffect(() => {
    if (!preventScroll) return;

    if (open) {
      const scrollbarWidth = getScrollbarWidth();
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open, preventScroll]);

  // Only dismiss when the click target is the dialog itself (the backdrop area),
  // not any child content -- e.target === e.currentTarget ensures this.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  // Sync controlled state when the browser closes the dialog (e.g. via Escape)
  const handleDialogClose = () => {
    if (open) {
      onClose();
    }
  };

  // Fullscreen overrides all max-width constraints; otherwise use the size lookup
  const sizeClass = fullScreen ? 'w-screen h-screen max-w-full max-h-full' : SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.md;
  const placementClass = placement === 'top' ? 'modal-top' : placement === 'bottom' ? 'modal-bottom' : 'modal-middle';

  // Inline styles enable CSS custom property theming without requiring a stylesheet
  const modalBoxStyle: React.CSSProperties = {
    width: fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md,
    maxWidth: fullScreen ? '100vw' : '90vw',
    maxHeight: fullScreen ? '100vh' : '85vh',
    borderRadius: fullScreen ? '0' : RADIUS_MAP[radius] || RADIUS_MAP.lg,
    boxShadow: shadow ? 'var(--ds-modal-shadow, var(--ds-shadow-2xl))' : 'none',
    backgroundColor: 'var(--ds-modal-bg)',
    color: 'var(--ds-modal-color)',
    // Entrance animation -- durations and easing resolved from DS motion tokens
    animation: 'rottay-modal-enter var(--ds-duration-slow, 0.3s) var(--ds-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
    ...style,
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <Portal>
      <dialog
        ref={dialogRef}
        className={`modal ${open ? 'modal-open' : ''} ${placementClass} rottay-modal rottay-modal--modern ${className}`}
        style={{ zIndex }}
        onClick={handleBackdropClick}
        onClose={handleDialogClose}
      >
        {/* Backdrop with blur */}
        {showBackdrop && (
          <div
            className="modal-backdrop"
            style={{
              backgroundColor: 'var(--ds-overlay-bg, var(--ds-modal-overlay-bg, rgba(0, 0, 0, 0.5)))',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              animation: 'rottay-modal-backdrop-enter var(--ds-duration-slow, 0.3s) ease-out',
            }}
          />
        )}

        {/* Modal Box */}
        <div
          className={`modal-box ${sizeClass}`}
          style={modalBoxStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || header || closable) && (
            <div
              className="flex items-center justify-between gap-3"
              style={{
                padding: PADDING_MAP[padding] || PADDING_MAP.lg,
                paddingBottom: divider ? PADDING_MAP[padding] || PADDING_MAP.lg : '0',
                borderBottom: divider ? '1px solid var(--ds-modal-header-border, var(--ds-color-border-primary))' : 'none',
              }}
            >
              <div className="flex-1">
                {header || (
                  title && (
                    <h3 className="font-bold text-lg">{title}</h3>
                  )
                )}
              </div>
              {closable && (
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={onClose}
                  onMouseEnter={() => setIsCloseHovered(true)}
                  onMouseLeave={() => setIsCloseHovered(false)}
                  aria-label={t('modal.close')}
                  style={{
                    transition: 'background-color var(--ds-duration-normal, 0.2s) ease, transform var(--ds-duration-fast, 0.15s) ease',
                    backgroundColor: isCloseHovered
                      ? 'var(--ds-modal-close-hover-bg, rgba(0, 0, 0, 0.08))'
                      : 'transparent',
                    transform: isCloseHovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div
            className="overflow-y-auto"
            style={{
              padding: PADDING_MAP[padding] || PADDING_MAP.lg,
              paddingTop: (title || header) ? (divider ? PADDING_MAP[padding] : '12px') : PADDING_MAP[padding],
            }}
          >
            {description && (
              <p
                className="py-2"
                style={{ color: 'var(--ds-modal-body-color, var(--ds-color-text-secondary))' }}
              >
                {description}
              </p>
            )}
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="modal-action flex justify-end gap-3"
              style={{
                padding: PADDING_MAP[padding] || PADDING_MAP.lg,
                paddingTop: divider ? PADDING_MAP[padding] || PADDING_MAP.lg : '0',
                borderTop: divider ? '1px solid var(--ds-modal-footer-border, var(--ds-color-border-primary))' : 'none',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </dialog>

      {/* Keyframe animations for entrance */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rottay-modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes rottay-modal-backdrop-enter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}} />
    </Portal>
  );
}

ModernModal.displayName = 'ModernModal';
