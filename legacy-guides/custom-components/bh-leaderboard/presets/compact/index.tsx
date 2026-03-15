'use client';

/**
 * BhLeaderboard - Compact Preset
 * Small dashboard widget showing top 5 recruiter rankings.
 * Features rank medals (gold/silver/bronze), score display,
 * hire counts, change arrows, streak indicators, and current user highlight.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhLeaderboardProps, LeaderboardEntry } from '../../core';
import { n } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ChevronRight,
  Award,
  Flame,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Rank Medal Component (uses raw <div> since it's outside render)     */
/* ------------------------------------------------------------------ */

function RankMedal({ rank, tokens: t }: { rank: number; tokens: any }) {
  const baseStyle = {
    width: 24, height: 24, borderRadius: t.borderRadius.full,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  if (rank === 1) {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: t.colors.warningScale[100],
        border: `1px solid ${t.colors.warningScale[300]}`,
      }}>
        <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.warningScale[700] }}>1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: t.colors.neutral[100],
        border: `1px solid ${t.colors.neutral[300]}`,
      }}>
        <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[600] }}>2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: t.colors.warningScale[50],
        border: `1px solid ${t.colors.warningScale[200]}`,
      }}>
        <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.warningScale[700] }}>3</span>
      </div>
    );
  }
  return (
    <div style={baseStyle}>
      <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[500] }}>{rank}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhLeaderboard = createPreset<BhLeaderboardProps>({
  name: 'BhLeaderboard.Compact',
  render: (ctx: PresetContext<BhLeaderboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      entries = [],
      currentUserId,
      loading,
      onViewProfile,
      period = 'month',
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const entryList = Array.isArray(entries) ? entries : [];
    const top5 = entryList.slice(0, 5);

    const periodLabel = period === 'week' ? 'This Week'
      : period === 'quarter' ? 'This Quarter' : 'This Month';

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading leaderboard">
          <Box style={{ ...skeletonStyle, height: 20, width: '50%' }} />
          {[0, 1, 2, 3, 4].map(i => (
            <Box key={i} style={{ ...skeletonStyle, height: 40, width: '100%' }} />
          ))}
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Recruiter Leaderboard"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

        {/* Title row */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <Trophy size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Leaderboard
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'secondary'),
            borderRadius: badgeRadius,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{periodLabel}</Text>
          </Box>
        </Box>

        {/* Entries list */}
        {top5.length > 0 && (
          <Box role="list" aria-label="Top recruiters" style={{
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
          }}>
            {top5.map((entry, idx) => {
              const isCurrentUser = currentUserId && entry.recruiterId === currentUserId;
              const entryEntrance = createEntranceAnimation(t, { index: idx });
              const changeColor = entry.change > 0 ? t.colors.successScale[600]
                : entry.change < 0 ? t.colors.errorScale[600] : t.colors.neutral[400];
              const ChangeIcon = entry.change > 0 ? TrendingUp
                : entry.change < 0 ? TrendingDown : Minus;

              return (
                <Box
                  key={entry.recruiterId}
                  role="listitem"
                  {...(onViewProfile ? clickableProps(() => onViewProfile(entry.recruiterId), `View profile: ${entry.recruiterName}`) : {})}
                  onClick={onViewProfile ? () => onViewProfile(entry.recruiterId) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: isCurrentUser ? t.colors.primaryScale[50] : 'transparent',
                    border: isCurrentUser ? `1px solid ${t.colors.primaryScale[200]}` : '1px solid transparent',
                    cursor: onViewProfile ? 'pointer' : 'default',
                    transition: `all ${t.motion.hover}`,
                    ...entryEntrance.animate,
                  }}
                >
                  {/* Rank */}
                  <RankMedal rank={entry.rank} tokens={t} />

                  {/* Avatar */}
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt=""
                      style={{
                        width: 28, height: 28,
                        borderRadius: t.borderRadius.full,
                        objectFit: 'cover' as const,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box style={{
                      width: 28, height: 28,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.primaryScale[700],
                      }}>
                        {entry.recruiterName.charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                  )}

                  {/* Name + hires */}
                  <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: isCurrentUser ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {entry.recruiterName}
                      {isCurrentUser && (
                        <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[600], marginLeft: 4 }}>
                          (You)
                        </span>
                      )}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {n(entry.hires)} hires
                    </Text>
                  </Box>

                  {/* Streak */}
                  {entry.streak && n(entry.streak) > 0 && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Flame size={ICON_SIZES.inline} color={t.colors.warningScale[500]} aria-hidden="true" />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600], fontWeight: t.typography.fontWeight.medium }}>
                        {n(entry.streak)}
                      </Text>
                    </Box>
                  )}

                  {/* Score + change */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[900],
                    }}>
                      {n(entry.score)}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ChangeIcon size={ICON_SIZES.inline} color={changeColor} aria-hidden="true" />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: changeColor }}>
                        {Math.abs(n(entry.change))}
                      </Text>
                    </Box>
                  </Box>

                  {onViewProfile && (
                    <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Empty state */}
        {top5.length === 0 && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Trophy size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No leaderboard data yet
            </Text>
          </Box>
        )}

        {/* View Full Board link */}
        {onViewProfile && top5.length > 0 && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View full leaderboard"
            onClick={() => onViewProfile('all')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewProfile('all'); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[3],
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.primaryScale[600],
            }}>
              View Full Board
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
