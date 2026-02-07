import React from 'react';
import { createPreset } from '../../../factory';
import type { BadgeShowcaseProps } from '../../core';

export const ListPreset = createPreset<BadgeShowcaseProps>((context) => {
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
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden',
        }}
      >
        {badges.map((badge, index) => {
          const rarityColor = getRarityColor(badge.rarity);
          return (
            <Box
              key={badge.key}
              style={{
                padding: tokens.spacing[4],
                borderBottom:
                  index < badges.length - 1
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[4],
                opacity: badge.earned ? 1 : 0.5,
                filter: badge.earned ? 'none' : 'grayscale(100%)',
              }}
            >
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: tokens.borderRadius.full,
                  border: `2px solid ${rarityColor}`,
                  backgroundColor: tokens.colors.common.white,
                  fontSize: '24px',
                  flexShrink: 0,
                }}
              >
                {badge.icon || '🏆'}
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                                   style={{
                    fontWeight: tokens.typography.fontWeight.semibold,
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {badge.name}
                </Text>
                {badge.description && (
                  <Text
                                       style={{
                      color: tokens.colors.neutral[700],
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    {badge.description}
                  </Text>
                )}
              </Box>

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: tokens.spacing[1],
                  flexShrink: 0,
                }}
              >
                {badge.rarity && (
                  <Text
                                       style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: rarityColor,
                      textTransform: 'uppercase',
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {badge.rarity}
                  </Text>
                )}
                {badge.earned ? (
                  badge.earnedDate ? (
                    <Text
                                           style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                      }}
                    >
                      Earned {badge.earnedDate}
                    </Text>
                  ) : (
                    <Text
                                           style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.successScale[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      ✓ Earned
                    </Text>
                  )
                ) : (
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

ListPreset.displayName = 'BadgeShowcaseListPreset';
