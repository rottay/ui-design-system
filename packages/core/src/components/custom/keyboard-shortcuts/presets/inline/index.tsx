import React from 'react';
import { createPreset } from '../../../factory';
import type { KeyboardShortcutsProps } from '../../core';

export const InlinePreset = createPreset<KeyboardShortcutsProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { categories, className, style } = props;

  return (
    <Box className={className} style={style}>
      <Text

        style={{
          fontWeight: tokens.typography.fontWeight.bold,
          marginBottom: tokens.spacing[6],
        }}
      >
        Keyboard Shortcuts
      </Text>

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
  );
});

InlinePreset.displayName = 'KeyboardShortcutsInlinePreset';
