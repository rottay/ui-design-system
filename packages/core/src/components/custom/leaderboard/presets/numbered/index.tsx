import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { LeaderboardProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Numbered = createPreset<LeaderboardProps>((context: PresetContext<LeaderboardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { entries, title, maxEntries = 10, unit, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  const displayEntries = entries.slice(0, maxEntries);

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return {
        backgroundColor: tokens.colors.warningScale[500],
        color: tokens.colors.common.white,
      };
    } else if (rank === 2) {
      return {
        backgroundColor: tokens.colors.neutral[400],
        color: tokens.colors.common.white,
      };
    } else if (rank === 3) {
      return {
        backgroundColor: tokens.colors.warningScale[700],
        color: tokens.colors.common.white,
      };
    }
    return {
      backgroundColor: tokens.colors.neutral[100],
      color: tokens.colors.neutral[700],
    };
  };

  return (
    <Box style={cardStyle} className={className}>
      {title && (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      {displayEntries.map((entry, index) => {
        const rank = entry.rank ?? index + 1;
        const rankStyles = getRankStyle(rank);

        return (
          <Box
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: tokens.spacing[4],
              borderBottom: index < displayEntries.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
            }}
          >
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                ...rankStyles,
              }}
            >
              {rank}
            </Box>

            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                {entry.name}
              </Text>
            </Box>

            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
              {entry.value}{unit}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
});
