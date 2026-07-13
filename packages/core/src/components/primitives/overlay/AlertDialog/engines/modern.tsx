/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the AlertDialog overlay component.
 * Renders a fully custom modal using DaisyUI's `modal` classes, managing its own
 * Escape-key listener, scroll lock, and backdrop click behaviour without Ant Design.
 *
 * @example
 * ```tsx
 * <ModernAlertDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Revoke access?"
 *   description="All sessions will be terminated."
 *   action={<Button variant="danger" onClick={revoke}>Revoke</Button>}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { AlertDialogProps } from '../AlertDialog.types';
import { ALERT_DIALOG_DEFAULTS } from '../AlertDialog.types';

/**
 * AlertDialog implementation using DaisyUI modal classes and Tailwind utilities.
 *
 * Unlike the Classic engine, this component owns its own lifecycle: it manually
 * locks body scroll, listens for Escape key presses, and conditionally renders
 * (returns empty fragment when closed) to avoid hidden DOM nodes.
 *
 * @param props - {@link AlertDialogProps} shared across all engines.
 * @returns A DaisyUI-styled modal element, or an empty fragment when `open` is false.
 */
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

  // Guard backdrop dismiss behind the closeOnBackdropClick prop
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onOpenChange?.(false);
    }
  }, [closeOnBackdropClick, onOpenChange]);

  // Manage keyboard dismissal and scroll lock manually since DaisyUI
  // modal classes are presentational-only and lack built-in behaviour
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

  // Early return avoids rendering hidden DOM when the dialog is closed
  if (!open) return <></>;

  return (
    <div
      data-part="root"
      className={`modal modal-open rottay-alert-dialog--modern ${className}`}
      style={style}
      data-testid={dataTestId}
    >
      <div
        data-part="backdrop"
        className="modal-backdrop"
        onClick={handleBackdropClick}
        style={{
          background: 'var(--ds-overlay-bg)',
        }}
      />
      <div
        data-part="surface"
        data-open="true"
        className="modal-box max-w-sm"
        role="alertdialog"
        aria-modal="true"
        style={{
          background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
          borderRadius: 'var(--ds-modal-radius, var(--ds-radius-lg))',
          padding: 'var(--ds-modal-padding, 1.5rem)',
        }}
      >
        <div className="flex gap-3 items-start">
          {/* Error-tinted circle with inline SVG warning triangle */}
          <div data-part="icon" className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)', color: 'var(--ds-color-error)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1">
            {title && (
              <h3 data-part="title" className="font-bold text-lg mb-2">{title}</h3>
            )}
            {description && (
              <p data-part="description" className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>{description}</p>
            )}
          </div>
        </div>
        {/* DaisyUI modal-action aligns buttons to the right by default */}
        <div data-part="footer" className="modal-action">
          <button
            type="button"
            data-part="action"
            data-action="cancel"
            style={{
              background: 'transparent',
              color: 'var(--ds-color-text-primary)',
              height: 'var(--ds-control-height-sm, 36px)',
              padding: '0 var(--ds-spacing-md, 16px)',
              fontSize: 'var(--ds-font-size-sm, 14px)',
              borderRadius: 'var(--ds-radius-md)',
              border: 'none',
              cursor: 'pointer',
            }}
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
