'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { KeyboardShortcutsProps } from '../../core';

export const ModalPreset = createPreset<KeyboardShortcutsProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { categories, open = false, onOpenChange, className, style } = props;

  if (!open) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${tokens.colors.neutral[900]}80`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: tokens.spacing[6],
      }}
      onClick={() => onOpenChange?.(false)}
    >
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          padding: tokens.spacing[8],
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[6],
          }}
        >
          <Text

            style={{ fontWeight: tokens.typography.fontWeight.bold }}
          >
            Keyboard Shortcuts
          </Text>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: tokens.typography.fontSize.xl,
              padding: tokens.spacing[1],
              color: tokens.colors.neutral[600],
            }}
          >
            ×
          </button>
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
          {categories.map((category) => (
            <Box key={category.key}>
              <Text

                style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  marginBottom: tokens.spacing[4],
                  color: tokens.colors.primaryScale[700],
                }}
              >
                {category.label}
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {category.shortcuts.map((shortcut) => (
                  <Box
                    key={shortcut.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: tokens.spacing[2],
                      backgroundColor: tokens.colors.neutral[50],
                      borderRadius: tokens.borderRadius.md,
                    }}
                  >
                    <Text
                                           style={{ color: tokens.colors.neutral[800] }}
                    >
                      {shortcut.description}
                    </Text>

                    <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {shortcut.keys.map((key, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <Text
                                                           style={{
                                color: tokens.colors.neutral[600],
                                padding: `0 ${tokens.spacing[1]}`,
                              }}
                            >
                              +
                            </Text>
                          )}
                          <Box
                            style={{
                              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                              backgroundColor: tokens.colors.common.white,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                              borderRadius: tokens.borderRadius.sm,
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              minWidth: '28px',
                              textAlign: 'center',
                              boxShadow: `0 1px 2px ${tokens.colors.neutral[200]}`,
                            }}
                          >
                            {key}
                          </Box>
                        </React.Fragment>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

ModalPreset.displayName = 'KeyboardShortcutsModalPreset';
