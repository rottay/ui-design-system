/**
 * Modal - Apollo Engine (Pure HTML/CSS with Portal, Overlay, FocusTrap)
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import type { ModalProps } from '../../../../../../types/primitives/feedback/Modal';
import { MODAL_DEFAULTS, SIZE_MAP, MAX_HEIGHT_MAP, PADDING_MAP, RADIUS_MAP } from '../../types';
import { Portal } from '../../utils/Portal';
import { Overlay } from '../../utils/Overlay';
import { FocusTrap } from '../../utils/FocusTrap';

export default function ApolloModal(props: ModalProps): React.ReactElement | null {
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

  // Trigger open callbacks
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

  // Compute placement styles
  const getPlacementStyles = (): React.CSSProperties => {
    switch (placement) {
      case 'top':
        return { alignItems: 'flex-start', paddingTop: '10vh' };
      case 'bottom':
        return { alignItems: 'flex-end', paddingBottom: '10vh' };
      case 'center':
      default:
        return { alignItems: 'center' };
    }
  };

  // Modal container styles
  const modalContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '20px',
    boxSizing: 'border-box',
    ...getPlacementStyles(),
  };

  // Modal content styles
  const modalStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md,
    maxWidth: fullScreen ? '100vw' : '90vw',
    maxHeight: fullScreen ? '100vh' : MAX_HEIGHT_MAP[size] || MAX_HEIGHT_MAP.md,
    backgroundColor: '#ffffff',
    borderRadius: fullScreen ? '0' : RADIUS_MAP[radius] || RADIUS_MAP.lg,
    boxShadow: shadow ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
    overflow: 'hidden',
    cursor: 'default',
    transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)',
    opacity: open ? 1 : 0,
    transition: disableAnimation
      ? 'none'
      : 'transform 0.2s ease-out, opacity 0.2s ease-out',
    ...style,
  };

  // Header styles
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    borderBottom: divider ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    flexShrink: 0,
  };

  // Title styles
  const titleStyle: React.CSSProperties = {
    flex: 1,
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.4,
  };

  // Body styles
  const bodyStyle: React.CSSProperties = {
    flex: 1,
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    overflowY: 'auto',
    overflowX: 'hidden',
    fontSize: '14px',
    lineHeight: 1.6,
  };

  // Footer styles
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: PADDING_MAP[padding] || PADDING_MAP.lg,
    borderTop: divider ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    flexShrink: 0,
  };

  // Close button styles
  const closeButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    margin: 0,
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'rgba(0, 0, 0, 0.45)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
  };

  // Don't render if not open
  if (!open) return null;

  return (
    <Portal>
      <Overlay
        visible={open && showBackdrop}
        onClick={handleBackdropClick}
        clickable={closeOnBackdropClick}
        blur={blurBackdrop}
        zIndex={zIndex}
        disableAnimation={disableAnimation}
      >
        <div style={modalContainerStyle}>
          <FocusTrap active={open} autoFocus restoreFocus>
            <div
              className={`rottay-modal rottay-modal--apollo rottay-modal--${size} ${className}`}
              style={modalStyle}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || header || closable) && (
                <div style={headerStyle}>
                  <div style={titleStyle}>
                    {header || (
                      title && <span id="modal-title">{title}</span>
                    )}
                  </div>
                  {closable && (
                    <button
                      type="button"
                      style={closeButtonStyle}
                      onClick={onClose}
                      aria-label="Close modal"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.color = 'rgba(0, 0, 0, 0.88)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)';
                      }}
                    >
                      <svg
                        width={18}
                        height={18}
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
                  )}
                </div>
              )}

              {/* Body */}
              <div style={bodyStyle}>
                {description && (
                  <p id="modal-description" style={{ marginTop: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                    {description}
                  </p>
                )}
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div style={footerStyle}>
                  {footer}
                </div>
              )}
            </div>
          </FocusTrap>
        </div>
      </Overlay>
    </Portal>
  );
}

ApolloModal.displayName = 'ApolloModal';
