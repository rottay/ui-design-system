/**
 * Modal - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useEffect, useCallback } from 'react';
import type { ModalProps } from '../../../../../types/primitives/feedback/Modal';
import { MODAL_DEFAULTS, SIZE_MAP, MAX_HEIGHT_MAP, PADDING_MAP, RADIUS_MAP } from '../types';
import { Portal } from '../utils/Portal';
import { Overlay } from '../utils/Overlay';
import { FocusTrap } from '../utils/FocusTrap';
import { ModalHeader } from '../compound/Header';
import { ModalBody } from '../compound/Body';
import { ModalFooter } from '../compound/Footer';

/**
 * Base Modal component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseModal = forwardRef<HTMLDivElement, ModalProps>(
  (props, ref) => {
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
      onOpen,
      onOpenChange,
      preventScroll = MODAL_DEFAULTS.preventScroll,
      radius = MODAL_DEFAULTS.radius,
      shadow = MODAL_DEFAULTS.shadow,
      padding = MODAL_DEFAULTS.padding,
      divider = MODAL_DEFAULTS.divider,
      zIndex = MODAL_DEFAULTS.zIndex,
      disableAnimation = MODAL_DEFAULTS.disableAnimation,
      className = '',
      style = {},
    } = props;

    // Handle ESC key
    const handleEscKey = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape && open) {
          onClose();
        }
      },
      [closeOnEscape, open, onClose]
    );

    // Handle body scroll lock
    useEffect(() => {
      if (!preventScroll) return;

      if (open) {
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Get scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

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

    // Handle ESC key listener
    useEffect(() => {
      if (open && closeOnEscape) {
        document.addEventListener('keydown', handleEscKey);
        return () => {
          document.removeEventListener('keydown', handleEscKey);
        };
      }
    }, [open, closeOnEscape, handleEscKey]);

    // Trigger open callback
    useEffect(() => {
      if (open) {
        onOpen?.();
        onOpenChange?.(true);
      } else {
        onOpenChange?.(false);
      }
    }, [open, onOpen, onOpenChange]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
      if (closeOnBackdropClick) {
        onClose();
      }
    }, [closeOnBackdropClick, onClose]);

    // Build CSS variables for the modal
    const modalVars: React.CSSProperties = {
      '--modal-width': fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md,
      '--modal-max-height': fullScreen ? '100vh' : MAX_HEIGHT_MAP[size] || MAX_HEIGHT_MAP.md,
      '--modal-bg': 'var(--modal-background, #ffffff)',
      '--modal-border-radius': fullScreen ? '0' : RADIUS_MAP[radius] || RADIUS_MAP.lg,
      '--modal-shadow': shadow
        ? 'var(--modal-box-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25))'
        : 'none',
      '--modal-header-border': 'var(--modal-divider-color, rgba(0, 0, 0, 0.1))',
      '--modal-footer-border': 'var(--modal-divider-color, rgba(0, 0, 0, 0.1))',
      '--modal-padding': PADDING_MAP[padding] || PADDING_MAP.lg,
      '--modal-overlay-bg': 'var(--modal-backdrop-color, rgba(0, 0, 0, 0.5))',
      '--modal-overlay-blur': blurBackdrop ? 'var(--modal-backdrop-blur, 4px)' : '0',
      '--modal-z-index': zIndex.toString(),
      '--modal-transition': disableAnimation
        ? 'none'
        : 'var(--modal-transition-duration, all 0.3s cubic-bezier(0.4, 0, 0.2, 1))',
    } as React.CSSProperties;

    // Compute placement styles
    const placementStyles: React.CSSProperties = {
      center: { alignItems: 'center', justifyContent: 'center' },
      top: { alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' },
      bottom: { alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10vh' },
    }[placement] || { alignItems: 'center', justifyContent: 'center' };

    // Modal content styles
    const modalStyle: React.CSSProperties = {
      ...modalVars,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      width: 'var(--modal-width)',
      maxWidth: fullScreen ? '100vw' : '90vw',
      maxHeight: 'var(--modal-max-height)',
      backgroundColor: 'var(--modal-bg)',
      borderRadius: 'var(--modal-border-radius)',
      boxShadow: 'var(--modal-shadow)',
      overflow: 'hidden',
      cursor: 'default',
      transform: open ? 'scale(1)' : 'scale(0.95)',
      opacity: open ? 1 : 0,
      transition: disableAnimation ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
      ...style,
    };

    // Don't render if not open and not animating
    if (!open) return null;

    const content = (
      <Portal>
        <Overlay
          visible={open && showBackdrop}
          onClick={handleBackdropClick}
          clickable={closeOnBackdropClick}
          blur={blurBackdrop}
          zIndex={zIndex}
          disableAnimation={disableAnimation}
          style={placementStyles}
        >
          <FocusTrap active={open} autoFocus restoreFocus>
            <div
              ref={ref}
              className={`rottay-modal rottay-modal--${size} ${className}`}
              style={modalStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || header) && (
                <ModalHeader
                  divider={divider}
                  closable={closable}
                  onClose={onClose}
                >
                  {header || (
                    <>
                      {title && <span id="modal-title">{title}</span>}
                    </>
                  )}
                </ModalHeader>
              )}

              {/* Body */}
              <ModalBody padding={padding}>
                {description && (
                  <p id="modal-description" style={{ marginTop: 0 }}>
                    {description}
                  </p>
                )}
                {children}
              </ModalBody>

              {/* Footer */}
              {footer && (
                <ModalFooter divider={divider}>
                  {footer}
                </ModalFooter>
              )}
            </div>
          </FocusTrap>
        </Overlay>
      </Portal>
    );

    return content;
  }
);

BaseModal.displayName = 'BaseModal';
