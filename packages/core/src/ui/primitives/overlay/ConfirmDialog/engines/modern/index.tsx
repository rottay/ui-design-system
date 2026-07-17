/**
 * @fileoverview Modern (Token-driven/Tailwind) engine for the ConfirmDialog overlay component.
 * Renders a confirmation modal using DS token inline styles, with variant-specific
 * button styling (DS token inline styles for primary / warning / error) and a built-in loading spinner.
 *
 * @example
 * ```tsx
 * <ModernConfirmDialog
 *   open={show}
 *   title="Archive project?"
 *   variant="info"
 *   onConfirm={archive}
 *   onCancel={close}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { ConfirmDialogProps } from '../../contracts';
import { CONFIRM_DIALOG_DEFAULTS } from '../../contracts';

/** Maps variant to DS token inline styles applied on the confirm button. */
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
 * ConfirmDialog implementation using DS token inline styles for modal and buttons.
 *
 * Body scroll is locked while the dialog is open. The confirm button receives
 * variant-specific DS token inline styles (e.g. error background for danger) and shows
 * a CSS spinner when `loading` is true. Backdrop click dismisses via `onCancel`.
 *
 * @param props - {@link ConfirmDialogProps} shared across all engines.
 * @returns A DS token-styled modal element, or an empty fragment when closed.
 */
export default function ModernConfirmDialog(props: ConfirmDialogProps): React.ReactElement {
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

  // Lock body scroll while the dialog is visible to prevent background interaction
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return <></>;

  return (
    <div
      data-part="backdrop"
      className={`rottay-confirm-dialog--modern ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Tokenized overlay stack (spec section 9): modal-tier blocking
        // dialog instead of a magic 50.
        zIndex: 'var(--ds-z-modal)',
        ...style,
      }}
      data-testid={dataTestId}
    >
      {/* Backdrop delegates dismiss to onCancel (always allowed, unlike AlertDialog) */}
      <div
        data-part="scrim"
        style={{ position: 'absolute', inset: 0 }}
        onClick={onCancel}
      />
      <div
        data-part="surface"
        data-open="true"
        data-variant={variant}
        style={{
          position: 'relative',
          maxWidth: 384,
          width: '100%',
          padding: 24,
        }}
      >
        <div className="flex gap-3">
          {displayIcon && (
            <div data-part="icon" className="flex-shrink-0 mt-0.5">
              {displayIcon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 data-part="title" className="font-bold text-lg mb-2">{title}</h3>
            )}
            {description && (
              <p data-part="description" className="text-sm">{description}</p>
            )}
          </div>
        </div>
        {/* Action buttons -- right-aligned flex container */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button
            type="button"
            data-part="action"
            data-action="cancel"
            onClick={onCancel}
            disabled={loading}
            style={{
              height: 36,
              padding: '0 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-part="action"
            data-action="confirm"
            data-loading={loading ? 'true' : 'false'}
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 16px',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {loading && (
              <span
                data-part="spinner"
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  animation: 'ds-spin var(--ds-motion-glacial) linear infinite',
                }}
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ModernConfirmDialog.displayName = 'ModernConfirmDialog';
