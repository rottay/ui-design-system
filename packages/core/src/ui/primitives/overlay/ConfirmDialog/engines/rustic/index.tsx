/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the ConfirmDialog overlay component.
 * Renders a variant-aware confirmation modal using authored engine CSS, bounded runtime
 * layout values, and DS custom properties, with full ARIA support and manual scroll/keyboard management.
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
import type { ConfirmDialogProps } from '../../contracts';
import { CONFIRM_DIALOG_DEFAULTS } from '../../contracts';

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
 * button colour, icon tint, and icon background are all keyed on the surface's
 * `data-variant` stamp, so each variant (info, warning, danger) receives a
 * consistent visual treatment from the skin.
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'var(--ds-font-family-base)',
    padding: 'var(--ds-space-4, 1rem)',
  };

  // Card-like dialog container -- backdrop blur adds frosted-glass depth
  const dialogStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '420px',
    width: '90vw',
    ...style,
  };

  // Shared base for both cancel and confirm buttons; cursor changes when loading
  const buttonBaseStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    // The transition is inert: neither button has a hover/active state that
    // changes transform, opacity or box-shadow.
    transition: 'transform var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease), opacity var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease), box-shadow var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease)',
  };

  return (
    <div
      data-part="backdrop"
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
        data-part="surface"
        data-open="true"
        data-variant={variant}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          {displayIcon && (
            <div
              data-part="icon"
              style={{
                flexShrink: 0,
                marginTop: '2px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {displayIcon}
            </div>
          )}
          <div style={{ flex: 1 }}>
            {title && (
              <div
                id="confirm-title"
                data-part="title"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                id="confirm-desc"
                data-part="description"
                style={{
                  fontSize: '14px',
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
            data-part="action"
            data-action="cancel"
            style={buttonBaseStyle}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-part="action"
            data-action="confirm"
            data-loading={loading ? 'true' : 'false'}
            style={{
              ...buttonBaseStyle,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && (
              <svg
                data-part="spinner"
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
