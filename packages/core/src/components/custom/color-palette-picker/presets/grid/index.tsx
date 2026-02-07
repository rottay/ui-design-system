'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ColorPalettePickerProps } from '../../core';

export const GridPreset = createPreset<ColorPalettePickerProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;
  const { palettes, value, onChange, recentColors = [], className, style } = props;

  const [selectedPalette, setSelectedPalette] = useState(palettes[0]?.key || '');

  const currentPalette = palettes.find((p) => p.key === selectedPalette) || palettes[0];

  return (
    <Box className={className} style={style}>
      {/* Palette Tabs */}
      <Box
        style={{
          boxShadow: tokens.shadows.sm,
          display: 'flex',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap',
        }}
      >
        {palettes.map((palette) => (
          <Button
            key={palette.key}
            variant={selectedPalette === palette.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedPalette(palette.key)}
            style={{ fontSize: tokens.typography.fontSize.sm }}
          >
            {palette.label}
          </Button>
        ))}
      </Box>

      {/* Color Grid */}
      {currentPalette && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[4],
          }}
        >
          {currentPalette.colors.map((color) => (
            <Box
              key={color}
              onClick={() => onChange?.(color)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: color,
                borderRadius: tokens.borderRadius.md,
                border: `2px solid ${
                  value === color
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[300]
                }`,
                cursor: 'pointer',
                position: 'relative',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {value === color && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    textShadow: `0 0 3px ${tokens.colors.neutral[900]}`,
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <Box>
          <Text
                       style={{
              fontWeight: tokens.typography.fontWeight.semibold,
              marginBottom: tokens.spacing[2],
              color: tokens.colors.neutral[700],
            }}
          >
            Recent Colors
          </Text>
          <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
            {recentColors.map((color, index) => (
              <Box
                key={`${color}-${index}`}
                onClick={() => onChange?.(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  borderRadius: tokens.borderRadius.sm,
                  border: `2px solid ${
                    value === color
                      ? tokens.colors.primaryScale[600]
                      : tokens.colors.neutral[300]
                  }`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
});

GridPreset.displayName = 'ColorPalettePickerGridPreset';
