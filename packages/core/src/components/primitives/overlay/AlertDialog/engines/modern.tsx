/**
 * @fileoverview AlertDialog Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the AlertDialog component.
 *
 * @module ModernAlertDialog
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { AlertDialogProps } from '../AlertDialog.types';
import { ALERT_DIALOG_DEFAULTS } from '../AlertDialog.types';

export default function ModernAlertDialog(props: AlertDialogProps): React.ReactElement {
  const {
    open,
    onOpenChange,
    title,
    description,
    action,
    cancelLabel = ALERT_DIALOG_DEFAULTS.cancelLabel,
    closeOnBackdropClick = ALERT_DIALOG_DEFAULTS.closeOnBackdropClick,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  const handleCancel = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onOpenChange?.(false);
    }
  }, [closeOnBackdropClick, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return <></>;

  return (
    <div
      className={`modal modal-open ${className}`}
      style={style}
      data-testid={dataTestId}
    >
      <div className="modal-backdrop" onClick={handleBackdropClick} />
      <div
        className="modal-box max-w-sm"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
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
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          {action}
        </div>
      </div>
    </div>
  );
}

ModernAlertDialog.displayName = 'ModernAlertDialog';
