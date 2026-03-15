'use client';

/**
 * BhVoiceDebrief - Compact Preset
 * Small dashboard widget showing recent voice debrief sessions.
 * Includes session list with sentiment indicators, play controls,
 * key moment counts, and transcript availability.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhVoiceDebriefProps, VoiceDebriefSession } from '../../core';
import { n, getSentimentColor, formatSessionDuration } from '../../core';
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
  createStatusDotStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Mic,
  Play,
  FileText,
  ArrowRight,
  Clock,
  Bookmark,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhVoiceDebrief = createPreset<BhVoiceDebriefProps>({
  name: 'BhVoiceDebrief.Compact',
  render: (ctx: PresetContext<BhVoiceDebriefProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      sessions = [],
      loading,
      onPlaySession,
      onViewTranscript,
      maxDisplay = 3,
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

    const sessionList = Array.isArray(sessions) ? sessions : [];
    const displaySessions = sessionList.slice(0, maxDisplay);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading voice debriefs">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '30%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Voice Debriefs"
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
              <Mic size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Voice Debriefs
            </Text>
          </Box>
          {sessionList.length > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {sessionList.length} recent
              </Text>
            </Box>
          )}
        </Box>

        {/* Session list */}
        {displaySessions.length > 0 && (
          <Box role="list" aria-label="Recent debrief sessions" style={{
            display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
          }}>
            {displaySessions.map((session, idx) => {
              const sessionEntrance = createEntranceAnimation(t, { index: idx });
              const sentimentColor = getSentimentColor(session.overallSentiment, t);
              const recordedDate = typeof session.recordedAt === 'string'
                ? new Date(session.recordedAt) : session.recordedAt;

              return (
                <Box
                  key={session.interviewId}
                  role="listitem"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.neutral[50],
                    border: `1px solid ${t.colors.neutral[100]}`,
                    transition: `all ${t.motion.hover}`,
                    ...sessionEntrance.animate,
                  }}
                >
                  {/* Left: sentiment dot + info */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flex: 1, minWidth: 0 }}>
                    <Box style={createStatusDotStyle(t, sentimentColor)} aria-label={`Sentiment: ${session.overallSentiment}`} />
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2, flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {session.interviewTitle}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {session.candidateName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          &middot;
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            {formatSessionDuration(session.duration)}
                          </Text>
                        </Box>
                        {session.keyMoments.length > 0 && (
                          <>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              &middot;
                            </Text>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Bookmark size={ICON_SIZES.inline} color={t.colors.warningScale[500]} aria-hidden="true" />
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                                {session.keyMoments.length}
                              </Text>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Right: actions */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                    {session.transcriptAvailable && onViewTranscript && (
                      <Box
                        {...clickableProps(() => onViewTranscript(session.interviewId), `View transcript: ${session.interviewTitle}`)}
                        onClick={() => onViewTranscript(session.interviewId)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[100],
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <FileText size={ICON_SIZES.label} color={t.colors.neutral[600]} aria-hidden="true" />
                      </Box>
                    )}
                    {onPlaySession && (
                      <Box
                        {...clickableProps(() => onPlaySession(session.interviewId), `Play debrief: ${session.interviewTitle}`)}
                        onClick={() => onPlaySession(session.interviewId)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.primaryScale[50],
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Play size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Empty state */}
        {sessionList.length === 0 && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Mic size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No voice debriefs yet
            </Text>
          </Box>
        )}

        {/* View All link */}
        {onViewTranscript && sessionList.length > maxDisplay && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View all voice debriefs"
            onClick={() => onViewTranscript('all')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewTranscript('all'); }
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
