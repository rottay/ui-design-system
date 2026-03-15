/**
 * @fileoverview AlertDialog Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the AlertDialog component.
 *
 * @module RusticAlertDialog
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import type { AlertDialogProps } from '../../types';
import { ALERT_DIALOG_DEFAULTS } from '../../types';

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

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'var(--ds-font-family-base)',
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'var(--ds-color-bg-elevated, #fff)',
    borderRadius: 'var(--ds-radius-lg, 12px)',
    padding: '24px',
    maxWidth: '420px',
    width: '90vw',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--ds-color-error-50, #fff2f0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ds-color-error-500, #ff4d4f)',
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--ds-radius-md, 6px)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'var(--ds-color-text-primary, #1a1a1a)',
    border: '1px solid var(--ds-color-neutral-300, #d9d9d9)',
    transition: 'opacity 0.2s ease',
  };

  return (
    <div
      className={`rottay-alert-dialog-rustic ${className}`}
      style={backdropStyle}
      onClick={handleBackdropClick}
      data-testid={dataTestId}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={iconContainerStyle}>
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
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--ds-color-text-primary, #1a1a1a)',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                id="alert-dialog-desc"
                style={{
                  fontSize: '14px',
                  color: 'var(--ds-color-text-secondary, #666)',
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
