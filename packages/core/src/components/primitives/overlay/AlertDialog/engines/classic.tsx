/**
 * @fileoverview Classic (Ant Design) engine for the AlertDialog overlay component.
 * Wraps Ant Design's Modal to present destructive-action confirmations with a
 * warning icon, title/description content area, and a cancel + custom action footer.
 *
 * @example
 * ```tsx
 * <ClassicAlertDialog
 *   open={showAlert}
 *   onOpenChange={setShowAlert}
 *   title="Delete account?"
 *   description="This action is irreversible."
 *   action={<Button danger onClick={handleDelete}>Delete</Button>}
 * />
 * ```
 */

'use client';

import React, { useCallback } from 'react';
import { Modal as AntModal, Button as AntButton } from 'antd';
import type { AlertDialogProps } from '../AlertDialog.types';
import { ALERT_DIALOG_DEFAULTS } from '../AlertDialog.types';

/**
 * AlertDialog implementation backed by Ant Design's Modal primitive.
 *
 * Delegates backdrop behaviour, keyboard dismissal, and centering to AntModal,
 * while providing a fixed-width (420px) dialog with an inline SVG warning icon
 * and a right-aligned action footer.
 *
 * @param props - {@link AlertDialogProps} shared across all engines.
 * @returns A centered modal dialog element.
 */
export default function ClassicAlertDialog(props: AlertDialogProps): React.ReactElement {
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

  // Memoised handler to avoid re-creating closures on every render
  const handleCancel = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  return (
    <AntModal
      open={open}
      onCancel={handleCancel}
      closable={false}
      centered
      width={420}
      maskClosable={closeOnBackdropClick}
      keyboard={true}
      className={`rottay-alert-dialog-classic ${className}`}
      style={style}
      footer={
        // Footer uses flexbox end-alignment so the action button sits rightmost
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }} data-testid="alert-dialog-actions">
          <AntButton onClick={handleCancel}>
            {cancelLabel}
          </AntButton>
          {action}
        </div>
      }
    >
      <div data-testid={dataTestId}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* Circular error-tinted icon container with inset ring for depth */}
          <div
            style={{
              flexShrink: 0,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--ds-color-error-50, #fff2f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-error-500, #ff4d4f)',
              boxShadow: 'inset 0 0 0 1px var(--ds-color-alpha-white-20, rgba(255, 255, 255, 0.2))',
            }}
          >
            {/* Inline SVG warning triangle - avoids icon library dependency */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            {title && (
              <div style={{ fontSize: 'var(--ds-modal-title-font-size, 16px)', fontWeight: 'var(--ds-modal-title-font-weight, 600)', marginBottom: '8px', color: 'var(--ds-modal-title-color, var(--ds-color-text-primary, #1a1a1a))' }}>
                {title}
              </div>
            )}
            {description && (
              <div style={{ fontSize: '14px', color: 'var(--ds-modal-subtitle-color, var(--ds-color-text-secondary, #666))', lineHeight: 1.5 }}>
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    </AntModal>
  );
}

ClassicAlertDialog.displayName = 'ClassicAlertDialog';
