/**
 * Modal - Modern Engine (DaisyUI)
 *
 * Enhancements:
 * - Scale + opacity entrance animation (0.95 -> 1, 0 -> 1, 0.3s)
 * - Backdrop-filter: blur(4px) on overlay
 * - Scrollbar compensation (padding to body when scroll is hidden)
 * - Close button with hover background color transition
 */

'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import type { ModalProps } from '../../../../../../types/primitives/feedback/Modal';
import { MODAL_DEFAULTS, SIZE_MAP, RADIUS_MAP, PADDING_MAP } from '../../types';
import { Portal } from '../../utils/Portal';
import { useTranslation } from '../../../../../../theme/i18n';

// DaisyUI size class mapping
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

  // Open/close dialog
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

  // Prevent scroll + scrollbar compensation
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

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  // Handle native dialog close event
  const handleDialogClose = () => {
    if (open) {
      onClose();
    }
  };

  // Build DaisyUI classes
  const sizeClass = fullScreen ? 'w-screen h-screen max-w-full max-h-full' : SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.md;
  const placementClass = placement === 'top' ? 'modal-top' : placement === 'bottom' ? 'modal-bottom' : 'modal-middle';

  // Modal box styles
  const modalBoxStyle: React.CSSProperties = {
    width: fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md,
    maxWidth: fullScreen ? '100vw' : '90vw',
    maxHeight: fullScreen ? '100vh' : '85vh',
    borderRadius: fullScreen ? '0' : RADIUS_MAP[radius] || RADIUS_MAP.lg,
    boxShadow: shadow ? 'var(--ds-modal-shadow, var(--ds-shadow-2xl))' : 'none',
    backgroundColor: 'var(--ds-modal-bg)',
    color: 'var(--ds-modal-color)',
    // Entrance animation
    animation: 'rottay-modal-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
              animation: 'rottay-modal-backdrop-enter 0.3s ease-out',
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
                    transition: 'background-color 0.2s ease, transform 0.15s ease',
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
