/**
 * @fileoverview Modal Modern (Hermes) Engine - Rottay Design System.
 * Premium overlay modal using the native HTML <dialog> element for built-in
 * top-layer stacking and browser focus trapping. Features backdrop blur,
 * scale+opacity entrance animation, scrollbar-width compensation, and
 * polished header/body/footer sections with DS token-driven styling.
 *
 * Wave 2B: Unified overlay family visual language -- shared backdrop, surface,
 * border, and motion tokens with Drawer and Sheet modern engines.
 *
 * Wave 4: Adaptive fullscreen on mobile -- modals automatically expand to
 * fill the viewport on screens < 640px for a native app-like experience.
 * Controlled via the `adaptiveFullscreen` prop (default: true).
 *
 * @module Modal/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import type { ModalProps } from '../Modal.types';
import { MODAL_DEFAULTS, SIZE_MAP, RADIUS_MAP, PADDING_MAP } from '../Modal.types';
import { Portal } from '../utils/Portal';
import { useTranslation } from '../../../../../i18n';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';

// ============================================================================
// Constants
// ============================================================================

/** Premium size widths that override the generic SIZE_MAP for this engine. */
const PREMIUM_SIZE_MAP: Record<string, string> = {
  xs: '360px',
  sm: '440px',
  md: '560px',
  lg: '720px',
  xl: '900px',
  '2xl': '960px',
  '3xl': '1120px',
  '4xl': '1280px',
  '5xl': '1440px',
  full: '95vw',
};

/** Shared overlay motion duration. */
const MOTION_DURATION = 'var(--ds-motion-normal, 250ms)';
const MOTION_EASING = 'var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))';

/** Keyframe animations injected via <style> tag -- no external stylesheet needed. */
const OVERLAY_MODAL_STYLES = `
@keyframes rottay-modal-backdrop-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes rottay-modal-enter {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
`;

/**
 * Calculate scrollbar width for body padding compensation.
 */
function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

