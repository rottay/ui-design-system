'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { ConfirmationDialogProps } from '../../core';

export const destructivePreset = createPreset<ConfirmationDialogProps>((context: PresetContext<ConfirmationDialogProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Button, Input } = primitives;

  const {
    open,
    onOpenChange,
    title,
    description,
    icon,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    confirmText,
    confirmPlaceholder,
    loading,
    className,
    style,
  } = props;

  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
    setInputValue('');
  };

  const isConfirmDisabled = confirmText ? inputValue !== confirmText : false;

  if (!open) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={handleCancel}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: tokens.overlay?.medium,
        }}
      />

      {/* Dialog */}
      <Box
        className={className}
        style={{
          ...createSurfaceStyle(tokens, { elevation: 'xl' }),
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          margin: tokens.spacing[4],
          borderRadius: tokens.borderRadius.lg,
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* Icon + Title */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {icon && (
            <Box
              style={{
                width: '48px',
                height: '48px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.errorScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.errorScale[600],
                fontSize: tokens.typography.fontSize.xl,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          <Box style={{ flex: 1 }}>
            <Box
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                marginBottom: tokens.spacing[1],
              }}
            >
              {title}
            </Box>

            {description && (
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {description}
              </Box>
            )}
          </Box>
        </Box>

        {/* Confirmation Input */}
        {confirmText && (
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Input
              value={inputValue}
              onChange={(value) => setInputValue(value as string)}
              placeholder={confirmPlaceholder}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                fontSize: tokens.typography.fontSize.sm,
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.errorScale[300];
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
          </Box>
        )}

        {/* Actions */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              backgroundColor: tokens.colors.neutral[100],
              color: tokens.colors.neutral[700],
              transition: `all ${tokens.motion.hover}`,
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[200];
                e.currentTarget.style.transform = tokens.motion.transform;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
              e.currentTarget.style.transform = 'none';
            }}
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading || isConfirmDisabled}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: loading || isConfirmDisabled ? 'not-allowed' : 'pointer',
              border: 'none',
              backgroundColor: tokens.colors.errorScale[600],
              color: tokens.colors.common.white,
              transition: `all ${tokens.motion.hover}`,
              opacity: loading || isConfirmDisabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && !isConfirmDisabled) {
                e.currentTarget.style.backgroundColor = tokens.colors.errorScale[700];
                e.currentTarget.style.transform = tokens.motion.transform;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.errorScale[600];
              e.currentTarget.style.transform = 'none';
            }}
          >
            {loading ? 'Loading...' : confirmLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
