'use client';

/**
 * BhQuestionEffectiveness - Compact Preset
 * Dashboard widget showing question effectiveness with gauges, top/worst
 * questions, and dimension breakdowns. Full token-driven styling,
 * personality-aware typography, glass surfaces, and entrance animations.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhQuestionEffectivenessProps } from '../../core';
import { n, getEffectivenessColor, getEffectivenessBadgeColor } from '../../core';
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
  createStatValueStyle,
  createStatLabelStyle,
  createTrendStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Effectiveness Arc SVG                                              */
/* ------------------------------------------------------------------ */

function EffectivenessArc({
  score,
  color,
  trackColor,
  size = 64,
}: {
  score: number;
  color: string;
  trackColor: string;
  size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = Math.min(100, Math.max(0, n(score)));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size / 2 + 4}
      viewBox={`0 0 ${size} ${size / 2 + 4}`}
      aria-hidden="true"
    >
      {/* Track */}
      <path
        d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`}
        fill="none"
        stroke={trackColor}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={6}
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

export const CompactBhQuestionEffectiveness = createPreset<BhQuestionEffectivenessProps>({
  name: 'BhQuestionEffectiveness.Compact',
  render: (ctx: PresetContext<BhQuestionEffectivenessProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewQuestion,
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
        }} role="status" aria-label="Loading question effectiveness">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '50%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
        </Box>
      );
    }

    /* -- Derived data ------------------------------------------------- */
    const topQuestions = data?.topQuestions?.slice(0, 3) ?? [];
    const worstQuestion = data?.worstQuestions?.[0];
    const dimensions = data?.dimensionBreakdown?.slice(0, 4) ?? [];
    const avgScore = n(data?.avgEffectiveness);
    const arcColor = data ? getEffectivenessColor(avgScore, t) : t.colors.neutral[300];

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
        aria-label="Question Effectiveness"
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
              <ClipboardCheck size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Question Effectiveness
            </Text>
          </Box>
          {data && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {n(data.totalQuestionsUsed)} used
              </Text>
            </Box>
          )}
        </Box>

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <ClipboardCheck size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No question data available yet
            </Text>
          </Box>
        )}

        {data && (
          <>
            {/* Avg effectiveness gauge + trend */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[3],
              marginBottom: t.spacing[4],
            }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                <EffectivenessArc
                  score={avgScore}
                  color={arcColor}
                  trackColor={t.colors.neutral[100]}
                  size={72}
                />
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.neutral[900],
                  marginTop: -4,
                }}>
                  {Math.round(avgScore)}%
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                  Avg Effectiveness
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
                    {data.trend === 'improving' ? 'Improving' : data.trend === 'declining' ? 'Declining' : 'Stable'}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Top 3 effective questions */}
            {topQuestions.length > 0 && (
              <Box style={{ marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Top Questions</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {topQuestions.map((q, idx) => {
                    const itemEntrance = createEntranceAnimation(t, { index: idx });
                    const barProgress = createProgressBarStyle(t, {
                      color: t.colors.successScale[400],
                      percent: n(q.effectiveness),
                    });
                    return (
                      <Box
                        key={q.questionId}
                        {...(onViewQuestion ? clickableProps(() => onViewQuestion(q.questionId), `View question: ${q.text}`) : {})}
                        onClick={onViewQuestion ? () => onViewQuestion(q.questionId) : undefined}
                        style={{
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          border: `1px solid ${t.colors.neutral[100]}`,
                          cursor: onViewQuestion ? 'pointer' : 'default',
                          transition: `all ${t.motion.hover}`,
                          ...itemEntrance.animate,
                        }}
                      >
                        <Box style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: t.spacing[1],
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[800],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                            maxWidth: '60%',
                          }}>
                            {q.text}
                          </Text>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <Box style={{
                              ...createBadgeStyle(t, 'info'),
                              borderRadius: badgeRadius,
                              padding: `0 ${t.spacing[1]}px`,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>{q.dimension}</Text>
                            </Box>
                            {onViewQuestion && (
                              <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                            )}
                          </Box>
                        </Box>
                        <Box style={barProgress.track}>
                          <Box style={barProgress.fill} />
                        </Box>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          color: t.colors.neutral[500],
                          marginTop: t.spacing[1],
                        }}>
                          {Math.round(n(q.effectiveness))}% effective &middot; {n(q.timesUsed)} uses
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Worst question - Needs Review */}
            {worstQuestion && (
              <Box style={{
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.warningScale[50],
                border: `1px solid ${t.colors.warningScale[200]}`,
                marginBottom: t.spacing[4],
                cursor: onViewQuestion ? 'pointer' : 'default',
                transition: `all ${t.motion.hover}`,
              }}
                {...(onViewQuestion ? clickableProps(() => onViewQuestion(worstQuestion.questionId), `Review question: ${worstQuestion.text}`) : {})}
                onClick={onViewQuestion ? () => onViewQuestion(worstQuestion.questionId) : undefined}
              >
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  marginBottom: t.spacing[1],
                }}>
                  <AlertTriangle size={ICON_SIZES.label} color={t.colors.warningScale[600]} aria-hidden="true" />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.warningScale[700],
                  }}>
                    Needs Review
                  </Text>
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  color: t.colors.warningScale[800],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                }}>
                  {worstQuestion.text}
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.warningScale[600],
                  marginTop: t.spacing[1],
                }}>
                  {Math.round(n(worstQuestion.effectiveness))}% effective &middot; {worstQuestion.dimension}
                </Text>
              </Box>
            )}

            {/* Dimension breakdown - mini horizontal bars */}
            {dimensions.length > 0 && (
              <Box style={{ marginBottom: t.spacing[3] }}>
                <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>By Dimension</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                  {dimensions.map((dim) => {
                    const dimColor = getEffectivenessColor(dim.effectiveness, t);
                    const dimBar = createProgressBarStyle(t, {
                      color: dimColor,
                      percent: n(dim.effectiveness),
                    });
                    return (
                      <Box key={dim.dimension}>
                        <Box style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 2,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[600],
                          }}>
                            {dim.dimension}
                          </Text>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[700],
                          }}>
                            {Math.round(n(dim.effectiveness))}%
                          </Text>
                        </Box>
                        <Box style={{ ...dimBar.track, height: 4 }}>
                          <Box style={dimBar.fill} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* View All Questions link */}
            {onViewAll && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="View all questions"
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
                  View All Questions
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
