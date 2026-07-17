/**
 * @fileoverview Classic (Ant Design) engine for the ConfirmDialog overlay component.
 * Wraps Ant Design's Modal to present variant-aware confirmation prompts (info,
 * warning, danger) with matching icons, coloured action buttons, and a loading state.
 *
 * @example
 * ```tsx
 * <ClassicConfirmDialog
 *   open={show}
 *   title="Discard changes?"
 *   variant="warning"
 *   onConfirm={discard}
 *   onCancel={close}
 * />
 * ```
 */

'use client';

import React, { useCallback } from 'react';
import { Modal as AntModal, Button as AntButton } from 'antd';
import type { ConfirmDialogProps } from '../../contracts';
import { CONFIRM_DIALOG_DEFAULTS, VARIANT_COLORS } from '../../contracts';

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
 * ConfirmDialog implementation backed by Ant Design's Modal primitive.
 *
 * The variant prop drives visual differentiation: icon colour, background tint,
 * and confirm-button styling are all derived from the shared VARIANT_COLORS map.
 * For the `danger` variant, Ant Design's native `danger` button prop is used
 * instead of manual colour overrides to preserve hover/focus states.
 *
 * @param props - {@link ConfirmDialogProps} shared across all engines.
 * @returns A centred Ant Design Modal element.
 */
export default function ClassicConfirmDialog(props: ConfirmDialogProps): React.ReactElement {
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

  return (
    <AntModal
      open={open}
      onCancel={onCancel}
      closable={false}
      centered
      width={420}
      className={`rottay-confirm-dialog-classic ${className}`}
      style={style}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <AntButton onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </AntButton>
          {/* For danger variant, rely on Ant's built-in danger styling;
              for info/warning, apply variant colour as inline override */}
          <AntButton
            type="primary"
            danger={variant === 'danger'}
            loading={loading}
            onClick={handleConfirm}
            style={variant !== 'danger' ? { backgroundColor: colors.button, borderColor: colors.button } : undefined}
          >
            {confirmLabel}
          </AntButton>
        </div>
      }
    >
      <div style={{ display: 'flex', gap: '12px' }} data-testid={dataTestId}>
        {/* Pill-shaped icon badge tinted per variant */}
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
            }}
          >
            {displayIcon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          {title && (
            <div style={{ fontSize: 'var(--ds-modal-title-font-size, 18px)', fontWeight: 'var(--ds-modal-title-font-weight, 600)', marginBottom: '8px', color: 'var(--ds-modal-title-color, var(--ds-color-text-primary, #1a1a1a))' }}>
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
    </AntModal>
  );
}

ClassicConfirmDialog.displayName = 'ClassicConfirmDialog';
