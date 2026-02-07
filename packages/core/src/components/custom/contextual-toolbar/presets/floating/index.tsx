import React from 'react';
import { createPreset } from '../../../factory';
import type { ContextualToolbarProps } from '../../core';

export const FloatingPreset = createPreset<ContextualToolbarProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { actions, visible = true, position, className, style } = props;

  if (!visible) return null;

  return (
    <Box
      className={className}
      style={{
        position: 'absolute',
        top: position?.top,
        left: position?.left,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: tokens.spacing[1],
        backgroundColor: tokens.colors.common.white,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        borderRadius: tokens.borderRadius.md,
        boxShadow: `0 4px 12px ${tokens.colors.neutral[300]}`,
        zIndex: 1000,
        ...style,
      }}
    >
      {actions.map((action) => (
        <React.Fragment key={action.key}>
          {action.divider ? (
            <Box
              style={{
                width: '1px',
                height: '24px',
                backgroundColor: tokens.colors.neutral[200],
              }}
            />
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              title={action.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[1],
                padding: tokens.spacing[2],
                border: 'none',
                backgroundColor: action.active
                  ? tokens.colors.primaryScale[100]
                  : 'transparent',
                color: action.active
                  ? tokens.colors.primaryScale[700]
                  : tokens.colors.neutral[700],
                borderRadius: tokens.borderRadius.sm,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                if (!action.active) {
                  e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                }
              }}
              onMouseLeave={(e) => {
                if (!action.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
});

FloatingPreset.displayName = 'ContextualToolbarFloatingPreset';
