import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { LeaderboardProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Bar = createPreset<LeaderboardProps>((context: PresetContext<LeaderboardProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { entries, title, maxEntries = 10, unit, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  const displayEntries = entries.slice(0, maxEntries);

  const maxValue = Math.max(...displayEntries.map(e => typeof e.value === 'number' ? e.value : 0));

  return (
    <Box style={cardStyle} className={className}>
      {title && (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      {displayEntries.map((entry, index) => {
        const rank = entry.rank ?? index + 1;
        const numValue = typeof entry.value === 'number' ? entry.value : 0;
        const percentage = maxValue > 0 ? (numValue / maxValue) * 100 : 0;

        return (
          <Box
            key={index}
            style={{
              padding: tokens.spacing[4],
              borderBottom: index < displayEntries.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], minWidth: '24px' }}>
                {rank}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], flex: 1 }}>
                {entry.name}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                {entry.value}{unit}
              </Text>
            </Box>

            <Box style={{ paddingLeft: '32px' }}>
              <Box
                style={{
                  width: `${percentage}%`,
                  height: '24px',
                  backgroundColor: rank <= 3 ? tokens.colors.primaryScale[500] : tokens.colors.primaryScale[300],
                  borderRadius: tokens.borderRadius.md,
                  transition: `width ${tokens.motion.hover}`,
                  minWidth: '2px',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});
