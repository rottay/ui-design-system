/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the AlertDialog overlay component.
 * Renders a self-contained modal using authored engine CSS, bounded runtime layout
 * values, and design-system custom properties -- no Ant Design or Tailwind dependency.
 *
 * @example
 * ```tsx
 * <RusticAlertDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Permanently delete?"
 *   description="This cannot be undone."
 *   action={<button onClick={onDelete}>Delete</button>}
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { AlertDialogProps } from '../AlertDialog.types';
import { ALERT_DIALOG_DEFAULTS } from '../AlertDialog.types';

/**
 * AlertDialog implementation using pure inline CSS and DS token variables.
 *
 * This engine is designed for environments where neither Ant Design nor Tailwind
 * are available (e.g. embedded widgets, SSR without CSS extraction). It provides
 * full ARIA attributes (`role="alertdialog"`, `aria-labelledby`, `aria-describedby`)
 * and manages scroll lock plus Escape-key dismissal manually.
 *
 * @param props - {@link AlertDialogProps} shared across all engines.
 * @returns A portal-free modal element, or an empty fragment when `open` is false.
 */
export default function RusticAlertDialog(props: AlertDialogProps): React.ReactElement {
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

  // Only dismiss on backdrop click when explicitly allowed
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onOpenChange?.(false);
    }
  }, [closeOnBackdropClick, onOpenChange]);

  // Keyboard dismissal and scroll lock -- cleaned up on close or unmount
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

  // --- Style objects defined inside render so they read latest props/state ---

  // Fixed full-screen overlay that centres the dialog box
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

  // Card-like dialog container -- consumer `style` prop merges at the end
  const dialogStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '420px',
    width: '90vw',
    ...style,
  };

  // Circular error badge housing the warning triangle SVG
  const iconContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Outlined cancel button; the transition is declared but never triggered (this
  // engine has no hover/active state that changes opacity or box-shadow).
  const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease), box-shadow var(--ds-personality-animation-entrance-duration, 220ms) var(--ds-input-transition-timing, ease)',
  };

  return (
    <div
      data-part="backdrop"
      className={`rottay-alert-dialog-rustic ${className}`}
      style={backdropStyle}
      onClick={handleBackdropClick}
      data-testid={dataTestId}
    >
      {/* stopPropagation prevents clicks inside the card from dismissing the dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
        data-part="surface"
        data-open="true"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div data-part="icon" style={iconContainerStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            {title && (
              <div
                id="alert-dialog-title"
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
                id="alert-dialog-desc"
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
        {/* Action footer -- cancel sits left of the consumer-provided action */}
        <div data-part="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button
            type="button"
            data-part="action"
            data-action="cancel"
            style={cancelButtonStyle}
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

RusticAlertDialog.displayName = 'RusticAlertDialog';