// ============================================================================
// Close Button (shared visual)
// ============================================================================

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        borderRadius: 'var(--ds-radius-md)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: 'var(--ds-modal-close-color, var(--ds-color-text-secondary))',
        flexShrink: 0,
        transition: `background-color var(--ds-motion-fast, 150ms) ${MOTION_EASING}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          'var(--ds-modal-close-bg-hover, var(--ds-surface-highlight))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern engine implementation of Modal using the native <dialog> API.
 * Leverages showModal()/close() for built-in top-layer stacking and browser
 * focus trapping. Compensates for scrollbar layout shift.
 */
export default function ModernModal(props: ModalProps): React.ReactElement | null {
  const { t } = useTranslation('components');

  const { isMobile } = useBreakpoints();

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
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen,
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

  /** Whether the modal should render as fullscreen on the current viewport. */
  const isAdaptiveFullscreen = !fullScreen && adaptiveFullscreen && isMobile;

  const dialogRef = useRef<HTMLDialogElement>(null);

  // -- ESC key ----------------------------------------------------------------

  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && open) {
        e.preventDefault();
        onClose();
      }
    },
    [closeOnEscape, open, onClose],
  );

  // Sync native <dialog> open state with controlled `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open && closeOnEscape) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [open, closeOnEscape, handleEscKey]);

  // -- scroll lock with scrollbar compensation --------------------------------

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

  // -- backdrop click ---------------------------------------------------------

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && closable !== false) {
      onClose();
    }
  };

  const handleDialogClose = () => {
    if (open) onClose();
  };

  // -- derived values ---------------------------------------------------------

  /** Whether the panel should behave as fullscreen (explicit or adaptive). */
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  const panelWidth = effectiveFullscreen
    ? '100vw'
    : PREMIUM_SIZE_MAP[size] || SIZE_MAP[size] || PREMIUM_SIZE_MAP.md;

  const panelRadius = effectiveFullscreen
    ? '0'
    : RADIUS_MAP[radius] || 'var(--ds-radius-lg)';

  const contentPadding = PADDING_MAP[padding] || PADDING_MAP.lg;

  // Don't render if not open
  if (!open) return null;

  return (
    <Portal>
      {/* Injected keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: OVERLAY_MODAL_STYLES }} />

      <dialog
        ref={dialogRef}
        className={`rottay-modal rottay-modal--modern ${className}`}
        aria-modal="true"
        style={{
          /* Reset native dialog styling */
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          padding: 0,
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: isAdaptiveFullscreen
            ? 'stretch'
            : placement === 'top' ? 'flex-start' : placement === 'bottom' ? 'flex-end' : 'center',
          justifyContent: isAdaptiveFullscreen ? 'stretch' : 'center',
          paddingTop: isAdaptiveFullscreen ? undefined : placement === 'top' ? '10vh' : undefined,
          paddingBottom: isAdaptiveFullscreen ? undefined : placement === 'bottom' ? '10vh' : undefined,
          zIndex,
        }}
        onClick={handleBackdropClick}
        onClose={handleDialogClose}
      >
        {/* ---- Backdrop ---- */}
        {showBackdrop && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--ds-modal-overlay-bg, color-mix(in srgb, var(--ds-color-bg-primary) 80%, transparent))',
              backdropFilter: blurBackdrop !== false ? 'var(--ds-modal-overlay-backdrop, blur(4px))' : undefined,
              WebkitBackdropFilter: blurBackdrop !== false ? 'var(--ds-modal-overlay-backdrop, blur(4px))' : undefined,
              animation: `rottay-modal-backdrop-enter ${MOTION_DURATION} ${MOTION_EASING}`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ---- Panel ---- */}
        <div
          role="document"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: isAdaptiveFullscreen ? 'fixed' : 'relative',
            ...(isAdaptiveFullscreen ? { top: 0, left: 0 } : {}),
            width: panelWidth,
            height: isAdaptiveFullscreen ? '100dvh' : undefined,
            maxWidth: effectiveFullscreen ? 'none' : '90vw',
            maxHeight: effectiveFullscreen ? 'none' : '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--ds-modal-bg, var(--ds-surface-card))',
            color: 'var(--ds-modal-color, inherit)',
            border: effectiveFullscreen ? 'none' : '1px solid var(--ds-color-border-subtle)',
            borderRadius: panelRadius,
            boxShadow: isAdaptiveFullscreen ? 'none' : shadow ? 'var(--ds-modal-shadow, var(--ds-elevation-3))' : 'none',
            animation: isAdaptiveFullscreen ? undefined : `rottay-modal-enter ${MOTION_DURATION} ${MOTION_EASING}`,
            overflow: 'hidden',
            outline: 'none',
            ...style,
          }}
        >
          {/* ---- Header ---- */}
          {(title || description || header || closable) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 24px',
                borderBottom: divider
                  ? '1px solid var(--ds-modal-header-border, var(--ds-color-border-subtle))'
                  : '1px solid var(--ds-modal-header-border, var(--ds-color-border-subtle))',
                flexShrink: 0,
              }}
            >
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                {header || (
                  <>
                    {title && (
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                          color: 'var(--ds-modal-title-color, var(--ds-color-text-primary))',
                        }}
                      >
                        {title}
                      </div>
                    )}
                    {description && (
                      <div
                        style={{
                          fontSize: '13px',
                          lineHeight: '18px',
                          color: 'var(--ds-modal-subtitle-color, var(--ds-color-text-secondary))',
                          marginTop: title ? '2px' : undefined,
                        }}
                      >
                        {description}
                      </div>
                    )}
                  </>
                )}
              </div>
              {closable && (
                <CloseButton onClick={onClose} label={t('modal.close')} />
              )}
            </div>
          )}

          {/* ---- Body ---- */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: contentPadding,
              color: 'var(--ds-modal-body-color, inherit)',
            }}
          >
            {children}
          </div>

          {/* ---- Footer ---- */}
          {footer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '16px 24px',
                borderTop: '1px solid var(--ds-modal-footer-border, var(--ds-color-border-subtle))',
                flexShrink: 0,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </dialog>
    </Portal>
  );
}

ModernModal.displayName = 'ModernModal';
