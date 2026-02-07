'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BannerAlertProps } from '../../core';

export const standardPreset = createPreset<BannerAlertProps>((context: PresetContext<BannerAlertProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Button } = primitives;

  const {
    type = 'info',
    title,
    description,
    icon,
    actions = [],
    dismissible = true,
    onDismiss,
    className,
    style,
  } = props;

  const [isDismissed, setIsDismissed] = useState(false);

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: tokens.colors.successScale[50],
          border: tokens.colors.successScale[500],
          icon: tokens.colors.successScale[600],
          iconBg: tokens.colors.successScale[100],
          text: tokens.colors.successScale[700],
        };
      case 'error':
        return {
          bg: tokens.colors.errorScale[50],
          border: tokens.colors.errorScale[500],
          icon: tokens.colors.errorScale[600],
          iconBg: tokens.colors.errorScale[100],
          text: tokens.colors.errorScale[700],
        };
      case 'warning':
        return {
          bg: tokens.colors.warningScale[50],
          border: tokens.colors.warningScale[500],
          icon: tokens.colors.warningScale[600],
          iconBg: tokens.colors.warningScale[100],
          text: tokens.colors.warningScale[700],
        };
      case 'info':
      default:
        return {
          bg: tokens.colors.infoScale[50],
          border: tokens.colors.infoScale[500],
          icon: tokens.colors.infoScale[600],
          iconBg: tokens.colors.infoScale[100],
          text: tokens.colors.infoScale[700],
        };
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) return null;

  const colors = getTypeColors();

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        width: '100%',
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        borderRadius: tokens.borderRadius.md,
        padding: tokens.spacing[4],
        display: 'flex',
        gap: tokens.spacing[3],
        alignItems: 'flex-start',
        ...style,
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          style={{
            width: '40px',
            height: '40px',
            borderRadius: tokens.borderRadius.full,
            backgroundColor: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.icon,
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <Box
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: colors.text,
              marginBottom: description ? tokens.spacing[1] : 0,
            }}
          >
            {title}
          </Box>
        )}

        {description && (
          <Box
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              lineHeight: '1.5',
            }}
          >
            {description}
          </Box>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              marginTop: tokens.spacing[3],
              flexWrap: 'wrap',
            }}
          >
            {actions.map((action) => (
              <Button
                key={action.key}
                onClick={action.onClick}
                style={{
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: colors.text,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Dismiss Button */}
      {dismissible && (
        <Button
          onClick={handleDismiss}
          style={{
            flexShrink: 0,
            width: '24px',
            height: '24px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            color: tokens.colors.neutral[400],
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tokens.colors.neutral[600];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = tokens.colors.neutral[400];
          }}
        >
          ×
        </Button>
      )}
    </Box>
  );
});
