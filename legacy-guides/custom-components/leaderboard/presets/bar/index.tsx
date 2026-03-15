'use client';

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { LeaderboardProps } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createProgressBarStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createHoverStyle,
  getHoverTransform,
} from '../../../helpers';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRankBadgeColor(rank: number): 'warning' | 'secondary' | 'primary' {
  if (rank === 1) return 'warning';
  if (rank === 2) return 'secondary';
  if (rank === 3) return 'warning';
  return 'primary';
}

function getRankLabel(rank: number): string {
  if (rank <= 3) return ['1st', '2nd', '3rd'][rank - 1];
  return `#${rank}`;
}

function getTrendArrow(trend?: 'up' | 'down' | 'neutral'): string {
  if (trend === 'up') return '\u2191';
  if (trend === 'down') return '\u2193';
  return '\u2192';
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const Bar = createPreset<LeaderboardProps>((context: PresetContext<LeaderboardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Spinner } = primitives;
  const { entries, title, maxEntries = 10, unit, className, style } = props;

  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading] = useState(false);

  const displayEntries = entries.slice(0, maxEntries);
  const maxValue = Math.max(...displayEntries.map(e => typeof e.value === 'number' ? e.value : 0), 1);

  /* -- memoised styles -------------------------------------------- */

  const cardStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
    overflow: 'hidden', padding: 0, ...style,
  }), [tokens, isGlass, style]);

  const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
  const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);
  const hoverTransform = useMemo(() => getHoverTransform(tokens), [tokens]);
  const countBadge = useMemo(() => createBadgeStyle(tokens, 'primary'), [tokens]);

  /* -- loading state ---------------------------------------------- */

  if (isLoading) {
    return (
      <Box className={className} style={cardStyle}>
        <Box style={accentBar} />
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing[8] }}>
          <Spinner size="sm" />
        </Box>
      </Box>
    );
  }

  /* -- render ----------------------------------------------------- */

  return (
    <Box className={className} style={cardStyle}>
      <Box style={accentBar} />

      {/* Panel header */}
      <Box style={{
        ...panelHeader, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
          {title || 'Leaderboard'}
        </Text>
        <Text style={countBadge}>
          {displayEntries.length} {displayEntries.length === 1 ? 'entry' : 'entries'}
        </Text>
      </Box>

      {/* Entries list */}
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        {displayEntries.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          const numValue = typeof entry.value === 'number' ? entry.value : 0;
          const percentage = maxValue > 0 ? (numValue / maxValue) * 100 : 0;
          const isHovered = hoveredIndex === index;
          const listItem = createListItemStyle(tokens, { interactive: true });

          const rowStyle: React.CSSProperties = {
            ...listItem, ...hoverBase, display: 'flex', flexDirection: 'column',
            gap: tokens.spacing[2], padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent',
            transform: isHovered ? hoverTransform.transform : 'none',
          };

          const initial = entry.name.charAt(0).toUpperCase();
          const avatarStyle: React.CSSProperties = {
            width: tokens.spacing[9], height: tokens.spacing[9],
            borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100],
            color: tokens.colors.primaryScale[700], display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0,
          };

          /* Rank badge with medal accent for top 3 */
          const rankBadge = createBadgeStyle(tokens, getRankBadgeColor(rank));
          const rankStyle: React.CSSProperties = {
            ...rankBadge, minWidth: tokens.spacing[8], justifyContent: 'center',
            fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.xs,
          };
          if (rank <= 3) {
            const medalColors = [tokens.colors.warningScale[500], tokens.colors.neutral[400], tokens.colors.warningScale[700]];
            rankStyle.boxShadow = `0 0 0 ${tokens.surface.borderWidth || '1px'} ${medalColors[rank - 1]}`;
          }

          const fillColor = rank <= 3 ? tokens.colors.primaryScale[500] : tokens.colors.primaryScale[300];
          const progress = createProgressBarStyle(tokens, { percent: percentage, color: fillColor });

          return (
            <Box key={index} style={rowStyle}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Top row: rank + avatar + name + value */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Text style={rankStyle}>{getRankLabel(rank)}</Text>

                {entry.avatar ? (
                  <Box style={{ ...avatarStyle, backgroundImage: `url(${entry.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <Box style={avatarStyle}><Text>{initial}</Text></Box>
                )}

                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacing[2], minWidth: 0 }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {entry.name}
                  </Text>
                  {entry.badge && <Text style={createBadgeStyle(tokens, 'info')}>{entry.badge}</Text>}
                </Box>

                <Text style={{
                  fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[700], whiteSpace: 'nowrap',
                }}>
                  {entry.value}{unit}
                </Text>

                {entry.trend && (
                  <Text style={{
                    ...createBadgeStyle(tokens, entry.trend === 'up' ? 'success' : entry.trend === 'down' ? 'error' : 'secondary'),
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                  }}>
                    {getTrendArrow(entry.trend)}
                  </Text>
                )}
              </Box>

              {/* Progress bar */}
              <Box style={{ paddingLeft: `calc(${tokens.spacing[8]} + ${tokens.spacing[9]} + ${tokens.spacing[3]} * 2)` }}>
                <Box style={progress.track}>
                  <Box style={progress.fill} />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
