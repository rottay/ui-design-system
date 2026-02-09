'use client';

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { LeaderboardProps, LeaderboardEntry } from '../../core';
import {
  createCardStyle, createAccentBarStyle, createBadgeStyle,
  createPanelHeaderStyle, createListItemStyle, createHoverStyle, getHoverTransform,
} from '../../../helpers';

export const Numbered = createPreset<LeaderboardProps>((context: PresetContext<LeaderboardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Flex } = primitives;
  const { entries, title, maxEntries = 10, valueLabel, unit, className, style } = props;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, padding: 0, elevation: 'md' }),
    overflow: 'hidden' as const,
  }), [tokens, isGlass]);
  const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const headerStyle = useMemo(() => ({
    ...createPanelHeaderStyle(tokens),
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const,
  }), [tokens]);
  const countBadge = useMemo(() => createBadgeStyle(tokens, 'primary'), [tokens]);
  const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);
  const hoverLift = useMemo(() => getHoverTransform(tokens), [tokens]);

  const displayEntries = entries.slice(0, maxEntries);

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return {
      background: `linear-gradient(135deg, ${tokens.colors.warningScale[400]}, ${tokens.colors.warningScale[600]})`,
      color: tokens.colors.common.white,
      boxShadow: `0 2px 8px ${tokens.colors.warningScale[300]}`,
    };
    if (rank === 2) return {
      background: `linear-gradient(135deg, ${tokens.colors.neutral[300]}, ${tokens.colors.neutral[500]})`,
      color: tokens.colors.common.white,
      boxShadow: `0 2px 6px ${tokens.colors.neutral[300]}`,
    };
    if (rank === 3) return {
      background: `linear-gradient(135deg, ${tokens.colors.warningScale[600]}, ${tokens.colors.warningScale[800]})`,
      color: tokens.colors.common.white,
      boxShadow: `0 2px 6px ${tokens.colors.warningScale[400]}`,
    };
    return {
      background: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
      boxShadow: 'none',
    };
  };

  const getAvatarColor = (name: string) => {
    const scales = [
      tokens.colors.primaryScale, tokens.colors.secondaryScale, tokens.colors.successScale,
      tokens.colors.warningScale, tokens.colors.infoScale, tokens.colors.errorScale,
    ];
    return scales[(name.charCodeAt(0) || 0) % scales.length];
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const getTrendArrow = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return { symbol: '\u2191', color: tokens.colors.successScale[600] };
    if (trend === 'down') return { symbol: '\u2193', color: tokens.colors.errorScale[600] };
    return { symbol: '\u2192', color: tokens.colors.neutral[400] };
  };

  return (
    <Box style={containerStyle} className={className}>
      <Box style={accentBar} />
      {title && (
        <Box style={headerStyle}>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[800],
          }}>
            {title}
          </Text>
          <Flex gap={8} align="center">
            {valueLabel && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
                {valueLabel}
              </Text>
            )}
            <Box style={countBadge}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{displayEntries.length}</Text>
            </Box>
          </Flex>
        </Box>
      )}

      <Box style={{ padding: 0 }}>
        {displayEntries.map((entry: LeaderboardEntry, index: number) => {
          const rank = entry.rank ?? index + 1;
          const isTop3 = rank <= 3;
          const isHovered = hoveredIndex === index;
          const rankBadge = getRankBadgeStyle(rank);
          const avatarScale = getAvatarColor(entry.name);
          const trendInfo = getTrendArrow(entry.trend);

          return (
            <Box
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                ...createListItemStyle(tokens, { interactive: true }),
                ...hoverBase,
                display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                backgroundColor: isHovered
                  ? tokens.colors.primaryScale[50]
                  : (isTop3 ? tokens.colors.neutral[50] : 'transparent'),
                ...(isHovered ? hoverLift : {}),
              }}
            >
              <Box style={{
                width: tokens.spacing[8], height: tokens.spacing[8],
                borderRadius: tokens.borderRadius.full,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isTop3 ? tokens.typography.fontSize.sm : tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0,
                ...rankBadge,
              }}>
                {rank}
              </Box>

              <Box style={{
                width: tokens.spacing[8], height: tokens.spacing[8],
                borderRadius: tokens.borderRadius.full,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: avatarScale[100], color: avatarScale[700],
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                flexShrink: 0,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${avatarScale[200]}`,
              }}>
                {entry.avatar ? (
                  <img src={entry.avatar} alt={entry.name} style={{
                    width: '100%', height: '100%',
                    borderRadius: tokens.borderRadius.full, objectFit: 'cover' as const,
                  }} />
                ) : getInitials(entry.name)}
              </Box>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isTop3 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                }}>
                  {entry.name}
                </Text>
                {entry.badge && (
                  <Box style={{
                    ...createBadgeStyle(tokens, 'secondary'),
                    marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs,
                  }}>
                    {entry.badge}
                  </Box>
                )}
              </Box>

              {entry.trend && (
                <Text style={{
                  fontSize: tokens.typography.fontSize.md, color: trendInfo.color,
                  fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0,
                }}>
                  {trendInfo.symbol}
                </Text>
              )}

              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: isTop3 ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                flexShrink: 0, minWidth: tokens.spacing[10], textAlign: 'right' as const,
              }}>
                {entry.value}
                {unit && (
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.normal, marginLeft: tokens.spacing[1],
                  }}>
                    {unit}
                  </Text>
                )}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
