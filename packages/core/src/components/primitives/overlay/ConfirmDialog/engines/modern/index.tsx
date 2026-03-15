/**
 * @fileoverview ConfirmDialog Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the ConfirmDialog component.
 *
 * @module ModernConfirmDialog
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { ConfirmDialogProps } from '../../types';
import { CONFIRM_DIALOG_DEFAULTS, VARIANT_COLORS } from '../../types';

const VARIANT_BTN_CLASS: Record<string, string> = {
  info: 'btn-primary',
  warning: 'btn-warning',
  danger: 'btn-error',
};

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

  const colors = VARIANT_COLORS[variant];
  const displayIcon = icon || VARIANT_ICON_MAP[variant];
  const btnClass = VARIANT_BTN_CLASS[variant];

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  // Prevent body scroll when open
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
      className={`modal modal-open ${className}`}
      style={style}
      data-testid={dataTestId}
    >
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-box max-w-sm">
        <div className="flex gap-3">
          {displayIcon && (
            <div className="flex-shrink-0 mt-0.5" style={{ color: colors.icon }}>
              {displayIcon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="font-bold text-lg mb-2">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-base-content/70">{description}</p>
            )}
          </div>
        </div>
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${btnClass} ${loading ? 'loading' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ModernConfirmDialog.displayName = 'ModernConfirmDialog';
