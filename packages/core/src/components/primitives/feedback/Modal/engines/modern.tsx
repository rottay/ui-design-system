'use client';

/**
 * @fileoverview Modal Modern Engine - Rottay Design System
 * @description Premium modal overlay with layered backdrop blur, scale entrance
 * animation, and polished header/body/footer sections. Uses DS tokens for all
 * surfaces, elevation, motion, and radii.
 *
 * @remarks
 * **Size Variants:**
 * | Size | Max-Width |
 * |------|-----------|
 * | sm | 440px |
 * | md | 560px |
 * | lg | 720px |
 * | xl | 900px |
 * | 2xl | 960px |
 * | 3xl | 1120px |
 * | 4xl | 1280px |
 * | 5xl | 1440px |
 * | full | 95vw |
 *
 * @module Modal/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useCallback, useRef } from 'react';
import type { ModalProps, ModalSize } from '../Modal.types';
import { MODAL_DEFAULTS, PADDING_MAP } from '../Modal.types';
import { Portal } from '../../../overlay/Modal/utils/Portal';
import { useModalInertSiblings } from '../../../overlay/Modal/utils/useModalInertSiblings';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';

// ============================================================================
// Constants
// ============================================================================

/** Max-width in px per size variant. */
const SIZE_WIDTH_MAP: Record<ModalSize, string> = {
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

const RADIUS_MAP = {
  none: '0',
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
} as const;

function getPlacementStyles(
  placement: ModalProps['placement'],
  centered: boolean | undefined,
): Pick<React.CSSProperties, 'alignItems' | 'paddingTop' | 'paddingBottom'> {
  if (placement === 'top') {
    return { alignItems: 'flex-start', paddingTop: '10vh' };
  }

  if (placement === 'bottom') {
    return { alignItems: 'flex-end', paddingBottom: '10vh' };
  }

  return centered
    ? { alignItems: 'center' }
    : { alignItems: 'flex-start', paddingTop: '10vh' };
}

function getOverlayBackground(showBackdrop: boolean, overlayOpacity: number): string {
  if (!showBackdrop) return 'transparent';
  const clampedPercent = Math.min(Math.max(overlayOpacity, 0), 1) * 100;
  return `color-mix(in srgb, var(--ds-color-black) ${clampedPercent}%, transparent)`;
}

// ============================================================================
// Component
// ============================================================================

export default function ModernModal(props: ModalProps): React.ReactElement {
  const { isMobile } = useBreakpoints();

  const {
    open,
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,
    placement = 'center',
    fullScreen = false,
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen,
    zIndex,
    radius = MODAL_DEFAULTS.radius,
    shadow = MODAL_DEFAULTS.shadow,
    padding = MODAL_DEFAULTS.padding,
    title,
    description,
    header,
    children,
    footer,
    hideFooter,
    divider = MODAL_DEFAULTS.divider,
    onClose,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    preventScroll = MODAL_DEFAULTS.preventScroll,
    disableAnimation = MODAL_DEFAULTS.disableAnimation,
    showBackdrop = MODAL_DEFAULTS.showBackdrop,
    overlayOpacity = MODAL_DEFAULTS.overlayOpacity,
    blurBackdrop = MODAL_DEFAULTS.blurBackdrop,
    okText = 'OK',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    confirmLoading,
    className = '',
    style,
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = Boolean(open);
  const backdropClosable = closeOnBackdropClick ?? closeOnOverlayClick;
  const isAdaptiveFullscreen = !fullScreen && adaptiveFullscreen !== false && isMobile;
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  useModalInertSiblings(isOpen);

  // -- handlers ---------------------------------------------------------------

  const handleCancel = useCallback(() => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  }, [onClose, onCancel, onOpenChange]);

  const handleOk = () => {
    onOk?.();
  };

  // -- escape key -------------------------------------------------------------

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeOnEscape, handleCancel]);

  // -- body scroll lock -------------------------------------------------------

  useEffect(() => {
    if (isOpen && preventScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  // -- focus trap (return focus to panel on open) -----------------------------

  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // -- early return -----------------------------------------------------------

  if (!isOpen) return <></>;

  const maxWidth = effectiveFullscreen ? '100vw' : SIZE_WIDTH_MAP[size as ModalSize] || SIZE_WIDTH_MAP.md;
  const placementStyles: ReturnType<typeof getPlacementStyles> = isAdaptiveFullscreen
    ? { alignItems: 'stretch' as const }
    : getPlacementStyles(placement, centered);
  const sectionBorder = divider ? '1px solid var(--ds-modal-border-color, var(--ds-color-border))' : 'none';
  const contentPadding = PADDING_MAP[padding ?? 'lg'] ?? PADDING_MAP.lg;

  // -- render -----------------------------------------------------------------

  return (
    <Portal>
      {/* Fullscreen backdrop */}
      <div
        data-part="root"
        className="rottay-modal-root--modern"
        style={{
          position: 'fixed',
          inset: 0,
          // Tokenized overlay stack (spec section 9): an explicit numeric
          // override still wins; otherwise route through the z-index scale
          // instead of the old MODAL_DEFAULTS.zIndex magic number.
          zIndex: zIndex ?? 'var(--ds-z-modal)',
          display: 'flex',
          alignItems: placementStyles.alignItems,
          justifyContent: 'center',
          paddingTop: placementStyles.paddingTop,
          paddingBottom: placementStyles.paddingBottom,
        }}
      >
        {/* Overlay */}
        {showBackdrop ? (
          <div
            data-part="backdrop"
            onClick={backdropClosable ? handleCancel : undefined}
            style={{
              position: 'absolute',
              inset: 0,
              // Runtime scrim colour and the opt-in blur ride custom-property
              // hatches: both are computed per instance, so the skin cannot
              // enumerate them. An unset filter hatch resolves to the `none`
              // fallback, matching the omitted-key behavior of `blurBackdrop: false`.
              // Named `--ds-modal-scrim-*`, NOT `--ds-modal-overlay-bg`: that is a
              // live BrandTheme token (chrome.modal.overlayBg) which four
              // primitives/overlay components read, and an inline stamp of it here
              // would shadow a tenant's value.
              '--ds-modal-scrim-fill': getOverlayBackground(showBackdrop, overlayOpacity ?? MODAL_DEFAULTS.overlayOpacity ?? 0.45),
              '--ds-modal-scrim-filter': blurBackdrop ? 'var(--ds-modal-overlay-backdrop, blur(8px))' : undefined,
              animation: disableAnimation ? undefined : 'ds-modal-backdrop-fade-modern var(--ds-motion-normal) var(--ds-motion-ease-out)',
            } as React.CSSProperties}
          />
        ) : null}

        {/* Panel */}
        <div
          ref={panelRef}
          data-part="surface"
          data-open="true"
          data-fullscreen={effectiveFullscreen ? 'true' : 'false'}
          data-adaptive-fullscreen={isAdaptiveFullscreen ? 'true' : 'false'}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          className={className}
          style={{
            position: isAdaptiveFullscreen ? 'fixed' : 'relative',
            inset: isAdaptiveFullscreen ? 0 : undefined,
            width: effectiveFullscreen ? '100vw' : '100%',
            maxWidth,
            height: fullScreen ? '100vh' : undefined,
            maxHeight: fullScreen ? '100vh' : isAdaptiveFullscreen ? undefined : '85vh',
            display: 'flex',
            flexDirection: 'column',
            margin: effectiveFullscreen ? 0 : '16px',
            // Per-instance radius/elevation and the divider rule ride hatches the
            // skin consumes. `--ds-modal-section-border` is declared here, on the
            // surface, so the header and footer rules inherit one resolved value.
            '--ds-modal-surface-radius': effectiveFullscreen ? 0 : (RADIUS_MAP[radius ?? 'lg'] ?? RADIUS_MAP.lg),
            '--ds-modal-surface-shadow': shadow ? 'var(--ds-modal-shadow, var(--ds-elevation-5))' : 'none',
            '--ds-modal-section-border': sectionBorder,
            animation: disableAnimation || isAdaptiveFullscreen
              ? undefined
              : 'ds-modal-panel-enter-modern var(--ds-motion-normal) var(--ds-motion-ease-out)',
            overflow: 'hidden',
            ...style,
          } as React.CSSProperties}
        >
          {/* ---- Header ---- */}
          {(header || title || description || closable) && (
            <div
              data-part="header"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px 24px',
                flexShrink: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                {header ?? (
                  <>
                    {title && (
                      <span
                        data-part="title"
                        style={{
                          display: 'block',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                        }}
                      >
                        {title}
                      </span>
                    )}
                    {description && (
                      <div
                        data-part="description"
                        style={{
                          marginTop: title ? 4 : 0,
                          fontSize: 13,
                          lineHeight: '20px',
                        }}
                      >
                        {description}
                      </div>
                    )}
                  </>
                )}
              </div>
              {closable && (
                <button
                  type="button"
                  data-part="close-button"
                  onClick={handleCancel}
                  aria-label="Close"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    transition: 'background-color var(--ds-motion-fast) var(--ds-motion-ease-out)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* ---- Body ---- */}
          <div
            data-part="body"
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: contentPadding,
              maxHeight: effectiveFullscreen ? undefined : '70vh',
            }}
          >
            {children}
          </div>

          {/* ---- Footer ---- */}
          {!hideFooter && (footer || onOk || onCancel) && (
            <div
              data-part="footer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '16px 24px',
                flexShrink: 0,
              }}
            >
              {footer || (
                <>
                  {onCancel && (
                    <button
                      data-part="action"
                      data-action="cancel"
                      style={{
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background var(--ds-motion-fast) ease-out',
                      }}
                      onClick={handleCancel}
                    >
                      {cancelText}
                    </button>
                  )}
                  {onOk && (
                    <button
                      data-part="action"
                      data-action="ok"
                      style={{
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: confirmLoading ? 'wait' : 'pointer',
                        opacity: confirmLoading ? 0.7 : 1,
                        transition: 'opacity var(--ds-motion-fast) ease-out',
                      }}
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
    </Portal>
  );
}
