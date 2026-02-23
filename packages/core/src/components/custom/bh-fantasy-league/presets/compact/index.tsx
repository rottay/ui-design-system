'use client';

/**
 * BhFantasyLeague - Compact Preset
 * Small dashboard widget showing fantasy recruiting league stats.
 * Features rank badge, score progress bar, streak counter,
 * recent predictions with correct/wrong indicators, and deadline countdown.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhFantasyLeagueProps, FantasyPrediction } from '../../core';
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
  createProgressBarStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Trophy,
  Flame,
  Check,
  X,
  Clock,
  ArrowRight,
  Gamepad2,
  Target,
  TrendingUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Prediction badge color helper                                       */
/* ------------------------------------------------------------------ */

function getPredictionBadgeVariant(prediction: string): 'success' | 'error' | 'warning' {
  switch (prediction) {
    case 'hire': return 'success';
    case 'pass': return 'error';
    case 'offer': return 'warning';
    default: return 'warning';
  }
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhFantasyLeague = createPreset<BhFantasyLeagueProps>({
  name: 'BhFantasyLeague.Compact',
  render: (ctx: PresetContext<BhFantasyLeagueProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onMakePrediction,
      onViewLeague,
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
        }} role="status" aria-label="Loading fantasy league">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ display: 'flex', gap: t.spacing[3] }}>
            <Box style={{ ...skeletonStyle, height: 48, width: '30%' }} />
            <Box style={{ ...skeletonStyle, height: 48, width: '30%' }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 44, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 44, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 44, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Gamepad2 size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No fantasy league data
            </Text>
          </Box>
        </Box>
      );
    }

    const scorePct = n(data.topScore) > 0
      ? Math.round((n(data.userScore) / n(data.topScore)) * 100) : 0;
    const scoreBar = createProgressBarStyle(t, { percent: scorePct });
    const recentPredictions = (data.recentPredictions || []).slice(0, 3);

    const deadline = data.nextPredictionDeadline
      ? (typeof data.nextPredictionDeadline === 'string'
        ? new Date(data.nextPredictionDeadline) : data.nextPredictionDeadline)
      : null;
    const hasDeadline = deadline && !isNaN(deadline.getTime());

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Fantasy League"
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
              Fantasy League
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'secondary'),
            borderRadius: badgeRadius,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>
              Round {n(data.currentRound)}/{n(data.totalRounds)}
            </Text>
          </Box>
        </Box>

        {/* Rank + Score row */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[4],
          marginBottom: t.spacing[4],
        }}>
          {/* Rank badge */}
          <Box style={{
            display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.primaryScale[50],
            border: `1px solid ${t.colors.primaryScale[200]}`,
          }}>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primaryScale[700],
            }}>
              #{n(data.userRank)}
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.primaryScale[500],
            }}>
              of {n(data.totalParticipants)}
            </Text>
          </Box>

          {/* Score + bar */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
              <Text style={createStatValueStyle(t, { size: 'xl' })}>
                {n(data.userScore)}
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
              }}>
                / {n(data.topScore)} pts
              </Text>
            </Box>
            <Box style={scoreBar.track}>
              <Box style={scoreBar.fill} />
            </Box>
          </Box>

          {/* Streak */}
          {n(data.streakCount) > 0 && (
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              gap: 2,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Flame size={ICON_SIZES.section} color={t.colors.warningScale[500]} aria-hidden="true" />
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.warningScale[600],
                }}>
                  {n(data.streakCount)}
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
              }}>
                streak
              </Text>
            </Box>
          )}
        </Box>

        {/* Recent predictions */}
        {recentPredictions.length > 0 && (
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Predictions</Text>
            <Box role="list" aria-label="Recent predictions" style={{
              display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
            }}>
              {recentPredictions.map((pred, idx) => {
                const predEntrance = createEntranceAnimation(t, { index: idx });
                const hasResult = pred.actual !== undefined && pred.actual !== null;
                const isCorrect = hasResult && pred.correct === true;
                const isWrong = hasResult && pred.correct === false;

                return (
                  <Box
                    key={`${pred.candidateName}-${idx}`}
                    role="listitem"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      transition: `all ${t.motion.hover}`,
                      ...predEntrance.animate,
                    }}
                  >
                    {/* Candidate + prediction badge */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {pred.candidateName}
                      </Text>
                      <Box style={{
                        ...createBadgeStyle(t, getPredictionBadgeVariant(pred.prediction)),
                        borderRadius: badgeRadius,
                        flexShrink: 0,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {pred.prediction}
                        </Text>
                      </Box>
                    </Box>

                    {/* Result + points */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      {isCorrect && (
                        <Box style={{
                          width: 20, height: 20,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.successScale[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={ICON_SIZES.inline} color={t.colors.successScale[600]} aria-label="Correct" />
                        </Box>
                      )}
                      {isWrong && (
                        <Box style={{
                          width: 20, height: 20,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.errorScale[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <X size={ICON_SIZES.inline} color={t.colors.errorScale[600]} aria-label="Incorrect" />
                        </Box>
                      )}
                      {!hasResult && (
                        <Box style={{
                          width: 20, height: 20,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.neutral[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-label="Pending" />
                        </Box>
                      )}
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: isCorrect ? t.colors.successScale[600]
                          : isWrong ? t.colors.errorScale[600]
                          : t.colors.neutral[500],
                      }}>
                        {n(pred.points) > 0 ? `+${n(pred.points)}` : n(pred.points)} pts
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Deadline countdown */}
        {hasDeadline && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.warningScale[50],
            border: `1px solid ${t.colors.warningScale[200]}`,
            marginBottom: t.spacing[2],
          }}>
            <Clock size={ICON_SIZES.label} color={t.colors.warningScale[600]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.warningScale[700],
            }}>
              Next prediction due {formatDistanceToNow(deadline!, { addSuffix: true })}
            </Text>
          </Box>
        )}

        {/* Action buttons */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          marginTop: t.spacing[2],
        }}>
          {onMakePrediction && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="Make a prediction"
              onClick={onMakePrediction}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMakePrediction(); }
              }}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[600],
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Target size={ICON_SIZES.label} color={t.colors.common.white} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.common.white,
              }}>
                Play Now
              </Text>
            </Box>
          )}
          {onViewLeague && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="View full league"
              onClick={onViewLeague}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewLeague(); }
              }}
              style={{
                flex: onMakePrediction ? undefined : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
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
                View League
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}
        </Box>

        </Box>
      </div>
    );
  },
});
