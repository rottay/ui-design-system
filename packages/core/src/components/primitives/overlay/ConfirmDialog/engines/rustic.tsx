/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the ConfirmDialog overlay component.
 * Renders a variant-aware confirmation modal using only inline styles and DS CSS
 * custom properties, with full ARIA support and manual scroll/keyboard management.
 *
 * @example
 * ```tsx
 * <RusticConfirmDialog
 *   open={show}
 *   title="Remove team member?"
 *   variant="danger"
 *   onConfirm={remove}
 *   onCancel={close}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { ConfirmDialogProps } from '../ConfirmDialog.types';
import { CONFIRM_DIALOG_DEFAULTS, VARIANT_COLORS } from '../ConfirmDialog.types';

/** Maps each variant to an inline SVG so the component stays icon-library-free. */
const VARIANT_ICON_MAP: Record<string, React.ReactNode> = {
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  danger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

/**
 * ConfirmDialog implementation using pure inline CSS and DS token variables.
 *
 * This engine handles its own Escape-key dismissal and scroll lock. The confirm
 * button colour, icon tint, and icon background are all driven by the VARIANT_COLORS
 * map so each variant (info, warning, danger) receives consistent visual treatment.
 * A CSS `@keyframes spin` animation is assumed to exist for the loading spinner SVG.
 *
 * @param props - {@link ConfirmDialogProps} shared across all engines.
 * @returns A self-contained modal element, or an empty fragment when closed.
 */
export default function RusticConfirmDialog(props: ConfirmDialogProps): React.ReactElement {
  const {
    open,
    title,
    description,
    confirmLabel = CONFIRM_DIALOG_DEFAULTS.confirmLabel,
    cancelLabel = CONFIRM_DIALOG_DEFAULTS.cancelLabel,
    onConfirm,
    onCancel,
    variant = CONFIRM_DIALOG_DEFAULTS.variant,
    icon,
    loading = CONFIRM_DIALOG_DEFAULTS.loading,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  const colors = VARIANT_COLORS[variant];
  // Allow consumers to override the default variant icon
  const displayIcon = icon || VARIANT_ICON_MAP[variant];

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  // Escape key triggers cancel -- memoised to keep effect deps stable
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel?.();
    }
  }, [onCancel]);

  // Register keyboard listener and lock body scroll while the dialog is open
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return <></>;

  // --- Style objects use DS token cascade: component -> semantic -> primitive ---

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--ds-overlay-bg, var(--ds-modal-overlay-bg, var(--ds-color-alpha-black-50, rgba(0, 0, 0, 0.5))))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'var(--ds-font-family-base)',
    padding: 'var(--ds-space-4, 1rem)',
  };

  // Card-like dialog container -- backdrop blur adds frosted-glass depth
  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'var(--ds-modal-bg, var(--ds-color-bg-elevated, #fff))',
    color: 'var(--ds-modal-color, var(--ds-color-text-primary, #1a1a1a))',
    borderRadius: 'var(--ds-modal-radius, var(--ds-radius-xl, 16px))',
    padding: '24px',
    maxWidth: '420px',
    width: '90vw',
    border: '1px solid var(--ds-modal-border, var(--ds-color-neutral-200, #e5e7eb))',
    boxShadow: 'var(--ds-modal-shadow, var(--ds-shadow-2xl))',
    backdropFilter: 'var(--ds-modal-overlay-backdrop, blur(4px))',
    ...style,
  };

  // Shared base for both cancel and confirm buttons; cursor changes when loading
  const buttonBaseStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--ds-radius-md, 6px)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'transform var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease), opacity var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease), box-shadow var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease)',
  };

  return (
    <div
      className={`rottay-confirm-dialog-rustic ${className}`}
      style={backdropStyle}
      onClick={onCancel}
      data-testid={dataTestId}
    >
      {/* stopPropagation prevents clicks inside the card from dismissing via onCancel */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          {displayIcon && (
            <div
              style={{
                color: colors.icon,
                backgroundColor: colors.bg,
                flexShrink: 0,
                marginTop: '2px',
                width: '44px',
                height: '44px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px var(--ds-color-alpha-white-20, rgba(255, 255, 255, 0.2))',
              }}
            >
              {displayIcon}
            </div>
          )}
          <div style={{ flex: 1 }}>
            {title && (
              <div
                id="confirm-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--ds-modal-title-color, var(--ds-color-text-primary, #1a1a1a))',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                id="confirm-desc"
                style={{
                  fontSize: '14px',
                  color: 'var(--ds-modal-subtitle-color, var(--ds-color-text-secondary, #666))',
                  lineHeight: 1.5,
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button
            type="button"
            style={{
              ...buttonBaseStyle,
              backgroundColor: 'var(--ds-color-bg-primary, transparent)',
              color: 'var(--ds-modal-color, var(--ds-color-text-primary, #1a1a1a))',
              border: '1px solid var(--ds-modal-footer-border, var(--ds-color-neutral-300, #d9d9d9))',
            }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            style={{
              ...buttonBaseStyle,
              backgroundColor: colors.button,
              color: 'var(--ds-color-primary-foreground, #fff)',
              opacity: loading ? 0.7 : 1,
              boxShadow: 'var(--ds-button-primary-shadow, var(--ds-shadow-sm))',
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', animation: 'spin 1s linear infinite' }}
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="30 10" fill="none" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

RusticConfirmDialog.displayName = 'RusticConfirmDialog';
