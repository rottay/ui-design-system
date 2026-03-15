import React from 'react';
import { createPreset } from '../../../factory';
import type { BadgeShowcaseProps } from '../../core';
import {
  createEmptyStateStyle,
} from '../../../helpers';

export const GridPreset = createPreset<BadgeShowcaseProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { badges, title, className, style } = props;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common':
        return tokens.colors.neutral[400];
      case 'rare':
        return tokens.colors.infoScale[500];
      case 'epic':
        return tokens.colors.primaryScale[500];
      case 'legendary':
        return tokens.colors.warningScale[500];
      default:
        return tokens.colors.neutral[400];
    }
  };

  return (
    <Box className={className} style={style}>
      {title && (
        <Text

          style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            marginBottom: tokens.spacing[6],
          }}
        >
          {title}
        </Text>
      )}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: tokens.spacing[6],
        }}
      >
        {badges.map((badge) => {
          const rarityColor = getRarityColor(badge.rarity);
          return (
            <Box
              key={badge.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: tokens.spacing[4],
                textAlign: 'center',
                opacity: badge.earned ? 1 : 0.4,
                filter: badge.earned ? 'none' : 'grayscale(100%)',
                transition: `all ${tokens.motion.hover}`,
              }}
              title={badge.description}
            >
              <Box
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: tokens.borderRadius.full,
                  border: `3px solid ${rarityColor}`,
                  backgroundColor: tokens.colors.common.white,
                  marginBottom: tokens.spacing[4],
                  fontSize: '32px',
                  boxShadow: badge.earned
                    ? `0 0 20px ${rarityColor}40`
                    : 'none',
                }}
              >
                {badge.icon || '🏆'}
              </Box>

              <Text
                               style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  marginBottom: tokens.spacing[1],
                  color: tokens.colors.neutral[900],
                }}
              >
                {badge.name}
              </Text>

              {badge.rarity && (
                <Text
                                   style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: rarityColor,
                    textTransform: 'uppercase',
                    fontWeight: tokens.typography.fontWeight.medium,
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {badge.rarity}
                </Text>
              )}

              {badge.earned && badge.earnedDate && (
                <Text
                                   style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  {badge.earnedDate}
                </Text>
              )}

              {!badge.earned && (
                <Text
                                   style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    fontStyle: 'italic',
                  }}
                >
                  Locked
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

GridPreset.displayName = 'BadgeShowcaseGridPreset';
