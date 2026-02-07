import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { LeaderboardProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Avatar = createPreset<LeaderboardProps>((context: PresetContext<LeaderboardProps>) => {
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
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], minWidth: '24px' }}>
                {rank}
              </Text>

              {entry.avatar ? (
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[200],
                    backgroundImage: `url(${entry.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    color: tokens.colors.primaryScale[700],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                  }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </Box>
              )}

              <Box style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                  {entry.name}
                </Text>
              </Box>

              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                {entry.value}{unit}
              </Text>
            </Box>

            <Box style={{ paddingLeft: '68px' }}>
              <Box
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: tokens.colors.neutral[200],
                  borderRadius: tokens.borderRadius.full,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: tokens.colors.primaryScale[500],
                    borderRadius: tokens.borderRadius.full,
                    transition: `width ${tokens.motion.hover}`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});
