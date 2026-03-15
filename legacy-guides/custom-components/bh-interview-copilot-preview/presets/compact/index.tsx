'use client';

/**
 * BhInterviewCopilotPreview - Compact Preset
 * Small dashboard widget showing interviewer copilot stats at a glance.
 * Includes average effectiveness score, mini talk-time trend,
 * recent session links, and a "View All" action.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type {
  BhInterviewCopilotPreviewProps,
  RecentCopilotSession,
} from '../../core';
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
  createTrendStyle,
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
  ArrowRight,
  BarChart3,
  MessageSquare,
  Users,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhInterviewCopilotPreview = createPreset<BhInterviewCopilotPreviewProps>({
  name: 'BhInterviewCopilotPreview.Compact',
  render: (ctx: PresetContext<BhInterviewCopilotPreviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      recentSessions = [],
      avgEffectiveness,
      talkTimeAvg,
      totalSessions,
      onViewAll,
      onSessionClick,
      loading,
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

    const sessions = Array.isArray(recentSessions) ? recentSessions : [];

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading copilot preview">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '40%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Coaching Copilot"
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
              Coaching Copilot
            </Text>
          </Box>
          {totalSessions !== undefined && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{totalSessions} sessions</Text>
            </Box>
          )}
        </Box>

        {/* Key stat: Average effectiveness */}
        {avgEffectiveness !== undefined && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            <Text style={createStatValueStyle(t, { size: '2xl' })}>
              {Math.round(n(avgEffectiveness))}
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Avg Effectiveness
              </Text>
              <Box style={{
                ...createBadgeStyle(t, n(avgEffectiveness) >= 70 ? 'success' : n(avgEffectiveness) >= 50 ? 'warning' : 'error'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {n(avgEffectiveness) >= 70 ? 'Great' : n(avgEffectiveness) >= 50 ? 'Improving' : 'Needs Work'}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Mini talk-time trend */}
        {talkTimeAvg && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Talk Time Avg</Text>
            <Box style={{
              display: 'flex', height: 16, borderRadius: t.borderRadius.md,
              overflow: 'hidden', backgroundColor: t.colors.neutral[100],
              marginBottom: t.spacing[2],
            }}>
              <Box style={{
                width: `${n(talkTimeAvg.interviewerPercent)}%`,
                backgroundColor: t.colors.primaryScale[400],
              }} />
              <Box style={{
                width: `${n(talkTimeAvg.candidatePercent)}%`,
                backgroundColor: t.colors.successScale[400],
              }} />
              <Box style={{
                width: `${n(talkTimeAvg.silencePercent)}%`,
                backgroundColor: t.colors.neutral[200],
              }} />
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                You: {n(talkTimeAvg.interviewerPercent)}% | Candidate: {n(talkTimeAvg.candidatePercent)}%
              </Text>
              {talkTimeAvg.trend !== 0 && (() => {
                const trendInfo = createTrendStyle(t, talkTimeAvg.trend);
                const TrendIcon = talkTimeAvg.trend > 0 ? TrendingUp : TrendingDown;
                return (
                  <Box style={trendInfo.container}>
                    <TrendIcon size={ICON_SIZES.inline} color={trendInfo.color} aria-hidden="true" />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: trendInfo.color }}>
                      {Math.abs(talkTimeAvg.trend)}%
                    </Text>
                  </Box>
                );
              })()}
            </Box>
          </Box>
        )}

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <Box>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Sessions</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {sessions.slice(0, 3).map((session, idx) => {
                const sessionEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box
                    key={session.id}
                    {...(onSessionClick ? clickableProps(() => onSessionClick(session.id), `View session: ${session.interviewTitle ?? session.candidateName ?? session.id}`) : {})}
                    onClick={onSessionClick ? () => onSessionClick(session.id) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      cursor: onSessionClick ? 'pointer' : 'default',
                      transition: `all ${t.motion.hover}`,
                      ...sessionEntrance.animate,
                    }}
                  >
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                      }}>
                        {session.interviewTitle ?? session.candidateName ?? 'Session'}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {formatDate(session.date)} &middot; {session.whisperCount} whispers
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        ...createBadgeStyle(t, session.effectiveness >= 70 ? 'success' : session.effectiveness >= 50 ? 'warning' : 'error'),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{Math.round(session.effectiveness)}</Text>
                      </Box>
                      {onSessionClick && (
                        <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {sessions.length === 0 && avgEffectiveness === undefined && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Sparkles size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No copilot sessions yet
            </Text>
          </Box>
        )}

        {/* View All link */}
        {onViewAll && sessions.length > 0 && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View all copilot sessions"
            onClick={onViewAll}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewAll(); }
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
              View All
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
