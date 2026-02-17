'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BannerAlertProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const compactPreset = createPreset<BannerAlertProps>((context: PresetContext<BannerAlertProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Button } = primitives;

  const {
    type = 'info',
    title,
    description,
    icon,
    actions: rawActions = [],
    dismissible = true,
    onDismiss,
    className,
    style,
  } = props;

    const actions = Array.isArray(rawActions) ? rawActions : [];

  const [isDismissed, setIsDismissed] = useState(false);

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          border: tokens.colors.successScale[500],
          icon: tokens.colors.successScale[600],
          text: tokens.colors.successScale[700],
        };
      case 'error':
        return {
          border: tokens.colors.errorScale[500],
          icon: tokens.colors.errorScale[600],
          text: tokens.colors.errorScale[700],
        };
      case 'warning':
        return {
          border: tokens.colors.warningScale[500],
          icon: tokens.colors.warningScale[600],
          text: tokens.colors.warningScale[700],
        };
      case 'info':
      default:
        return {
          border: tokens.colors.infoScale[500],
          icon: tokens.colors.infoScale[600],
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
  const message = description || title;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        width: '100%',
        backgroundColor: tokens.colors.common.white,
        borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
        borderRadius: tokens.borderRadius.sm,
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        ...style,
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          style={{
            flexShrink: 0,
            color: colors.icon,
            fontSize: tokens.typography.fontSize.md,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
      )}

      {/* Message */}
      <Box
        style={{
          flex: 1,
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[700],
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {message}
      </Box>

      {/* Actions */}
      {actions.length > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexShrink: 0,
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={action.onClick}
              style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: colors.text,
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <Button
          onClick={handleDismiss}
          style={{
            flexShrink: 0,
            width: '20px',
            height: '20px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            color: tokens.colors.neutral[400],
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tokens.colors.neutral[600];
            e.currentTarget.style.transform = tokens.motion.transform;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = tokens.colors.neutral[400];
            e.currentTarget.style.transform = 'none';
          }}
        >
          ×
        </Button>
      )}
    </Box>
  );
});
