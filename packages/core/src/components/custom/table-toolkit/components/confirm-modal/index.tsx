'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { ConfirmActionModalProps } from '../../core';

export const ConfirmActionModal = createPreset<ConfirmActionModalProps>({
  name: 'TableToolkit.ConfirmActionModal',
  render: ({ primitives, props, tokens }: PresetContext<ConfirmActionModalProps>) => {
    const { Box } = primitives;
    const {
      open,
      onClose,
      onConfirm,
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false,
      loading = false,
      icon,
      className,
      style,
    } = props;

    if (!open) return <Box style={{ display: 'none' }} />;

    const confirmBg = destructive ? tokens.colors.errorScale[600] : tokens.colors.primary;
    const iconColor = destructive ? tokens.colors.errorScale[500] : tokens.colors.warningScale[500];

    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: tokens.overlay?.medium,
            zIndex: 999,
          }}
        />

        {/* Modal */}
        <Box
          className={className}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            width: 420,
            maxWidth: '90vw',
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.xl,
            boxShadow: tokens.shadows?.xl ?? '0 20px 60px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            ...style,
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacing[4],
            padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[3]}px`,
          }}>
            {icon && (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: destructive ? tokens.colors.errorScale[50] : tokens.colors.warningScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
                fontSize: tokens.typography.fontSize.xl,
                flexShrink: 0,
              }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[2],
              }}>
                {title}
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                lineHeight: 1.5,
              }}>
                {message}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.common.white,
                backgroundColor: confirmBg,
                border: 'none',
                borderRadius: tokens.borderRadius.md,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </Box>
      </>
    );
  },
});
