'use client';

/**
 * BhInterviewQuality - Compact Preset
 * Dashboard widget showing interview quality with circular gauge,
 * peer ranking, dimension bars, and recent interview cards.
 * Full token-driven styling, personality-aware, glass surfaces.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhInterviewQualityProps } from '../../core';
import { n, getQualityScoreColor, getQualityBadgeColor } from '../../core';
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
  createProgressBarStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDate,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Trophy,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Quality Ring SVG                                                    */
/* ------------------------------------------------------------------ */

function QualityRing({
  score,
  color,
  trackColor,
  size = 80,
}: {
  score: number;
  color: string;
  trackColor: string;
  size?: number;
}) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, n(score)));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhInterviewQuality = createPreset<BhInterviewQualityProps>({
  name: 'BhInterviewQuality.Compact',
  render: (ctx: PresetContext<BhInterviewQualityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewInterview,
      onViewAll,
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
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading interview quality">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ display: 'flex', gap: t.spacing[3] }}>
            <Box style={{ ...skeletonStyle, height: 80, width: 80, borderRadius: t.borderRadius.full }} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2], flex: 1 }}>
              <Box style={{ ...skeletonStyle, height: 16, width: '60%' }} />
              <Box style={{ ...skeletonStyle, height: 16, width: '40%' }} />
            </Box>
          </Box>
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Derived data ------------------------------------------------- */
    const overallScore = n(data?.overallScore);
    const ringColor = data ? getQualityScoreColor(overallScore, t) : t.colors.neutral[300];
    const dimensions = data?.dimensions?.slice(0, 5) ?? [];
    const recentInterviews = data?.recentInterviews?.slice(0, 2) ?? [];

    /* -- Shortened dimension names ------------------------------------ */
    const shortDimName = (name: string): string => {
      const map: Record<string, string> = {
        'Candidate Experience': 'Candidate Exp.',
        'Rubric Adherence': 'Rubric',
        'Time Management': 'Time Mgmt',
      };
      return map[name] ?? name;
    };

    /* -- Trend icon --------------------------------------------------- */
    const TrendIcon = data?.trend === 'improving'
      ? TrendingUp
      : data?.trend === 'declining'
        ? TrendingDown
        : Minus;

    const trendColor = data?.trend === 'improving'
      ? t.colors.successScale[600]
      : data?.trend === 'declining'
        ? t.colors.errorScale[600]
        : t.colors.neutral[400];

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Interview Quality"
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
              <Sparkles size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Interview Quality
            </Text>
          </Box>
        </Box>

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Sparkles size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No quality data available yet
            </Text>
          </Box>
        )}

        {data && (
          <>
            {/* Overall score ring + stats */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[4],
              marginBottom: t.spacing[4],
            }}>
              {/* Ring gauge */}
              <Box style={{ position: 'relative' as const, width: 80, height: 80, flexShrink: 0 }}>
                <QualityRing
                  score={overallScore}
                  color={ringColor}
                  trackColor={t.colors.neutral[100]}
                  size={80}
                />
                <Box style={{
                  position: 'absolute' as const,
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column' as const,
                }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xl,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    lineHeight: 1,
                  }}>
                    {Math.round(overallScore)}
                  </Text>
                </Box>
              </Box>

              {/* Side stats */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {/* Interviews this month */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[800],
                  }}>
                    {n(data.interviewsThisMonth)} interviews
                  </Text>
                  <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                    this month
                  </Text>
                </Box>
                {/* Trend */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
                    {data.trend === 'improving' ? 'Improving' : data.trend === 'declining' ? 'Declining' : 'Stable'}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Peer ranking */}
            {data.rankAmongPeers > 0 && data.totalPeers > 0 && (
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[50],
                border: `1px solid ${t.colors.primaryScale[100]}`,
                marginBottom: t.spacing[4],
              }}>
                <Trophy size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.primaryScale[700],
                }}>
                  Rank #{n(data.rankAmongPeers)} of {n(data.totalPeers)}
                </Text>
                {/* Position indicator bar */}
                <Box style={{ flex: 1 }}>
                  <Box style={{
                    height: 4,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[100],
                    position: 'relative' as const,
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      position: 'absolute' as const,
                      left: `${Math.max(0, Math.min(100, ((data.totalPeers - data.rankAmongPeers) / data.totalPeers) * 100)) - 3}%`,
                      top: -2,
                      width: 8,
                      height: 8,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[500],
                    }} />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Dimension bars (5 horizontal bars) */}
            {dimensions.length > 0 && (
              <Box style={{ marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Dimensions</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {dimensions.map((dim) => {
                    const dimScore = n(dim.score);
                    const dimColor = getQualityScoreColor(dimScore, t);
                    const bar = createProgressBarStyle(t, {
                      color: dimColor,
                      percent: dimScore,
                    });
                    return (
                      <Box key={dim.name}>
                        <Box style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 2,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[600],
                          }}>
                            {shortDimName(dim.name)}
                          </Text>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[700],
                          }}>
                            {Math.round(dimScore)}
                          </Text>
                        </Box>
                        <Box style={{ ...bar.track, height: 5 }}>
                          <Box style={bar.fill} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Recent 2 interviews */}
            {recentInterviews.length > 0 && (
              <Box style={{ marginBottom: t.spacing[3] }}>
                <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Reviews</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {recentInterviews.map((interview, idx) => {
                    const itemEntrance = createEntranceAnimation(t, { index: idx });
                    const scoreBadgeColor = getQualityBadgeColor(interview.score);
                    return (
                      <Box
                        key={interview.interviewId}
                        {...(onViewInterview ? clickableProps(() => onViewInterview(interview.interviewId), `View interview with ${interview.candidateName}`) : {})}
                        onClick={onViewInterview ? () => onViewInterview(interview.interviewId) : undefined}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          border: `1px solid ${t.colors.neutral[100]}`,
                          cursor: onViewInterview ? 'pointer' : 'default',
                          transition: `all ${t.motion.hover}`,
                          ...itemEntrance.animate,
                        }}
                      >
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2, flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[800],
                          }}>
                            {interview.candidateName}
                          </Text>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[400],
                          }}>
                            {formatDate(interview.date)}
                          </Text>
                          {interview.highlights?.[0] && (
                            <Text style={{
                              fontSize: t.typography.fontSize.xs,
                              color: t.colors.neutral[500],
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap' as const,
                              marginTop: 2,
                            }}>
                              {interview.highlights[0]}
                            </Text>
                          )}
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                          <Box style={{
                            ...createBadgeStyle(t, scoreBadgeColor),
                            borderRadius: badgeRadius,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>{Math.round(n(interview.score))}</Text>
                          </Box>
                          {onViewInterview && (
                            <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* View All Reviews link */}
            {onViewAll && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="View all interview reviews"
                onClick={onViewAll}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewAll(); }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: t.spacing[1],
                  marginTop: t.spacing[2],
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
                  View All Reviews
                </Text>
                <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
              </Box>
            )}
          </>
        )}

        </Box>
      </div>
    );
  },
});
