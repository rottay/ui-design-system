'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ColorPalettePickerProps } from '../../core';

export const CompactPreset = createPreset<ColorPalettePickerProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Select } = primitives;
  const { palettes, value, onChange, recentColors = [], className, style } = props;

  const [selectedPalette, setSelectedPalette] = useState(palettes[0]?.key || '');
  const [showMore, setShowMore] = useState(false);

  const currentPalette = palettes.find((p) => p.key === selectedPalette) || palettes[0];
  const displayColors = showMore ? currentPalette?.colors : currentPalette?.colors.slice(0, 8);

  return (
    <Box className={className} style={style}>
      <Box style={{
        boxShadow: tokens.shadows.sm, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
        {/* Palette Dropdown */}
        <Select
          value={selectedPalette}
          onChange={(value) => setSelectedPalette(value as string)}
          size="sm"
          style={{ minWidth: '120px' }}
        >
          {palettes.map((palette) => (
            <option key={palette.key} value={palette.key}>
              {palette.label}
            </option>
          ))}
        </Select>

        {/* Color Swatches */}
        <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap', flex: 1 }}>
          {recentColors.slice(0, 3).map((color, index) => (
            <Box
              key={`recent-${color}-${index}`}
              onClick={() => onChange?.(color)}
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: color,
                borderRadius: tokens.borderRadius.sm,
                border: `2px solid ${
                  value === color
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[300]
                }`,
                cursor: 'pointer',
              }}
            />
          ))}

          {displayColors?.map((color) => (
            <Box
              key={color}
              onClick={() => onChange?.(color)}
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: color,
                borderRadius: tokens.borderRadius.sm,
                border: `2px solid ${
                  value === color
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[300]
                }`,
                cursor: 'pointer',
              }}
            />
          ))}

          {!showMore && currentPalette && currentPalette.colors.length > 8 && (
            <Box
              onClick={() => setShowMore(true)}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.colors.neutral[100],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.sm,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}
            >
              +{currentPalette.colors.length - 8}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});

CompactPreset.displayName = 'ColorPalettePickerCompactPreset';
