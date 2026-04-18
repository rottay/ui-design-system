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
import { MODAL_DEFAULTS } from '../Modal.types';

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

/** Keyframe + utility styles injected once. */
const MODAL_STYLES = `
@keyframes ds-modal-backdrop-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ds-modal-panel-enter {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
`;

// ============================================================================
// Component
// ============================================================================

export default function ModernModal(props: ModalProps): React.ReactElement {
  const {
    open,
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,
    title,
    children,
    footer,
    hideFooter,
    onClose,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    okText = 'OK',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    confirmLoading,
    className = '',
    style,
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);

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
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape, handleCancel]);

  // -- body scroll lock -------------------------------------------------------

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

  // -- focus trap (return focus to panel on open) -----------------------------

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  // -- early return -----------------------------------------------------------

  if (!open) return <></>;

  const maxWidth = SIZE_WIDTH_MAP[size as ModalSize] || SIZE_WIDTH_MAP.md;

  // -- render -----------------------------------------------------------------

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MODAL_STYLES }} />

      {/* Fullscreen backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: centered ? 'center' : 'flex-start',
          justifyContent: 'center',
          paddingTop: centered ? undefined : '10vh',
        }}
      >
        {/* Overlay */}
        <div
          onClick={closeOnOverlayClick ? handleCancel : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--ds-modal-overlay-bg, var(--ds-surface-overlay))',
            backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(8px))',
            WebkitBackdropFilter: 'var(--ds-modal-overlay-backdrop, blur(8px))',
            animation: 'ds-modal-backdrop-fade var(--ds-motion-normal) var(--ds-motion-ease-out)',
          }}
        />

        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          className={className}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            margin: '16px',
            backgroundColor: 'var(--ds-modal-bg, var(--ds-surface-card))',
            border: '1px solid var(--ds-color-border)',
            borderRadius: 'var(--ds-radius-xl)',
            boxShadow: 'var(--ds-modal-shadow, var(--ds-elevation-5))',
            animation: 'ds-modal-panel-enter var(--ds-motion-normal) var(--ds-motion-ease-out)',
            outline: 'none',
            overflow: 'hidden',
            ...style,
          }}
        >
          {/* ---- Header ---- */}
          {(title || closable) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--ds-modal-header-border, var(--ds-color-border))',
                flexShrink: 0,
              }}
            >
              {title && (
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'var(--ds-modal-title-color, inherit)',
                  }}
                >
                  {title}
                </span>
              )}
              {!title && <span />}
              {closable && (
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Close"
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
                    color: 'var(--ds-modal-close-color, inherit)',
                    transition: 'background-color var(--ds-motion-fast) var(--ds-motion-ease-out)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--ds-modal-close-bg-hover, var(--ds-surface-highlight))';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
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
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: '24px',
              maxHeight: '70vh',
              color: 'var(--ds-modal-body-color, inherit)',
            }}
          >
            {children}
          </div>

          {/* ---- Footer ---- */}
          {!hideFooter && (footer || onOk || onCancel) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                padding: '16px 24px',
                borderTop: '1px solid var(--ds-modal-footer-border, var(--ds-color-border))',
                flexShrink: 0,
              }}
            >
              {footer || (
                <>
                  {onCancel && (
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--ds-radius-md, 8px)',
                        border: '1px solid var(--ds-color-border)',
                        background: 'transparent',
                        color: 'var(--ds-color-text-primary)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 150ms ease-out',
                      }}
                      onClick={handleCancel}
                    >
                      {cancelText}
                    </button>
                  )}
                  {onOk && (
                    <button
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--ds-radius-md, 8px)',
                        border: '1px solid var(--ds-color-primary)',
                        background: 'var(--ds-color-primary)',
                        color: 'var(--ds-color-text-on-primary)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: confirmLoading ? 'wait' : 'pointer',
                        opacity: confirmLoading ? 0.7 : 1,
                        transition: 'opacity 150ms ease-out',
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
    </>
  );
}
